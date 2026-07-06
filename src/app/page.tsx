import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  ChevronRight,
  Crown,
  Flame,
  Handshake,
  Home,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserRoundSearch,
  UsersRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/app/logout-button";
import { requireUser } from "@/lib/auth";
import { getCandidateScore } from "@/lib/candidates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "ダッシュボード", href: "/", icon: Home, active: true },
  { label: "後継者候補を探す", href: "/candidates", icon: UserRoundSearch, active: false },
  { label: "スカウト管理", href: "/scouts", icon: Handshake, active: false },
  { label: "メッセージ", href: "#messages", icon: MessageCircle, active: false },
  { label: "設定", href: "/settings/security", icon: Settings, active: false },
];

const tractionStats = [
  { label: "参加企業", value: "42", suffix: "社" },
  { label: "審査済みの若者", value: "128", suffix: "名" },
  { label: "今月の新規マッチング", value: "15", suffix: "件" },
];

const pipelineItems = [
  { label: "プロフィール閲覧", value: "24", icon: UsersRound },
  { label: "スカウト送信", value: "8", icon: Mail },
  { label: "面談調整中", value: "3", icon: CalendarClock },
  { label: "最終候補", value: "1", icon: Crown },
];

const signals = [
  "AI活用に強い候補者の応募が前週比32%増加",
  "地方製造業への関心が高い候補者が18名待機中",
  "SNS再建を志望する候補者の返信率が上昇中",
];

const messagePreviews = [
  {
    name: "Mika",
    text: "御社の受発注業務を見える化する仮説をまとめました。",
    time: "12分前",
  },
  {
    name: "Takumi",
    text: "現場見学の日程候補を3ついただけますか。",
    time: "1時間前",
  },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const successorCandidates = await prisma.successorCandidate.findMany({
    where: {
      companyId: user.companyId,
    },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    take: 4,
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
        <aside className="border-b border-amber-300/10 bg-black/55 px-4 py-4 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <div className="flex items-center justify-between lg:block">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded border border-amber-300/30 bg-amber-300/10 text-amber-300 shadow-[0_0_24px_rgba(212,175,55,0.16)]">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-200/80">
                    Succession Club
                  </p>
                  <h1 className="text-lg font-semibold tracking-wide text-white">
                    Legacy Gate
                  </h1>
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label="通知"
              className="grid h-10 w-10 place-items-center rounded border border-zinc-800 bg-zinc-950 text-zinc-300 transition hover:border-amber-300/40 hover:text-amber-200 lg:hidden"
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`group flex min-w-max items-center gap-3 rounded px-4 py-3 text-sm font-medium transition ${
                    item.active
                      ? "border border-amber-300/30 bg-amber-300/10 text-amber-200 shadow-[0_0_26px_rgba(212,175,55,0.12)]"
                      : "border border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/80 hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-8 hidden rounded border border-amber-300/15 bg-zinc-950/80 p-4 lg:block">
            <div className="flex items-center gap-2 text-amber-200">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm font-semibold">完全審査制</p>
            </div>
            <p className="mt-3 text-xs leading-6 text-zinc-400">
              企業情報と候補者プロフィールは承認済みメンバーにのみ公開されます。
            </p>
          </div>
        </aside>

        <section className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <header className="flex flex-col gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
                <Sparkles className="h-4 w-4" />
                <span>Enterprise Dashboard</span>
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                次の継承者候補を見つける
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                資金力よりも、熱量・視点・現場に飛び込む覚悟を軸に、審査済みの若者と出会えます。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="候補者を検索"
                className="grid h-11 w-11 place-items-center rounded border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition hover:border-amber-300/40 hover:text-amber-200"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="通知"
                className="hidden h-11 w-11 place-items-center rounded border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition hover:border-amber-300/40 hover:text-amber-200 lg:grid"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="hidden h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black shadow-[0_0_28px_rgba(251,191,36,0.22)] transition hover:bg-amber-200 sm:inline-flex"
              >
                <Handshake className="h-4 w-4" />
                優先スカウト
              </button>
              <LogoutButton />
            </div>
          </header>

          <section className="mt-6 rounded border border-zinc-800 bg-black/30 p-4">
            <p className="text-sm text-zinc-400">
              ログイン中:{" "}
              <span className="font-semibold text-zinc-100">{user.name}</span>
              {" / "}
              <span className="text-amber-200">{user.company.name}</span>
              {" / "}
              <span className="text-zinc-300">{user.role}</span>
            </p>
          </section>

          <section className="grid gap-3 py-6 sm:grid-cols-3">
            {tractionStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded border border-amber-300/15 bg-black/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-amber-300 sm:text-5xl">
                    {stat.value}
                  </span>
                  <span className="pb-1 text-sm font-medium text-amber-100/80">
                    {stat.suffix}
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 pb-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded border border-zinc-800 bg-black/30 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
                    <TrendingUp className="h-4 w-4" />
                    <span>Scout Pipeline</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    承継候補者との進行状況
                  </h3>
                </div>
                <p className="text-sm text-zinc-400">
                  今週のアクション期限:{" "}
                  <span className="font-semibold text-amber-200">残り2日</span>
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {pipelineItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded border border-zinc-800 bg-zinc-950/80 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Icon className="h-4 w-4 text-amber-300" />
                        <span className="text-2xl font-semibold text-white">
                          {item.value}
                        </span>
                      </div>
                      <p className="mt-3 text-xs font-medium text-zinc-400">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded border border-amber-300/15 bg-amber-300/[0.06] p-5">
              <div className="flex items-center gap-2 text-amber-200">
                <LockKeyhole className="h-4 w-4" />
                <h3 className="text-sm font-semibold">審査済みシグナル</h3>
              </div>
              <div className="mt-4 space-y-3">
                {signals.map((signal) => (
                  <p key={signal} className="text-sm leading-6 text-zinc-300">
                    {signal}
                  </p>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 py-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
                <Flame className="h-4 w-4" />
                <span>Successor Candidates</span>
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                熱量で選ばれた後継者候補
              </h3>
            </div>

            <Link
              href="/candidates"
              className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
            >
              すべて見る
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>

          <section
            id="candidates"
            className="grid gap-4 py-5 md:grid-cols-2 xl:grid-cols-4"
          >
            {successorCandidates.map((candidate) => (
              <article
                key={candidate.id}
                className="group flex min-h-[420px] flex-col rounded border border-zinc-800 bg-zinc-950/85 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.34)] transition hover:border-amber-300/35 hover:shadow-[0_20px_70px_rgba(212,175,55,0.10)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-300/70">
                      Verified Talent
                    </p>
                    <h4 className="mt-3 text-xl font-semibold text-white">
                      {candidate.name} / {candidate.age}歳
                    </h4>
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium text-zinc-500">
                      <MapPin className="h-3.5 w-3.5 text-amber-300/80" />
                      <span>{candidate.region}</span>
                    </div>
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded border border-amber-300/20 bg-amber-300/10 text-amber-200">
                    <Star className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-5 text-lg font-semibold leading-7 text-zinc-100">
                  {candidate.selfPr}
                </p>

                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  {candidate.career}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {candidate.skills.slice(0, 3).map((field) => (
                    <span
                      key={field}
                      className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300"
                    >
                      {field}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <div className="mb-4 flex items-center justify-between rounded border border-zinc-800 bg-black/35 px-3 py-3">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Target className="h-4 w-4 text-amber-300" />
                      <span>熱量スコア</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-300">
                      <Zap className="h-4 w-4" />
                      <span className="text-lg font-semibold">
                        {getCandidateScore(candidate)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded border border-zinc-700 px-4 text-sm font-semibold text-zinc-100 transition hover:border-amber-300/40 hover:bg-zinc-900"
                    >
                      プロフィール詳細を見る
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 py-3 text-sm font-bold text-black shadow-[0_0_28px_rgba(251,191,36,0.24)] transition hover:bg-amber-200"
                    >
                      スカウトする
                      <span className="text-xs font-semibold">
                        （マッチング料発生）
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {successorCandidates.length === 0 ? (
              <div className="rounded border border-zinc-800 bg-zinc-950/85 p-6 md:col-span-2 xl:col-span-4">
                <p className="text-sm leading-6 text-zinc-400">
                  まだ候補者が登録されていません。OWNERは管理画面から初期候補者を登録できます。
                </p>
              </div>
            ) : null}
          </section>

          <section
            id="messages"
            className="grid gap-4 pb-8 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
                    <MessageCircle className="h-4 w-4" />
                    <span>Message Room</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    返信待ちの候補者
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label="メッセージを開く"
                  className="grid h-10 w-10 place-items-center rounded border border-zinc-800 text-zinc-300 transition hover:border-amber-300/40 hover:text-amber-200"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {messagePreviews.map((message) => (
                  <div
                    key={message.name}
                    className="rounded border border-zinc-800 bg-black/35 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{message.name}</p>
                      <span className="text-xs text-amber-200/70">
                        {message.time}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {message.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-amber-300/15 bg-black/35 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
                    <Sparkles className="h-4 w-4" />
                    <span>Next Best Action</span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    今週は「現場見学」まで進める候補者を1名選定
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                    熱量スコア、返信速度、志望領域の一致度から、初回面談後の温度感が高い候補者を優先表示しています。
                  </p>
                </div>
                <Link
                  href="/scouts"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
                >
                  推奨候補を見る
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
