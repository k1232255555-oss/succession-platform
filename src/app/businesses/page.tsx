import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Eye,
  FilePlus2,
  ShieldCheck,
} from "lucide-react";
import { BusinessOpportunityStatus } from "@prisma/client";
import { canManageBusinessOpportunities, requireUser } from "@/lib/auth";
import {
  businessOpportunityStatusLabels,
  businessOpportunityVisibilityLabels,
} from "@/lib/business-opportunities";
import { prisma } from "@/lib/prisma";
import { optionLabel, industryOptions } from "@/lib/succession-brief";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const user = await requireUser();
  const canManage = canManageBusinessOpportunities(user);
  const opportunities = await prisma.businessOpportunity.findMany({
    where: {
      companyId: user.companyId,
      status: {
        not: BusinessOpportunityStatus.ARCHIVED,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              残したい事業
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              未来へつなぎたい事業を、匿名・限定公開を前提に整理します。会社名や財務情報は登録しません。
            </p>
          </div>

          {canManage ? (
            <Link
              href="/businesses/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
            >
              <FilePlus2 className="h-4 w-4" />
              承継プロジェクトを登録
            </Link>
          ) : null}
        </header>

        <section className="mt-6 rounded border border-amber-300/15 bg-amber-300/[0.06] p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <p className="text-sm leading-6 text-zinc-300">
              この画面は自社用の管理画面です。一般公開、候補者側表示、対話申請、メッセージにはまだ接続していません。
            </p>
          </div>
        </section>

        {opportunities.length > 0 ? (
          <section className="mt-6 grid gap-4">
            {opportunities.map((opportunity) => (
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
                        <span className="rounded border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-xs font-semibold text-red-200">
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
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                      {opportunity.summary}
                    </p>
                  </div>

                  <Link
                    href={`/businesses/${opportunity.id}`}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded border border-amber-300/30 px-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
                  >
                    詳細
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-6 rounded border border-zinc-800 bg-black/35 p-8 text-center">
            <Eye className="mx-auto h-8 w-8 text-amber-300" />
            <h2 className="mt-4 text-xl font-semibold text-white">
              まだ承継プロジェクトはありません。
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              まずは匿名タイトルと概要だけで、未来へつなぎたい事業を整理できます。
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
