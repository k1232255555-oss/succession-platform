import { canManageBilling } from "@/lib/auth";
import type { CompanyUser } from "@prisma/client";

export type BillingPlan = "starter" | "growth" | "enterprise";

export type StripeCheckoutInput = {
  companyId: string;
  plan: BillingPlan;
};

export function assertCanManageBilling(user: Pick<CompanyUser, "role">) {
  if (!canManageBilling(user)) {
    throw new Error("Billing permission denied.");
  }
}

export function getStripeMode() {
  return process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured";
}
