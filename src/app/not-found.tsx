import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-zinc-100">
      <section className="w-full max-w-lg rounded border border-amber-300/20 bg-black/45 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded border border-amber-300/30 bg-amber-300/10 text-amber-200">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <p className="mt-5 text-sm font-medium text-amber-200/80">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          ページが見つかりません
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          招待制のエリア、またはまだ公開されていない画面にアクセスしています。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードへ戻る
        </Link>
      </section>
    </main>
  );
}
