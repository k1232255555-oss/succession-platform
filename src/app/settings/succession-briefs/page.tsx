import Link from "next/link";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";
import { BriefVisibilityScope, BriefStatus } from "@prisma/client";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  aggregateMinimumCount,
  briefStatusLabels,
  industryOptions,
  issueCategoryOptions,
  nextActionOptions,
  optionLabel,
  optionLabels,
  successionStageOptions,
  valueCategoryOptions,
} from "@/lib/succession-brief";

export const dynamic = "force-dynamic";

function aggregateValues(
  rows: { values: string[] }[],
  options: readonly { value: string; label: string }[],
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    for (const value of row.values) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count >= aggregateMinimumCount)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({
      label: optionLabel(options, value),
      count,
    }));
}

function aggregateSingleValue(
  rows: { value: string }[],
  options: readonly { value: string; label: string }[],
) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.value, (counts.get(row.value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count >= aggregateMinimumCount)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({
      label: optionLabel(options, value),
      count,
    }));
}

function AggregateList({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  return (
    <section className="rounded border border-zinc-800 bg-black/35 p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {items.length ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
            >
              <span className="text-zinc-200">{item.label}</span>
              <span className="font-semibold text-amber-200">
                {item.count}件
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-zinc-500">
          3件以上の匿名データがまだありません。
        </p>
      )}
    </section>
  );
}

export default async function SuccessionBriefsSettingsPage() {
  const user = await requireUser();
  requireRole(user, ["OWNER"]);

  const [briefs, aggregateBriefs] = await Promise.all([
    prisma.successionBrief.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
        contactRequest: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.successionBrief.findMany({
      where: {
        visibilityScope: BriefVisibilityScope.AGGREGATE_ONLY,
        status: {
          not: BriefStatus.ARCHIVED,
        },
        sensitiveInfoFlag: false,
      },
      select: {
        industry: true,
        successionStage: true,
        valueCategories: true,
        issueCategories: true,
        nextActions: true,
      },
    }),
  ]);

  const industryAggregates = aggregateSingleValue(
    aggregateBriefs.map((brief) => ({ value: brief.industry })),
    industryOptions,
  );
  const stageAggregates = aggregateSingleValue(
    aggregateBriefs.map((brief) => ({ value: brief.successionStage })),
    successionStageOptions,
  );
  const valueAggregates = aggregateValues(
    aggregateBriefs.map((brief) => ({ values: brief.valueCategories })),
    valueCategoryOptions,
  );
  const issueAggregates = aggregateValues(
    aggregateBriefs.map((brief) => ({ values: brief.issueCategories })),
    issueCategoryOptions,
  );
  const actionAggregates = aggregateValues(
    aggregateBriefs.map((brief) => ({ values: brief.nextActions })),
    nextActionOptions,
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          設定へ戻る
        </Link>

        <header className="mt-6 border-b border-zinc-800 pb-6">
          <p className="text-sm font-medium text-amber-200/80">
            OWNER Console
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            承継ブリーフ
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            匿名・構造化された承継論点データを確認します。集計は「匿名集計のみ利用」かつ敏感情報なしのデータだけを対象にし、
            3件未満の項目は表示しません。
          </p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded border border-zinc-800 bg-black/35 p-5">
            <p className="text-sm text-zinc-500">総ブリーフ</p>
            <p className="mt-2 text-3xl font-semibold text-amber-200">
              {briefs.length}件
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-black/35 p-5">
            <p className="text-sm text-zinc-500">匿名集計対象</p>
            <p className="mt-2 text-3xl font-semibold text-amber-200">
              {aggregateBriefs.length}件
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-black/35 p-5">
            <p className="text-sm text-zinc-500">相談希望</p>
            <p className="mt-2 text-3xl font-semibold text-amber-200">
              {briefs.filter((brief) => brief.contactRequest).length}件
            </p>
          </div>
        </section>

        <section className="mt-6 rounded border border-amber-300/25 bg-amber-300/10 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <p className="text-sm leading-6 text-amber-50/85">
              ここで表示する集計は内部確認用です。少数件数の公開や、企業・個人の特定につながる外部共有は行わないでください。
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <AggregateList title="業種" items={industryAggregates} />
          <AggregateList title="承継段階" items={stageAggregates} />
          <AggregateList title="残したい価値" items={valueAggregates} />
          <AggregateList title="現在の論点" items={issueAggregates} />
          <AggregateList title="次のアクション" items={actionAggregates} />
        </section>

        <section className="mt-6 rounded border border-zinc-800 bg-black/35">
          <div className="flex items-center gap-3 border-b border-zinc-800 p-5">
            <Database className="h-5 w-5 text-amber-200" />
            <h2 className="text-lg font-semibold text-white">最新ブリーフ</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">作成日</th>
                  <th className="px-4 py-3">業種</th>
                  <th className="px-4 py-3">承継段階</th>
                  <th className="px-4 py-3">公開範囲</th>
                  <th className="px-4 py-3">論点</th>
                  <th className="px-4 py-3">相談</th>
                  <th className="px-4 py-3">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {briefs.map((brief) => (
                  <tr key={brief.id} className="align-top">
                    <td className="px-4 py-4 text-zinc-400">
                      {brief.createdAt.toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-4 text-zinc-200">
                      {optionLabel(industryOptions, brief.industry)}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {optionLabel(successionStageOptions, brief.successionStage)}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {brief.visibilityScope}
                      {brief.sensitiveInfoFlag ? (
                        <span className="mt-1 block text-xs text-red-200">
                          要確認
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-xs px-4 py-4 text-zinc-300">
                      {optionLabels(issueCategoryOptions, brief.issueCategories).join(
                        "、",
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {brief.contactRequest ? "あり" : "なし"}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {briefStatusLabels[brief.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!briefs.length ? (
            <p className="p-5 text-sm text-zinc-500">
              まだ承継ブリーフはありません。
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
