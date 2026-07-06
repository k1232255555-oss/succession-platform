import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarClock,
  Crown,
  Handshake,
  RefreshCw,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";
import { AuditAction } from "@prisma/client";
import { recalculateCandidateAiMatchAction } from "@/app/candidates/admin/ai-actions";
import { deleteCandidateAction } from "@/app/candidates/admin/actions";
import { createScoutRequestAction } from "@/app/scouts/actions";
import { writeAuditLog } from "@/lib/audit";
import {
  canManageCandidates,
  canScoutCandidates,
  getRequestContext,
  requireUser,
} from "@/lib/auth";
import { ensureAiMatch } from "@/lib/ai-matching";
import { getCandidateScore, reviewStatusLabels } from "@/lib/candidates";
import { prisma } from "@/lib/prisma";
import { scoutStatusLabels } from "@/lib/scouts";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function ScoreBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof BrainCircuit;
}) {
  return (
    <div className="rounded border border-zinc-800 bg-black/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Icon className="h-4 w-4 text-amber-300" />
          <span>{label}</span>
        </div>
        <span className="text-3xl font-semibold text-amber-300">{value}</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded bg-zinc-800">
        <div
          className="h-full rounded bg-amber-300"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default async function CandidateDetailPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const query = (await searchParams) ?? {};

  const [company, candidate] = await Promise.all([
    prisma.company.findUnique({
      where: {
        id: user.companyId,
      },
    }),
    prisma.successorCandidate.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
      include: {
        aiMatchResults: {
          where: {
            companyId: user.companyId,
          },
          take: 1,
        },
      },
    }),
  ]);

  if (!company || !candidate) {
    notFound();
  }

  const aiMatch = await ensureAiMatch({
    company,
    candidate,
    existingMatch: candidate.aiMatchResults[0],
  });

  const scoutRequests = await prisma.scoutRequest.findMany({
    where: {
      companyId: user.companyId,
      candidateId: candidate.id,
    },
    include: {
      createdBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  await writeAuditLog({
    action: AuditAction.CANDIDATE_VIEWED,
    companyId: user.companyId,
    actorId: user.id,
    ...(await getRequestContext()),
    metadata: {
      candidateId: candidate.id,
      candidateName: candidate.name,
    },
  });

  const deleteAction = deleteCandidateAction.bind(null, candidate.id);
  const scoutAction = createScoutRequestAction.bind(null, candidate.id);
  const recalculateAction = recalculateCandidateAiMatchAction.bind(
    null,
    candidate.id,
  );
  const score = getCandidateScore(candidate);
  const error = getParam(query, "error");
  const notice = getParam(query, "notice");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/candidates"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
            >
              <ArrowLeft className="h-4 w-4" />
              候補者一覧へ戻る
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
                {reviewStatusLabels[candidate.reviewStatus]}
              </span>
              {candidate.isFeatured ? (
                <span className="inline-flex items-center gap-1 rounded border border-amber-300/25 bg-black/40 px-3 py-1.5 text-xs font-semibold text-amber-300">
                  <Crown className="h-3.5 w-3.5" />
                  注目候補
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {candidate.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              <span>{candidate.age}歳</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-amber-300" />
                {candidate.region}
              </span>
              <span className="inline-flex items-center gap-1">
                <BadgeCheck className="h-4 w-4 text-amber-300" />
                審査済みプロフィール
              </span>
            </div>
          </div>

          {canManageCandidates(user) ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/candidates/admin/${candidate.id}/edit`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
              >
                <Pencil className="h-4 w-4" />
                編集
              </Link>
              <form action={deleteAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-red-400/30 px-4 text-sm font-semibold text-red-200 transition hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                  削除
                </button>
              </form>
            </div>
          ) : null}
        </div>

        {notice ? (
          <div className="mt-5 rounded border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            {notice}
          </div>
        ) : null}

        <section className="grid gap-4 py-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <Sparkles className="h-4 w-4" />
              <span>Self Promotion</span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-zinc-100">
              {candidate.selfPr}
            </p>
          </article>

          <article className="rounded border border-amber-300/15 bg-amber-300/[0.06] p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <Target className="h-4 w-4" />
              <h2 className="text-sm font-semibold">総合熱量スコア</h2>
            </div>
            <p className="mt-5 text-6xl font-semibold text-amber-300">
              {score}
            </p>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              AI活用度、現場経験、承継意欲をもとにした社内評価指標です。
            </p>
          </article>
        </section>

        <section className="grid gap-4 pb-6 md:grid-cols-3">
          <ScoreBlock
            label="AI活用度"
            value={candidate.aiUsageLevel}
            icon={BrainCircuit}
          />
          <ScoreBlock
            label="現場経験"
            value={candidate.fieldExperienceLevel}
            icon={Wrench}
          />
          <ScoreBlock
            label="承継意欲"
            value={candidate.successionMotivationLevel}
            icon={Zap}
          />
        </section>

        <section className="rounded border border-amber-300/15 bg-zinc-950/85 p-5 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
                <Sparkles className="h-4 w-4" />
                <span>AI Match Analysis</span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                相性スコア {aiMatch.score}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
                {aiMatch.recommendation}
              </p>
              {aiMatch.isFallback ? (
                <p className="mt-3 text-xs text-amber-200/80">
                  OpenAI API未設定または失敗のため、簡易スコアで表示しています。
                </p>
              ) : null}
            </div>
            {canManageCandidates(user) ? (
              <form action={recalculateAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  AI再計算
                </button>
              </form>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded border border-zinc-800 bg-black/35 p-4">
              <p className="text-sm font-semibold text-amber-200">マッチ理由</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                {aiMatch.reasons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded border border-zinc-800 bg-black/35 p-4">
              <p className="text-sm font-semibold text-amber-200">期待できること</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                {aiMatch.expectedContribution.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded border border-zinc-800 bg-black/35 p-4">
              <p className="text-sm font-semibold text-amber-200">強み</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                {aiMatch.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded border border-zinc-800 bg-black/35 p-4">
              <p className="text-sm font-semibold text-amber-200">注意点</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                {[...aiMatch.concerns, ...aiMatch.cautionPoints]
                  .slice(0, 5)
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-6 lg:grid-cols-2">
          <article className="rounded border border-zinc-800 bg-black/35 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <BriefcaseBusiness className="h-4 w-4" />
              <span>Career</span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {candidate.career}
            </p>
          </article>

          <article className="rounded border border-zinc-800 bg-black/35 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <ShieldCheck className="h-4 w-4" />
              <span>Fit</span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-zinc-500">希望業種</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {candidate.desiredIndustries.map((industry) => (
                  <span
                    key={industry}
                    className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-medium text-zinc-500">スキル</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1.5 text-xs font-medium text-amber-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 pb-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded border border-amber-300/15 bg-amber-300/[0.06] p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <Handshake className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Scout Request</h2>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-white">
              スカウトを送る
            </h3>

            <div className="mt-4 rounded border border-zinc-800 bg-black/35 p-4">
              <p className="text-xs font-semibold text-amber-200">
                AIコメント
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {aiMatch.recommendation}
              </p>
            </div>

            {error ? (
              <div className="mt-4 rounded border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            {canScoutCandidates(user) ? (
              <form action={scoutAction} className="mt-5 grid gap-4">
                <label>
                  <span className="text-xs font-medium text-zinc-500">
                    スカウト文
                  </span>
                  <textarea
                    name="message"
                    rows={6}
                    required
                    minLength={20}
                    placeholder="事業承継の背景、候補者に期待したい役割、初回面談で話したいことを入力してください。"
                    className="mt-2 w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-300/50"
                  />
                </label>
                <label>
                  <span className="text-xs font-medium text-zinc-500">
                    希望面談日時
                  </span>
                  <input
                    name="proposedMeetingAt"
                    type="datetime-local"
                    className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                  />
                </label>
                <label className="flex items-start gap-2 text-sm leading-6 text-zinc-300">
                  <input
                    type="checkbox"
                    name="feeAcknowledged"
                    className="mt-1 h-4 w-4 accent-amber-300"
                  />
                  スカウト成立時にマッチング料が発生することを確認しました。
                </label>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
                >
                  <Handshake className="h-4 w-4" />
                  スカウトを送信
                </button>
              </form>
            ) : (
              <p className="mt-5 text-sm leading-6 text-zinc-400">
                VIEWER権限ではスカウト送信はできません。必要な場合はOWNERまたはADMINに依頼してください。
              </p>
            )}
          </article>

          <article className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <CalendarClock className="h-4 w-4" />
              <span>Scout History</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-white">
              スカウト履歴
            </h3>

            <div className="mt-5 space-y-3">
              {scoutRequests.map((scout) => (
                <div
                  key={scout.id}
                  className="rounded border border-zinc-800 bg-black/35 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                        {scoutStatusLabels[scout.status]}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {scout.createdAt.toLocaleString("ja-JP")}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      by {scout.createdBy?.email ?? "System"}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                    {scout.message}
                  </p>
                  <p className="mt-3 text-xs text-zinc-500">
                    希望面談日時:{" "}
                    {scout.proposedMeetingAt
                      ? scout.proposedMeetingAt.toLocaleString("ja-JP")
                      : "-"}
                  </p>
                </div>
              ))}

              {scoutRequests.length === 0 ? (
                <p className="rounded border border-zinc-800 bg-black/35 p-4 text-sm text-zinc-400">
                  まだスカウト履歴はありません。
                </p>
              ) : null}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
