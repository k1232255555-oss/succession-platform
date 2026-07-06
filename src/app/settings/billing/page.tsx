import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CreditCard,
  Crown,
  FileText,
  Gauge,
  LockKeyhole,
} from "lucide-react";
import { BillingPlan } from "@prisma/client";
import {
  startCheckoutAction,
  startCustomerPortalAction,
  switchToFreeAction,
} from "@/app/settings/billing/actions";
import { canManageBilling, requireUser } from "@/lib/auth";
import {
  billingPlans,
  formatPlanLimit,
  getPlanConfig,
  getStripeMode,
} from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function formatAmount(value: number, currency: string) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value / 100);
}

export default async function BillingPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const notice = getParam(params, "notice");
  const error = getParam(params, "error");
  const canManage = canManageBilling(user);

  const [company, activeUsers, monthlyScouts] = await Promise.all([
    prisma.company.findUnique({
      where: {
        id: user.companyId,
      },
      include: {
        billingInvoices: {
          orderBy: {
            createdAt: "desc",
          },
          take: 12,
        },
      },
    }),
    prisma.companyUser.count({
      where: {
        companyId: user.companyId,
        isActive: true,
      },
    }),
    prisma.scoutRequest.count({
      where: {
        companyId: user.companyId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  if (!company) {
    return null;
  }

  const currentPlan = getPlanConfig(company.billingPlan);
  const stripeConfigured = getStripeMode() === "configured";
  const usageItems = [
    {
      label: "有効ユーザー",
      value: activeUsers,
      limit: currentPlan.limits.users,
    },
    {
      label: "候補者表示",
      value: currentPlan.limits.visibleCandidates,
      limit: currentPlan.limits.visibleCandidates,
    },
    {
      label: "今月のスカウト",
      value: monthlyScouts,
      limit: currentPlan.limits.scoutsPerMonth,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/settings/security"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
            >
              <ArrowLeft className="h-4 w-4" />
              設定へ戻る
            </Link>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              決済とプラン管理
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Stripe Checkout、Customer Portal、サブスク状態、請求履歴を管理します。
            </p>
          </div>

          {canManage && company.stripeCustomerId ? (
            <form action={startCustomerPortalAction}>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
              >
                Customer Portal
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          ) : null}
        </header>

        {notice ? (
          <div className="mt-5 rounded border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {!stripeConfigured ? (
          <div className="mt-5 rounded border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            Stripe環境変数が未設定です。Free運用と画面表示は可能ですが、CheckoutとPortalは利用できません。
          </div>
        ) : null}

        <section className="grid gap-4 py-6 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded border border-amber-300/15 bg-amber-300/[0.06] p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <Crown className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Current Plan</h2>
            </div>
            <p className="mt-4 text-4xl font-semibold text-amber-300">
              {currentPlan.name}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {currentPlan.description}
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded border border-zinc-800 bg-black/35 p-4">
                <p className="text-xs text-zinc-500">サブスク状態</p>
                <p className="mt-1 font-semibold text-white">
                  {company.billingStatus}
                </p>
              </div>
              <div className="rounded border border-zinc-800 bg-black/35 p-4">
                <p className="text-xs text-zinc-500">現在期間終了</p>
                <p className="mt-1 font-semibold text-white">
                  {company.subscriptionCurrentPeriodEnd
                    ? company.subscriptionCurrentPeriodEnd.toLocaleDateString(
                        "ja-JP",
                      )
                    : "-"}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <Gauge className="h-4 w-4" />
              <span>Usage</span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {usageItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded border border-zinc-800 bg-black/35 p-4"
                >
                  <p className="text-sm text-zinc-400">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {typeof item.value === "number"
                      ? item.value.toLocaleString("ja-JP")
                      : formatPlanLimit(item.value)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    上限: {formatPlanLimit(item.limit)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 pb-6 md:grid-cols-2 xl:grid-cols-4">
          {billingPlans.map((plan) => {
            const isCurrent = plan.plan === company.billingPlan;
            const checkoutAction = startCheckoutAction.bind(null, plan.plan);
            const isFree = plan.plan === BillingPlan.FREE;
            const priceMissing = !isFree && !plan.stripePriceId;

            return (
              <article
                key={plan.plan}
                className={`flex min-h-[360px] flex-col rounded border p-5 ${
                  isCurrent
                    ? "border-amber-300/35 bg-amber-300/[0.07]"
                    : "border-zinc-800 bg-zinc-950/85"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {plan.name}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-amber-300">
                      {plan.priceLabel}
                    </p>
                  </div>
                  {isCurrent ? (
                    <BadgeCheck className="h-5 w-5 text-amber-300" />
                  ) : (
                    <LockKeyhole className="h-5 w-5 text-zinc-600" />
                  )}
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  {plan.description}
                </p>

                <div className="mt-5 space-y-2 text-sm text-zinc-300">
                  <p>ユーザー: {formatPlanLimit(plan.limits.users)}</p>
                  <p>
                    候補者表示: {formatPlanLimit(plan.limits.visibleCandidates)}
                  </p>
                  <p>
                    月間スカウト: {formatPlanLimit(plan.limits.scoutsPerMonth)}
                  </p>
                </div>

                <div className="mt-auto pt-6">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-11 w-full items-center justify-center rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 opacity-70"
                    >
                      現在のプラン
                    </button>
                  ) : isFree ? (
                    <form action={switchToFreeAction}>
                      <button
                        type="submit"
                        disabled={!canManage}
                        className="inline-flex h-11 w-full items-center justify-center rounded border border-zinc-800 px-4 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/30 hover:text-amber-100 disabled:opacity-50"
                      >
                        Freeに変更
                      </button>
                    </form>
                  ) : (
                    <form action={checkoutAction}>
                      <button
                        type="submit"
                        disabled={!canManage || !stripeConfigured || priceMissing}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200 disabled:opacity-50"
                      >
                        Checkoutへ進む
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <FileText className="h-4 w-4" />
            <span>Invoices</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">請求履歴</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr className="border-b border-zinc-800">
                  <th className="py-3 pr-4 font-medium">請求番号</th>
                  <th className="py-3 pr-4 font-medium">状態</th>
                  <th className="py-3 pr-4 font-medium">請求額</th>
                  <th className="py-3 pr-4 font-medium">支払額</th>
                  <th className="py-3 pr-4 font-medium">作成日</th>
                  <th className="py-3 pr-4 font-medium">リンク</th>
                </tr>
              </thead>
              <tbody>
                {company.billingInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-zinc-900">
                    <td className="py-3 pr-4 text-zinc-300">
                      {invoice.number ?? invoice.stripeInvoiceId}
                    </td>
                    <td className="py-3 pr-4 text-amber-200">
                      {invoice.status}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">
                      {formatAmount(invoice.amountDue, invoice.currency)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">
                      {formatAmount(invoice.amountPaid, invoice.currency)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-500">
                      {invoice.createdAt.toLocaleDateString("ja-JP")}
                    </td>
                    <td className="py-3 pr-4">
                      {invoice.hostedInvoiceUrl ? (
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-amber-200 hover:text-amber-100"
                        >
                          開く
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {company.billingInvoices.length === 0 ? (
            <p className="mt-5 rounded border border-zinc-800 bg-black/35 p-4 text-sm text-zinc-400">
              請求履歴はまだありません。
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
