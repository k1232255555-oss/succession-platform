import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Handshake,
  HeartHandshake,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const shareText = [
  "後継者不足に悩む事業者と、事業を引き継いで挑戦したい人をつなぐ、招待制クローズドβ「Succession Club」。",
  "未来へ、事業をつなぐ。",
  "https://succession-platform-iota.vercel.app",
].join("\n");

const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  shareText,
)}`;

const contactLinks = [
  {
    title: "第1期 参加事業者",
    body: "初期からこの取り組みに参加してくださる事業者向けに、最大10社までβ期間後も無料でご利用いただける特別枠を用意しています。共同運営者の募集ではありません。",
    href: "/contact?topic=founding-member",
    label: "初期参加について相談する",
    icon: UsersRound,
  },
  {
    title: "協賛・連携に関心のある方",
    body: "士業、金融機関、地域団体、企業、教育機関など、地域の事業承継を一緒に支える連携を検討しています。まずはお問い合わせください。",
    href: "/contact?topic=sponsor",
    label: "協賛・連携を相談する",
    icon: Landmark,
  },
  {
    title: "活動を応援したい方",
    body: "後継者不足の認知拡大、クローズドβ参加者への情報提供、サービス改善に関心のある方はお問い合わせください。現在、サイト上での決済は受け付けていません。",
    href: "/contact?topic=support",
    label: "活動応援について問い合わせる",
    icon: HeartHandshake,
  },
] as const;

export default function PublicHomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.11),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_50%,#030303_100%)]" />

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded border border-amber-300/25 bg-amber-300/10 text-amber-200">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-200/80">
                Succession Club
              </p>
              <p className="text-base font-semibold text-white">
                未来へ、事業をつなぐ。
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/contact"
              className="hidden h-10 items-center justify-center rounded border border-zinc-700 px-3 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/40 hover:text-amber-100 sm:inline-flex"
            >
              お問い合わせ
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded border border-zinc-800 px-3 text-sm font-semibold text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
            >
              ログイン
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <section>
            <div className="inline-flex items-center gap-2 rounded border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm font-medium text-amber-200">
              <LockKeyhole className="h-4 w-4" />
              招待制クローズドβ
            </div>
            <h1 className="mt-6 max-w-5xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-6xl">
              <span className="inline-block">未来へ、</span>
              <span className="inline-block">事業をつなぐ。</span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
              後継者不足に悩む事業者と、事業を引き継いで挑戦したい人をつなぐ、双方向の事業承継マッチングサービスです。
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              M&A、親族承継、従業員承継を否定せず、もう一つの選択肢として、地域の技術・雇用・関係性を未来へつなぐことを目指しています。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact?topic=founding-member"
                className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10"
              >
                初期参加について相談する
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded border border-zinc-700 px-4 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/40 hover:text-amber-100"
              >
                問い合わせる
              </Link>
            </div>
          </section>

          <section className="rounded border border-zinc-800 bg-black/35 p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <ShieldCheck className="h-4 w-4" />
              <h2 className="text-sm font-semibold">信頼を優先するβ運営</h2>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-sm font-semibold text-white">
                  実績を盛りません
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  ダミーの参加企業数、候補者数、マッチング実績は表示しません。
                </p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-sm font-semibold text-white">
                  本人同意を重視します
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  候補者情報や承継プロジェクトは、同意と確認を前提に扱います。
                </p>
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-sm font-semibold text-white">
                  AIは参考情報です
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  参考分析が承継や契約判断を自動決定することはありません。
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="grid gap-4 border-t border-zinc-800 py-8 md:grid-cols-2">
          <article className="rounded border border-zinc-800 bg-black/30 p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <Building2 className="h-4 w-4" />
              <h2 className="text-sm font-semibold">事業を残したい方へ</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              会社名や財務情報をいきなり公開せず、残したい価値、承継の課題、引き継いでほしいことを整理するところから始めます。
            </p>
          </article>

          <article className="rounded border border-zinc-800 bg-black/30 p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <Handshake className="h-4 w-4" />
              <h2 className="text-sm font-semibold">事業を引き継ぎたい方へ</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              年齢や肩書きに限定せず、地域の事業を引き継いで挑戦したい個人、経験者、同業者、移住希望者などを想定しています。
            </p>
          </article>
        </section>

        <section className="border-t border-zinc-800 py-8">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <Sparkles className="h-4 w-4" />
            <span>Co-Creation</span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            この活動を一緒に育てる
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Succession Clubは、地域の事業を未来へつなぐためのクローズドβです。資金募集ではなく、共創・連携・応援に関心のある方との対話を受け付けています。
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {contactLinks.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded border border-zinc-800 bg-black/30 p-5"
                >
                  <div className="flex items-center gap-2 text-amber-100">
                    <Icon className="h-4 w-4" />
                    <p className="text-sm font-semibold">{item.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {item.body}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded border border-zinc-700 px-3 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/40 hover:text-amber-100"
                  >
                    {item.label}
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-4 rounded border border-zinc-800 bg-zinc-950/80 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  この活動を共有する
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                  {shareText}
                </p>
              </div>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded border border-zinc-700 px-3 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/40 hover:text-amber-100"
              >
                Xで共有する
              </a>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-zinc-800 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Succession Club / 未来へ、事業をつなぐ。</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="transition hover:text-amber-100">
              利用規約
            </Link>
            <Link href="/privacy" className="transition hover:text-amber-100">
              プライバシーポリシー
            </Link>
            <Link
              href="/commercial-transaction"
              className="transition hover:text-amber-100"
            >
              特定商取引法に基づく表記
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
