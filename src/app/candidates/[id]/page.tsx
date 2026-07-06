import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Crown,
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
import { deleteCandidateAction } from "@/app/candidates/admin/actions";
import { writeAuditLog } from "@/lib/audit";
import {
  canManageCandidates,
  getRequestContext,
  requireUser,
} from "@/lib/auth";
import { getCandidateScore, reviewStatusLabels } from "@/lib/candidates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

export default async function CandidateDetailPage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;

  const candidate = await prisma.successorCandidate.findFirst({
    where: {
      id,
      companyId: user.companyId,
    },
  });

  if (!candidate) {
    notFound();
  }

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
  const score = getCandidateScore(candidate);

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

        <section className="grid gap-4 pb-8 lg:grid-cols-2">
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
      </div>
    </main>
  );
}
