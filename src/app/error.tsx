"use client";

import { RotateCcw, ShieldAlert } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-zinc-100">
      <section className="w-full max-w-lg rounded border border-amber-300/20 bg-black/45 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded border border-amber-300/30 bg-amber-300/10 text-amber-200">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-white">
          画面を読み込めませんでした
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          一時的な問題が発生しました。再読み込みしても解消しない場合は、運営チームに連絡してください。
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
        >
          <RotateCcw className="h-4 w-4" />
          再読み込み
        </button>
      </section>
    </main>
  );
}
