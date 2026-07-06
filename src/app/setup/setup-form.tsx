"use client";

import { useActionState } from "react";
import { Crown, Sparkles } from "lucide-react";
import { setupOwnerAction, type SetupState } from "@/app/setup/actions";

const initialState: SetupState = {};

export function SetupForm() {
  const [state, formAction, isPending] = useActionState(
    setupOwnerAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="companyName"
            className="text-sm font-medium text-zinc-300"
          >
            企業名
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            className="mt-2 h-12 w-full rounded border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-amber-300/60"
            placeholder="Legacy Works"
          />
        </div>

        <div>
          <label
            htmlFor="companySlug"
            className="text-sm font-medium text-zinc-300"
          >
            企業スラッグ
          </label>
          <input
            id="companySlug"
            name="companySlug"
            required
            className="mt-2 h-12 w-full rounded border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-amber-300/60"
            placeholder="legacy-works"
          />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="text-sm font-medium text-zinc-300">
          管理者名
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-2 h-12 w-full rounded border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-amber-300/60"
          placeholder="山田 太郎"
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-12 w-full rounded border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-amber-300/60"
          placeholder="owner@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-300"
        >
          初期パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="mt-2 h-12 w-full rounded border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-amber-300/60"
          placeholder="12文字以上"
        />
      </div>

      {state.error ? (
        <p className="rounded border border-red-400/30 bg-red-950/35 px-4 py-3 text-sm text-red-100">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Crown className="h-4 w-4" />
        {isPending ? "作成中..." : "OWNERアカウントを作成"}
        <Sparkles className="h-4 w-4" />
      </button>
    </form>
  );
}
