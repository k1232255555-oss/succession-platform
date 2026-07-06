import { NextResponse } from "next/server";
import Stripe from "stripe";
import { AuditAction, BillingSubscriptionStatus } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import {
  getPlanFromPriceId,
  getStripeClient,
  recordInvoiceFromStripe,
  syncSubscriptionFromStripe,
} from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function markEventProcessed(input: {
  event: Stripe.Event;
  companyId?: string | null;
}) {
  try {
    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: input.event.id,
        type: input.event.type,
        companyId: input.companyId,
      },
    });

    return true;
  } catch {
    return false;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const companyId = session.client_reference_id ?? session.metadata?.companyId;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!companyId || !customerId) {
    return null;
  }

  const stripe = getStripeClient();
  let priceId: string | null = null;

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    priceId = subscription.items.data[0]?.price.id ?? null;

    await syncSubscriptionFromStripe(subscription);
  }

  const company = await prisma.company.update({
    where: {
      id: companyId,
    },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId ?? undefined,
      stripePriceId: priceId,
      billingPlan: getPlanFromPriceId(priceId),
    },
  });

  await writeAuditLog({
    action: AuditAction.STRIPE_CUSTOMER_LINKED,
    companyId: company.id,
    metadata: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripeCheckoutSessionId: session.id,
    },
  });

  return company.id;
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const company = await prisma.company.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!company) {
    return null;
  }

  await syncSubscriptionFromStripe(subscription);

  await writeAuditLog({
    action: AuditAction.BILLING_SUBSCRIPTION_UPDATED,
    companyId: company.id,
    metadata: {
      stripeSubscriptionId: subscription.id,
      stripeStatus: subscription.status,
    },
  });

  return company.id;
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const company = await prisma.company.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!company) {
    return null;
  }

  await prisma.company.update({
    where: {
      id: company.id,
    },
    data: {
      billingStatus: BillingSubscriptionStatus.CANCELED,
      stripeSubscriptionId: null,
      subscriptionCurrentPeriodEnd: null,
    },
  });

  await writeAuditLog({
    action: AuditAction.BILLING_SUBSCRIPTION_UPDATED,
    companyId: company.id,
    metadata: {
      stripeSubscriptionId: subscription.id,
      stripeStatus: subscription.status,
      deleted: true,
    },
  });

  return company.id;
}

async function handleInvoiceEvent(invoice: Stripe.Invoice, paymentFailed = false) {
  const billingInvoice = await recordInvoiceFromStripe(invoice);

  if (!billingInvoice) {
    return null;
  }

  if (paymentFailed) {
    await prisma.company.update({
      where: {
        id: billingInvoice.companyId,
      },
      data: {
        billingStatus: BillingSubscriptionStatus.PAST_DUE,
      },
    });

    await writeAuditLog({
      action: AuditAction.BILLING_PAYMENT_FAILED,
      companyId: billingInvoice.companyId,
      metadata: {
        stripeInvoiceId: invoice.id,
        amountDue: invoice.amount_due,
        currency: invoice.currency,
      },
    });
  }

  return billingInvoice.companyId;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const existingEvent = await prisma.stripeWebhookEvent.findUnique({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  let companyId: string | null | undefined;

  switch (event.type) {
    case "checkout.session.completed":
      companyId = await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      companyId = await handleSubscriptionEvent(
        event.data.object as Stripe.Subscription,
      );
      break;
    case "customer.subscription.deleted":
      companyId = await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
      );
      break;
    case "invoice.created":
    case "invoice.finalized":
    case "invoice.paid":
      companyId = await handleInvoiceEvent(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      companyId = await handleInvoiceEvent(
        event.data.object as Stripe.Invoice,
        true,
      );
      break;
    default:
      companyId = null;
      break;
  }

  await markEventProcessed({
    event,
    companyId,
  });

  return NextResponse.json({ received: true });
}
