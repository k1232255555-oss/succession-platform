import Link from "next/link";
import {
  BusinessOpportunityStatus,
  BusinessOpportunityVisibility,
} from "@prisma/client";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { updateBusinessOpportunityReviewAction } from "@/app/businesses/actions";
import { requireRole, requireUser } from "@/lib/auth";
import {
  businessOpportunityStatusLabels,
  businessOpportunityVisibilityLabels,
} from "@/lib/business-opportunities";
import { prisma } from "@/lib/prisma";
import { industryOptions, optionLabel } from "@/lib/succession-brief";

export const dynamic = "force-dynamic";

export default async function SettingsBusinessesPage() {
  const user = await requireUser();
  requireRole(user, ["OWNER"]);

  const opportunities = await prisma.businessOpportunity.findMany({
    include: {
      company: {
        select: {
          id: true,
          slug: true,
        },
      },
      createdBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        updatedAt: "desc",
      },
    ],
    take: 100,
  });

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          設定へ戻る
        </Link>

        <header className="mt-6 border-b border-zinc-800 pb-6">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <BriefcaseBusiness className="h-4 w-4" />
            OWNER確認
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            承継プロジェクト確認
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            全社の残したい事業を確認します。この画面は運営OWNERのみ閲覧できます。
          </p>
        </header>

        <section className="mt-6 rounded border border-amber-300/15 bg-amber-300/[0.06] p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <p className="text-sm leading-6 text-zinc-300">
              会社名は審査管理上の内部情報としてのみ扱います。外向き表示では匿名タイトルだけを使います。
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4">
          {opportunities.map((opportunity) => {
            const reviewAction = updateBusinessOpportunityReviewAction.bind(
              null,
              opportunity.id,
            );

            return (
              <article
                key={opportunity.id}
                className="rounded border border-zinc-800 bg-zinc-950/85 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                        {businessOpportunityStatusLabels[opportunity.status]}
                      </span>
                      <span className="rounded border border-zinc-800 bg-black/35 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                        {businessOpportunityVisibilityLabels[opportunity.visibility]}
                      </span>
                      {opportunity.sensitiveInfoFlag ? (
                        <span className="inline-flex items-center gap-1 rounded border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-xs font-semibold text-red-200">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          要確認
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                      {opportunity.title}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500">
                      {optionLabel(industryOptions, opportunity.industry)}
                      {opportunity.region ? ` / ${opportunity.region}` : ""}
                    </p>
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                      {opportunity.summary}
                    </p>
                    <p className="mt-3 text-xs text-zinc-600">
                      内部所有会社: {opportunity.company.slug} / 作成者:{" "}
                      {opportunity.createdBy?.name ??
                        opportunity.createdBy?.email ??
                        "不明"}
                    </p>
                  </div>

                  <form action={reviewAction} className="grid min-w-60 gap-3">
                    <label>
                      <span className="text-xs font-medium text-zinc-500">
                        状態
                      </span>
                      <select
                        name="status"
                        defaultValue={opportunity.status}
                        className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none"
                      >
                        {Object.values(BusinessOpportunityStatus).map((status) => (
                          <option key={status} value={status}>
                            {businessOpportunityStatusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="text-xs font-medium text-zinc-500">
                        公開範囲
                      </span>
                      <select
                        name="visibility"
                        defaultValue={opportunity.visibility}
                        className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none"
                      >
                        <option value={BusinessOpportunityVisibility.PRIVATE}>
                          {businessOpportunityVisibilityLabels.PRIVATE}
                        </option>
                        <option value={BusinessOpportunityVisibility.LIMITED}>
                          {businessOpportunityVisibilityLabels.LIMITED}
                        </option>
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center justify-center rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
                    >
                      確認結果を保存
                    </button>
                  </form>
                </div>
              </article>
            );
          })}

          {opportunities.length === 0 ? (
            <section className="rounded border border-zinc-800 bg-black/35 p-8 text-center">
              <h2 className="text-xl font-semibold text-white">
                承継プロジェクトはまだありません。
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                登録されると、運営OWNERがここで確認できます。
              </p>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
