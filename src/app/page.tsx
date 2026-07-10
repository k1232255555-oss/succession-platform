import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Handshake,
  HeartHandshake,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { PublicShareActions } from "@/app/share-actions";
import { SiteFooter } from "@/app/site-footer";

const shareText = [
  "後継者不足に悩む事業者と、事業を引き継いで挑戦したい人をつなぐ仕組みを検証する、招待制クローズドβ「Succession Club」。",
  "未来へ、事業をつなぐ。",
  "https://succession-platform-iota.vercel.app",
].join("\n");

const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  shareText,
)}`;

const contactLinks = [
  {
    title: "第1期 参加事業者",
    body: "初期から取り組みに参加してくださる最大10社には、現在提供中の基本機能をβ終了後も無料で提供する方針です。対象範囲は事前に明示し、共同運営者を募集するものではありません。",
    href: "/contact?topic=founding-member",
    label: "初期参加について相談する",
    icon: UsersRound,
  },
  {
    title: "協賛・連携に関心のある方",
    body: "士業、金融機関、地域団体、企業、教育機関など、地域の事業承継を支える連携を検討しています。",
    href: "/contact?topic=sponsor",
    label: "協賛・連携を相談する",
    icon: Landmark,
  },
  {
    title: "活動を応援したい方",
    body: "後継者不足の認知拡大や、クローズドβ参加者への情報提供に関心のある方からのご相談を受け付けています。サイト上での決済は行っていません。",
    href: "/contact?topic=support",
    label: "活動応援について相談する",
    icon: HeartHandshake,
  },
] as const;

const trustItems = [
  {
    title: "実績を盛りません",
    body: "ダミーの参加企業数、候補者数、マッチング実績は表示しません。",
  },
  {
    title: "本人同意を重視します",
    body: "候補者情報や承継プロジェクトは、同意と確認を前提に扱います。",
  },
  {
    title: "AIは参考情報です",
    body: "参考分析が承継や契約判断を自動決定することはありません。",
  },
] as const;

export default function PublicHomePage() {
  return (
    <>
      <main className="bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded border border-teal-200 bg-teal-50 text-teal-700">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Succession Club
                </p>
                <p className="text-base font-semibold text-slate-950">
                  未来へ、事業をつなぐ。
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/contact"
                className="hidden h-10 items-center justify-center rounded border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-800 sm:inline-flex"
              >
                お問い合わせ
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
              >
                ログイン
              </Link>
            </nav>
          </div>
        </header>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">
              <LockKeyhole className="h-4 w-4" />
              招待制クローズドβ
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              <span className="inline-block">未来へ、</span>
              <span className="inline-block">事業をつなぐ。</span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
              後継者不足に悩む事業者と、事業を引き継いで挑戦したい人をつなぐ仕組みを検証するクローズドβです。
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              現在は事業者側からの候補者閲覧・対話申請を中心に検証しています。M&A、親族承継、従業員承継を否定せず、もう一つの選択肢として地域の技術・雇用・関係性を未来へつなぐことを目指します。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact?topic=founding-member"
                className="inline-flex h-11 items-center justify-center gap-2 rounded bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
              >
                初期参加について相談する
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-800"
              >
                問い合わせる
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid w-full max-w-6xl gap-0 px-4 sm:px-6 md:grid-cols-3 lg:px-10">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="border-b border-slate-200 py-6 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <div className="flex items-center gap-2 text-teal-700">
                  <ShieldCheck className="h-4 w-4" />
                  <h2 className="text-sm font-semibold text-slate-950">
                    {item.title}
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-10">
          <article className="rounded border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-teal-700">
              <Building2 className="h-4 w-4" />
              <h2 className="text-base font-semibold text-slate-950">
                事業を残したい方へ
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              会社名や財務情報をいきなり公開せず、残したい価値、承継の課題、引き継いでほしいことを整理するところから始めます。
            </p>
          </article>

          <article className="rounded border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-teal-700">
              <Handshake className="h-4 w-4" />
              <h2 className="text-base font-semibold text-slate-950">
                事業を引き継ぎたい方へ
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              年齢や肩書きに限定せず、地域の事業を引き継いで挑戦したい個人、経験者、同業者、移住希望者などを想定しています。
            </p>
          </article>
        </section>

        <section className="border-t border-slate-200 bg-slate-100">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
            <p className="text-sm font-semibold text-teal-700">初期参加・連携</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              事業承継の新しい選択肢を育てる
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Succession Clubは、地域の事業を未来へつなぐためのクローズドβです。資金募集ではなく、初期参加・連携・活動応援に関する相談を受け付けています。
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {contactLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="flex flex-col rounded border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center gap-2 text-teal-700">
                      <Icon className="h-4 w-4" />
                      <h3 className="text-sm font-semibold text-slate-950">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.body}
                    </p>
                    <Link
                      href={item.href}
                      className="mt-5 inline-flex h-10 items-center justify-center self-start rounded border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-800"
                    >
                      {item.label}
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 border-t border-slate-300 pt-6">
              <p className="text-sm font-semibold text-slate-950">
                この活動を共有する
              </p>
              <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {shareText}
              </p>
              <PublicShareActions
                shareText={shareText}
                shareUrl={shareUrl}
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
