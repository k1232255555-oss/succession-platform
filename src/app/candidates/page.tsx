import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Crown,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  UserRoundPlus,
  Zap,
} from "lucide-react";
import {
  CandidateReviewStatus,
  type Company,
  type Prisma,
} from "@prisma/client";
import { canManageCandidates, requireUser } from "@/lib/auth";
import {
  ensureAiMatch,
  getFallbackMatch,
  type CandidateWithMatch,
} from "@/lib/ai-matching";
import { formatPlanLimit, getPlanConfig } from "@/lib/billing";
import {
  getCandidateScore,
  reviewStatusLabels,
  reviewStatusOptions,
} from "@/lib/candidates";
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

function CandidateCard({
  candidate,
  company,
}: {
  candidate: CandidateWithMatch;
  company: Pick<Company, "name" | "status">;
}) {
  const score = getCandidateScore(candidate);
  const aiMatch = candidate.aiMatchResults[0];
  const fallbackMatch = getFallbackMatch({
    company,
    candidate,
  });
  const aiScore = aiMatch?.score ?? fallbackMatch.score;
  const recommendation = aiMatch?.recommendation ?? fallbackMatch.recommendation;

  return (
    <article className="flex min-h-[390px] flex-col rounded border border-zinc-800 bg-zinc-950/85 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.34)] transition hover:border-amber-300/35 hover:shadow-[0_20px_70px_rgba(212,175,55,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
              {reviewStatusLabels[candidate.reviewStatus]}
            </span>
            {candidate.isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded border border-amber-300/25 bg-black/40 px-2.5 py-1 text-xs font-semibold text-amber-300">
                <Star className="h-3 w-3" />
                注目
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">
            {candidate.name}
            <span className="ml-2 text-sm font-medium text-zinc-500">
              {candidate.age}歳
            </span>
          </h2>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-zinc-500">
            <MapPin className="h-3.5 w-3.5 text-amber-300/80" />
            <span>{candidate.region}</span>
          </div>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded border border-amber-300/20 bg-amber-300/10 text-amber-200">
          <BadgeCheck className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-5 line-clamp-4 text-sm leading-6 text-zinc-300">
        {candidate.selfPr}
      </p>

      <div className="mt-5 rounded border border-amber-300/15 bg-amber-300/[0.06] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-amber-200">AIおすすめ</p>
          <p className="text-2xl font-semibold text-amber-300">{aiScore}</p>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-300">
          {recommendation}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <div>
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
        <div>
          <p className="text-xs font-medium text-zinc-500">スキル</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidate.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1.5 text-xs font-medium text-amber-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded border border-zinc-800 bg-black/35 p-3">
            <p className="text-[11px] text-zinc-500">AI</p>
            <p className="mt-1 text-lg font-semibold text-amber-300">
              {candidate.aiUsageLevel}
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-black/35 p-3">
            <p className="text-[11px] text-zinc-500">現場</p>
            <p className="mt-1 text-lg font-semibold text-amber-300">
              {candidate.fieldExperienceLevel}
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-black/35 p-3">
            <p className="text-[11px] text-zinc-500">意欲</p>
            <p className="mt-1 text-lg font-semibold text-amber-300">
              {candidate.successionMotivationLevel}
            </p>
          </div>
        </div>
        <Link
          href={`/candidates/${candidate.id}`}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black shadow-[0_0_28px_rgba(251,191,36,0.22)] transition hover:bg-amber-200"
        >
          詳細プロフィールを見る
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-center text-xs text-zinc-500">
          総合熱量スコア {score}
        </p>
      </div>
    </article>
  );
}

export default async function CandidatesPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const q = getParam(params, "q")?.trim() ?? "";
  const region = getParam(params, "region")?.trim() ?? "";
  const industry = getParam(params, "industry")?.trim() ?? "";
  const skill = getParam(params, "skill")?.trim() ?? "";
  const status = getParam(params, "status")?.trim() ?? "";
  const sort = getParam(params, "sort")?.trim() ?? "ai";
  const featured = getParam(params, "featured") === "on";
  const planConfig = getPlanConfig(user.company.billingPlan);
  const visibleCandidateLimit = planConfig.limits.visibleCandidates;
  const candidateTake =
    visibleCandidateLimit === "unlimited" ? undefined : visibleCandidateLimit;

  const where: Prisma.SuccessorCandidateWhereInput = {
    companyId: user.companyId,
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { region: { contains: q, mode: "insensitive" } },
      { career: { contains: q, mode: "insensitive" } },
      { selfPr: { contains: q, mode: "insensitive" } },
    ];
  }

  if (region) {
    where.region = { contains: region, mode: "insensitive" };
  }

  if (industry) {
    where.desiredIndustries = { has: industry };
  }

  if (skill) {
    where.skills = { has: skill };
  }

  if (
    status &&
    Object.values(CandidateReviewStatus).includes(
      status as CandidateReviewStatus,
    )
  ) {
    where.reviewStatus = status as CandidateReviewStatus;
  }

  if (featured) {
    where.isFeatured = true;
  }

  const orderBy: Prisma.SuccessorCandidateOrderByWithRelationInput[] =
    sort === "age"
      ? [{ age: "asc" }, { updatedAt: "desc" }]
      : sort === "region"
        ? [{ region: "asc" }, { updatedAt: "desc" }]
        : sort === "experience"
          ? [{ fieldExperienceLevel: "desc" }, { updatedAt: "desc" }]
          : [{ isFeatured: "desc" }, { updatedAt: "desc" }];

  const [rawCandidates, regions, industries, skills] = await Promise.all([
    prisma.successorCandidate.findMany({
      where,
      include: {
        aiMatchResults: {
          where: {
            companyId: user.companyId,
          },
          take: 1,
        },
      },
      orderBy,
      take: candidateTake,
    }),
    prisma.successorCandidate.findMany({
      where: { companyId: user.companyId },
      distinct: ["region"],
      orderBy: { region: "asc" },
      select: { region: true },
    }),
    prisma.successorCandidate.findMany({
      where: { companyId: user.companyId },
      select: { desiredIndustries: true },
    }),
    prisma.successorCandidate.findMany({
      where: { companyId: user.companyId },
      select: { skills: true },
    }),
  ]);

  const candidates = await Promise.all(
    rawCandidates.map(async (candidate) => {
      const match = await ensureAiMatch({
        company: user.company,
        candidate,
        existingMatch: candidate.aiMatchResults[0],
      });

      return {
        ...candidate,
        aiMatchResults: match ? [match] : [],
      };
    }),
  );

  if (sort === "ai") {
    candidates.sort((first, second) => {
      const firstScore = first.aiMatchResults[0]?.score ?? 0;
      const secondScore = second.aiMatchResults[0]?.score ?? 0;
      return secondScore - firstScore;
    });
  }

  const industryOptions = Array.from(
    new Set(industries.flatMap((item) => item.desiredIndustries)),
  ).sort();
  const skillOptions = Array.from(
    new Set(skills.flatMap((item) => item.skills)),
  ).sort();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              後継者候補を探す
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              審査済みプロフィールを、地域・希望業種・スキル・熱量の観点から絞り込めます。
            </p>
          </div>

          {canManageCandidates(user) ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/candidates/admin"
                className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
              >
                <Crown className="h-4 w-4" />
                管理画面
              </Link>
              <Link
                href="/candidates/admin/new"
                className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
              >
                <UserRoundPlus className="h-4 w-4" />
                候補者を登録
              </Link>
            </div>
          ) : null}
        </header>

        <form
          action="/candidates"
          className="mt-6 rounded border border-zinc-800 bg-black/35 p-4"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Search Filters</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="xl:col-span-2">
              <span className="text-xs font-medium text-zinc-500">キーワード</span>
              <div className="mt-2 flex items-center gap-2 rounded border border-zinc-800 bg-zinc-950 px-3">
                <Search className="h-4 w-4 text-zinc-500" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="名前・地域・経歴・自己PR"
                  className="h-11 w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />
              </div>
            </label>

            <label>
              <span className="text-xs font-medium text-zinc-500">地域</span>
              <select
                name="region"
                defaultValue={region}
                className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none"
              >
                <option value="">すべて</option>
                {regions.map((item) => (
                  <option key={item.region} value={item.region}>
                    {item.region}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-xs font-medium text-zinc-500">希望業種</span>
              <select
                name="industry"
                defaultValue={industry}
                className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none"
              >
                <option value="">すべて</option>
                {industryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-xs font-medium text-zinc-500">スキル</span>
              <select
                name="skill"
                defaultValue={skill}
                className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none"
              >
                <option value="">すべて</option>
                {skillOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-xs font-medium text-zinc-500">審査状態</span>
              <select
                name="status"
                defaultValue={status}
                className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none"
              >
                <option value="">すべて</option>
                {reviewStatusOptions.map((item) => (
                  <option key={item} value={item}>
                    {reviewStatusLabels[item]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-xs font-medium text-zinc-500">並び替え</span>
              <select
                name="sort"
                defaultValue={sort}
                className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none"
              >
                <option value="ai">AIおすすめ</option>
                <option value="age">年齢</option>
                <option value="region">地域</option>
                <option value="experience">経験年数</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={featured}
                className="h-4 w-4 accent-amber-300"
              />
              注目候補のみ表示
            </label>
            <div className="flex gap-2">
              <Link
                href="/candidates"
                className="inline-flex h-11 items-center justify-center rounded border border-zinc-800 px-4 text-sm font-semibold text-zinc-300 transition hover:border-amber-300/30 hover:text-amber-100"
              >
                リセット
              </Link>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
              >
                <Filter className="h-4 w-4" />
                絞り込む
              </button>
            </div>
          </div>
        </form>

        <section className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <Sparkles className="h-4 w-4" />
            <span>{candidates.length} candidates</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-zinc-500 sm:flex">
            <Target className="h-4 w-4 text-amber-300" />
            <span>
              {planConfig.name}プラン表示上限:{" "}
              {formatPlanLimit(visibleCandidateLimit)}
            </span>
          </div>
        </section>

        {candidates.length > 0 ? (
          <section className="grid gap-4 py-5 md:grid-cols-2 xl:grid-cols-3">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                company={user.company}
              />
            ))}
          </section>
        ) : (
          <section className="mt-5 rounded border border-zinc-800 bg-black/35 p-8 text-center">
            <Zap className="mx-auto h-8 w-8 text-amber-300" />
            <h2 className="mt-4 text-xl font-semibold text-white">
              条件に合う候補者がまだいません
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              検索条件をゆるめるか、OWNERに候補者登録を依頼してください。
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
