import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Legacy Gateへ戻る
        </Link>

        <section className="mt-8 rounded border border-zinc-800 bg-black/35 p-6">
          <div className="inline-flex items-center gap-2 rounded border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm font-medium text-amber-200">
            <Mail className="h-4 w-4" />
            Contact
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-white">
            お問い合わせ
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            導入相談、契約、請求、候補者情報の訂正・削除依頼、個人情報の取り扱いに関するお問い合わせはこちらからご連絡ください。
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm font-semibold text-amber-200">
                連絡先メールアドレス
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                support@your-production-domain.example
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                正式公開前に、実際のサポート用メールアドレスへ差し替えてください。
              </p>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                <ShieldCheck className="h-4 w-4" />
                削除・訂正依頼について
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                候補者情報や個人情報の削除・訂正を希望する場合は、対象情報、依頼理由、本人確認に必要な情報を添えてご連絡ください。法令、契約、監査上必要な情報は一定期間保持する場合があります。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
