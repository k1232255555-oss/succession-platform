import Stripe from "stripe";
import {
  BillingInvoiceStatus,
  BillingPlan,
  BillingSubscriptionStatus,
  type Company,
  type CompanyUser,
} from "@prisma/client";
import { canManageBilling } from "@/lib/auth";
import { getSafeAppUrl, hasEnvValue } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export type PlanLimit = number | "unlimited";

export type BillingPlanConfig = {
  plan: BillingPlan;
  name: string;
  description: string;
  priceLabel: string;
  stripePriceId?: string;
  limits: {
    users: PlanLimit;
    visibleCandidates: PlanLimit;
    scoutsPerMonth: PlanLimit;
  };
};

export function isStripeBillingEnabled() {
  return process.env.STRIPE_BILLING_ENABLED === "true";
}

export const billingPlans: BillingPlanConfig[] = [
  {
    plan: BillingPlan.FREE,
    name: "Free",
    description: "審査制プラットフォームの基本閲覧を試せるプラン。",
    priceLabel: "0円",
    limits: {
      users: 1,
      visibleCandidates: 5,
      scoutsPerMonth: 1,
    },
  },
  {
    plan: BillingPlan.STANDARD,
    name: "Standard",
    description: "小規模企業が本格的に候補者探索を始めるプラン。",
    priceLabel: "月額 Standard",
    stripePriceId: process.env.STRIPE_STANDARD_PRICE_ID?.trim() || undefined,
    limits: {
      users: 3,
      visibleCandidates: 50,
      scoutsPerMonth: 10,
    },
  },
  {
    plan: BillingPlan.PREMIUM,
    name: "Premium",
    description: "複数部門でスカウトと面談を進める成長企業向けプラン。",
    priceLabel: "月額 Premium",
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID?.trim() || undefined,
    limits: {
      users: 10,
      visibleCandidates: 200,
      scoutsPerMonth: 50,
    },
  },
  {
    plan: BillingPlan.ENTERPRISE,
    name: "Enterprise",
    description: "専任支援と高度な運用を前提にした個別契約プラン。",
    priceLabel: "個別見積",
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID?.trim() || undefined,
    limits: {
      users: "unlimited",
      visibleCandidates: "unlimited",
      scoutsPerMonth: "unlimited",
    },
  },
];

export function assertCanManageBilling(user: Pick<CompanyUser, "role">) {
  if (!canManageBilling(user)) {
    throw new Error("Billing permission denied.");
  }
}

export function getStripeMode() {
  return isStripeBillingEnabled() && hasEnvValue("STRIPE_SECRET_KEY")
    ? "configured"
    : "not_configured";
}

export function getAppUrl() {
  return getSafeAppUrl();
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
  });
}

export function getPlanConfig(plan: BillingPlan) {
  return billingPlans.find((item) => item.plan === plan) ?? billingPlans[0];
}

export function getEffectivePlanConfig(plan: BillingPlan) {
  if (isStripeBillingEnabled()) {
    return getPlanConfig(plan);
  }

  return {
    ...getPlanConfig(BillingPlan.FREE),
    description: "β期間中は無料で候補者検索、AIマッチング、スカウト、メッセージを利用できます。",
    priceLabel: "β期間中無料",
    limits: {
      users: "unlimited",
      visibleCandidates: "unlimited",
      scoutsPerMonth: "unlimited",
    },
  } satisfies BillingPlanConfig;
}

export function formatPlanLimit(value: PlanLimit) {
  return value === "unlimited" ? "無制限" : value.toLocaleString("ja-JP");
}

export function isWithinLimit(currentValue: number, limit: PlanLimit) {
  return limit === "unlimited" || currentValue < limit;
}

export function hasActiveBillingAccess(input: {
  plan: BillingPlan;
  status: BillingSubscriptionStatus;
}) {
  if (!isStripeBillingEnabled()) {
    return true;
  }

  if (input.plan === BillingPlan.FREE) {
    return true;
  }

  return (
    input.status === BillingSubscriptionStatus.ACTIVE ||
    input.status === BillingSubscriptionStatus.TRIALING
  );
}

export function getSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status | null | undefined,
) {
  switch (stripeStatus) {
    case "trialing":
      return BillingSubscriptionStatus.TRIALING;
    case "active":
      return BillingSubscriptionStatus.ACTIVE;
    case "past_due":
      return BillingSubscriptionStatus.PAST_DUE;
    case "canceled":
      return BillingSubscriptionStatus.CANCELED;
    case "unpaid":
      return BillingSubscriptionStatus.UNPAID;
    case "incomplete":
      return BillingSubscriptionStatus.INCOMPLETE;
    case "incomplete_expired":
      return BillingSubscriptionStatus.INCOMPLETE_EXPIRED;
    default:
      return BillingSubscriptionStatus.FREE;
  }
}

export function getInvoiceStatus(
  stripeStatus: Stripe.Invoice.Status | null | undefined,
) {
  switch (stripeStatus) {
    case "draft":
      return BillingInvoiceStatus.DRAFT;
    case "open":
      return BillingInvoiceStatus.OPEN;
    case "paid":
      return BillingInvoiceStatus.PAID;
    case "void":
      return BillingInvoiceStatus.VOID;
    case "uncollectible":
      return BillingInvoiceStatus.UNCOLLECTIBLE;
    default:
      return BillingInvoiceStatus.OPEN;
  }
}

export function getPlanFromPriceId(priceId?: string | null) {
  return (
    billingPlans.find((plan) => plan.stripePriceId && plan.stripePriceId === priceId)
      ?.plan ?? BillingPlan.FREE
  );
}

export async function getOrCreateStripeCustomer(input: {
  company: Company;
  user: Pick<CompanyUser, "email" | "name">;
}) {
  const stripe = getStripeClient();

  if (input.company.stripeCustomerId) {
    return input.company.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: input.user.email,
    name: input.company.name,
    metadata: {
      companyId: input.company.id,
      companySlug: input.company.slug,
      ownerName: input.user.name,
    },
  });

  await prisma.company.update({
    where: {
      id: input.company.id,
    },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end ?? null;
  const plan = getPlanFromPriceId(priceId);

  return prisma.company.updateMany({
    where: {
      stripeCustomerId: customerId,
    },
    data: {
      billingPlan: plan,
      billingStatus: getSubscriptionStatus(subscription.status),
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      subscriptionCurrentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
    },
  });
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  if (invoice.parent?.type !== "subscription_details") {
    return null;
  }

  const subscription = invoice.parent.subscription_details?.subscription;

  if (!subscription) {
    return null;
  }

  return typeof subscription === "string" ? subscription : subscription.id;
}

export async function recordInvoiceFromStripe(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;

  if (!customerId) {
    return null;
  }

  const company = await prisma.company.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!company) {
    return null;
  }

  const subscriptionId = getInvoiceSubscriptionId(invoice);

  return prisma.billingInvoice.upsert({
    where: {
      stripeInvoiceId: invoice.id,
    },
    create: {
      companyId: company.id,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      number: invoice.number,
      status: getInvoiceStatus(invoice.status),
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      number: invoice.number,
      status: getInvoiceStatus(invoice.status),
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
    },
  });
}
