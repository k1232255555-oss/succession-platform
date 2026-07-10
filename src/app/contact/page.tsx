import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { submitContactAction } from "@/app/contact/actions";
import { SiteFooter } from "@/app/site-footer";

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

export default async function ContactPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const notice = getParam(params, "notice");
  const error = getParam(params, "error");
  const topic = getParam(params, "topic") ?? "";
  const topicCategoryMap: Record<string, string> = {
    "founding-member": "第1期 参加事業者の相談",
    sponsor: "協賛・連携の相談",
    support: "活動応援・広報協力",
  };
  const defaultCategory = topicCategoryMap[topic] ?? "導入相談";
  const supportEmail = process.env.SUPPORT_EMAIL?.trim() ?? "";
  const contactEmailConfigured = Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.EMAIL_FROM?.trim() &&
      process.env.CONTACT_TO_EMAIL?.trim(),
  );

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Succession Clubへ戻る
          </Link>

          <section className="mt-8 rounded border border-slate-200 bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">
              <Mail className="h-4 w-4" />
              お問い合わせ窓口
            </div>
            <h1 className="mt-5 text-3xl font-semibold text-slate-950">
              お問い合わせ
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              初期参加、導入相談、候補者情報の訂正・削除依頼、個人情報の取り扱いに関するお問い合わせはこちらからご連絡ください。
            </p>

            {notice ? (
              <div className="mt-5 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {notice}
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                {error}
              </div>
            ) : null}

            {!contactEmailConfigured ? (
              <div className="mt-5 rounded border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                現在、お問い合わせ送信の準備中です。通知設定の完了後に送信できるようになります。
              </div>
            ) : null}

            <div className="mt-6 grid gap-4">
              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-teal-800">連絡方法</p>
                {supportEmail ? (
                  <p className="mt-2 text-sm text-slate-700">{supportEmail}</p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    お問い合わせは、本ページのフォームから受け付けています。
                  </p>
                )}
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  メールアドレス・電話番号等の表示が必要な場合は、法令に従い、請求があった場合に遅滞なく開示します。
                </p>
              </div>

              <form
                action={submitContactAction}
                className="rounded border border-slate-200 bg-white p-4"
              >
                <fieldset disabled={!contactEmailConfigured}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">
                        お名前
                      </span>
                      <input
                        name="name"
                        required
                        maxLength={80}
                        className="mt-2 h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-600 disabled:bg-slate-100"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-medium text-slate-600">
                        メールアドレス
                      </span>
                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={160}
                        className="mt-2 h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-600 disabled:bg-slate-100"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block">
                    <span className="text-xs font-medium text-slate-600">
                      種別
                    </span>
                    <select
                      name="category"
                      className="mt-2 h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-600 disabled:bg-slate-100"
                      defaultValue={defaultCategory}
                    >
                      <option>導入相談</option>
                      <option>第1期 参加事業者の相談</option>
                      <option>協賛・連携の相談</option>
                      <option>活動応援・広報協力</option>
                      <option>候補者情報の訂正・削除依頼</option>
                      <option>個人情報の取り扱い</option>
                      <option>請求・契約</option>
                      <option>その他</option>
                    </select>
                  </label>

                  <label className="mt-4 block">
                    <span className="text-xs font-medium text-slate-600">
                      お問い合わせ内容
                    </span>
                    <textarea
                      name="message"
                      required
                      maxLength={3000}
                      rows={7}
                      className="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-teal-600 disabled:bg-slate-100"
                    />
                  </label>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    送信内容は、問い合わせ対応のため運営宛に通知されます。
                  </p>

                  <button
                    type="submit"
                    className="mt-5 inline-flex h-11 items-center justify-center rounded bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {contactEmailConfigured ? "送信する" : "送信準備中"}
                  </button>
                </fieldset>
              </form>

              <div className="rounded border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-teal-800">
                  <ShieldCheck className="h-4 w-4" />
                  削除・訂正依頼について
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  候補者情報や個人情報の削除・訂正を希望する場合は、対象情報、依頼理由、本人確認に必要な情報を添えてご連絡ください。法令、契約、監査上必要な情報は一定期間保持する場合があります。
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
