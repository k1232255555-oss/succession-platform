"use server";

import { redirect } from "next/navigation";
import {
  AuditAction,
  BillingPlan,
  BillingSubscriptionStatus,
} from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import {
  getRequestContext,
  requireSameOriginRequest,
  requireUser,
} from "@/lib/auth";
import {
  assertCanManageBilling,
  getAppUrl,
  getOrCreateStripeCustomer,
  getPlanConfig,
  getStripeMode,
  getStripeClient,
} from "@/lib/billing";
import { prisma } from "@/lib/prisma";

function getBillingReturnUrl() {
  return `${getAppUrl()}/settings/billing`;
}

export async function startCheckoutAction(plan: BillingPlan) {
  await requireSameOriginRequest();

  const user = await requireUser();
  assertCanManageBilling(user);

  if (plan === BillingPlan.FREE) {
    redirect("/settings/billing");
  }

  const planConfig = getPlanConfig(plan);

  if (!planConfig.stripePriceId) {
    redirect(
      `/settings/billing?error=${encodeURIComponent(
        "このプランのStripe Price IDが未設定です。",
      )}`,
    );
  }

  if (getStripeMode() !== "configured") {
    redirect(
      `/settings/billing?error=${encodeURIComponent(
        "Stripe環境変数が未設定です。VercelにSTRIPE_SECRET_KEYを設定してください。",
      )}`,
    );
  }

  const company = await prisma.company.findUnique({
    where: {
      id: user.companyId,
    },
  });

  if (!company) {
    redirect("/settings/billing?error=会社情報が見つかりません。");
  }

  const checkoutUrl = await (async () => {
    try {
      const stripe = getStripeClient();
      const customerId = await getOrCreateStripeCustomer({
        company,
        user,
      });
      const returnUrl = getBillingReturnUrl();

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [
          {
            price: planConfig.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${returnUrl}?notice=${encodeURIComponent(
          "決済手続きを開始しました。反映まで少し時間がかかる場合があります。",
        )}`,
        cancel_url: `${returnUrl}?error=${encodeURIComponent(
          "決済手続きがキャンセルされました。",
        )}`,
        client_reference_id: company.id,
        subscription_data: {
          metadata: {
            companyId: company.id,
            plan,
          },
        },
        metadata: {
          companyId: company.id,
          plan,
        },
      });

      await writeAuditLog({
        action: AuditAction.BILLING_CHECKOUT_STARTED,
        companyId: company.id,
        actorId: user.id,
        ...(await getRequestContext()),
        metadata: {
          plan,
          stripeCheckoutSessionId: session.id,
        },
      });

      return session.url;
    } catch {
      return null;
    }
  })();

  if (!checkoutUrl) {
    redirect(
      `/settings/billing?error=${encodeURIComponent(
        "Stripe Checkoutを開始できませんでした。Stripe設定を確認してください。",
      )}`,
    );
  }

  redirect(checkoutUrl);
}

export async function startCustomerPortalAction() {
  await requireSameOriginRequest();

  const user = await requireUser();
  assertCanManageBilling(user);

  const company = await prisma.company.findUnique({
    where: {
      id: user.companyId,
    },
  });

  if (!company?.stripeCustomerId) {
    redirect("/settings/billing?error=Stripe顧客情報がまだありません。");
  }

  const stripeCustomerId = company.stripeCustomerId;

  if (getStripeMode() !== "configured") {
    redirect(
      `/settings/billing?error=${encodeURIComponent(
        "Stripe環境変数が未設定です。Customer Portalは利用できません。",
      )}`,
    );
  }

  const portalUrl = await (async () => {
    try {
      const stripe = getStripeClient();
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: getBillingReturnUrl(),
      });

      await writeAuditLog({
        action: AuditAction.BILLING_PORTAL_STARTED,
        companyId: company.id,
        actorId: user.id,
        ...(await getRequestContext()),
        metadata: {
          stripeCustomerId,
        },
      });

      return session.url;
    } catch {
      return null;
    }
  })();

  if (!portalUrl) {
    redirect(
      `/settings/billing?error=${encodeURIComponent(
        "Customer Portalを開始できませんでした。Stripe設定を確認してください。",
      )}`,
    );
  }

  redirect(portalUrl);
}

export async function switchToFreeAction() {
  await requireSameOriginRequest();

  const user = await requireUser();
  assertCanManageBilling(user);

  const company = await prisma.company.findUnique({
    where: {
      id: user.companyId,
    },
  });

  if (!company) {
    redirect("/settings/billing?error=会社情報が見つかりません。");
  }

  if (company.stripeSubscriptionId) {
    redirect(
      `/settings/billing?error=${encodeURIComponent(
        "有料サブスクがある場合はCustomer Portalで解約してください。",
      )}`,
    );
  }

  await prisma.company.update({
    where: {
      id: company.id,
    },
    data: {
      billingPlan: BillingPlan.FREE,
      billingStatus: BillingSubscriptionStatus.FREE,
      stripePriceId: null,
      subscriptionCurrentPeriodEnd: null,
    },
  });

  await writeAuditLog({
    action: AuditAction.BILLING_SUBSCRIPTION_UPDATED,
    companyId: company.id,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      plan: BillingPlan.FREE,
    },
  });

  redirect("/settings/billing?notice=Freeプランに更新しました。");
}
