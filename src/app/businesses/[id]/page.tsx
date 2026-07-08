import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Edit,
  Send,
  ShieldAlert,
} from "lucide-react";
import { BusinessOpportunityStatus } from "@prisma/client";
import { submitBusinessOpportunityForReviewAction } from "@/app/businesses/actions";
import { BusinessOpportunityPreview } from "@/app/businesses/business-opportunity-form";
import { canManageBusinessOpportunities, requireUser } from "@/lib/auth";
import {
  businessOpportunityStatusLabels,
  businessOpportunityVisibilityLabels,
} from "@/lib/business-opportunities";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BusinessOpportunityDetailPage({
  params,
}: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const opportunity = await prisma.businessOpportunity.findFirst({
    where: {
      id,
      companyId: user.companyId,
    },
  });

  if (!opportunity) {
    notFound();
  }

  const canManage = canManageBusinessOpportunities(user);
  const submitAction = submitBusinessOpportunityForReviewAction.bind(
    null,
    opportunity.id,
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/businesses"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          残したい事業へ戻る
        </Link>

        <header className="mt-6 flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
                {businessOpportunityStatusLabels[opportunity.status]}
              </span>
              <span className="rounded border border-zinc-800 bg-black/35 px-3 py-1.5 text-xs font-semibold text-zinc-300">
                {businessOpportunityVisibilityLabels[opportunity.visibility]}
              </span>
              {opportunity.sensitiveInfoFlag ? (
                <span className="inline-flex items-center gap-1 rounded border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-200">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  特定情報の可能性あり
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              {opportunity.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              この情報は匿名・限定公開を前提に整理されています。会社名や代表者名は表示しません。
            </p>
          </div>

          {canManage ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/businesses/${opportunity.id}/edit`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
              >
                <Edit className="h-4 w-4" />
                編集
              </Link>
              {opportunity.status === BusinessOpportunityStatus.DRAFT ? (
                <form action={submitAction}>
                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
                  >
                    <Send className="h-4 w-4" />
                    運営確認へ送る
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}
        </header>

        <section className="grid gap-4 py-6 md:grid-cols-3">
          <div className="rounded border border-zinc-800 bg-black/35 p-4">
            <p className="text-xs text-zinc-500">最終更新</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-200">
              <CalendarClock className="h-4 w-4 text-amber-300" />
              {opportunity.updatedAt.toLocaleString("ja-JP")}
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-black/35 p-4">
            <p className="text-xs text-zinc-500">公開範囲</p>
            <p className="mt-2 text-sm text-zinc-200">
              {businessOpportunityVisibilityLabels[opportunity.visibility]}
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-black/35 p-4">
            <p className="text-xs text-zinc-500">実名公開</p>
            <p className="mt-2 text-sm text-zinc-200">
              しない。対話前の実名開示には接続していません。
            </p>
          </div>
        </section>

        <BusinessOpportunityPreview opportunity={opportunity} />
      </div>
    </main>
  );
}
