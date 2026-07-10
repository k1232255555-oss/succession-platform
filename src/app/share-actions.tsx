"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

export function PublicShareActions({
  shareText,
  shareUrl,
}: {
  shareText: string;
  shareUrl: string;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <a
        href={shareUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-800"
      >
        Xで共有する
        <ExternalLink className="h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={copyShareText}
        className="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-800"
      >
        {copyState === "copied" ? (
          <Check className="h-4 w-4 text-teal-700" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copyState === "copied" ? "コピーしました" : "文面とURLをコピー"}
      </button>
      <p aria-live="polite" className="self-center text-xs text-slate-500">
        {copyState === "failed"
          ? "コピーできませんでした。表示中の文面を選択してコピーしてください。"
          : ""}
      </p>
    </div>
  );
}
