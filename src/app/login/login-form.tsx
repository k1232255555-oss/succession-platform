"use client";

import { useActionState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-4">
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-300"
        >
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-12 w-full rounded border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-300/60"
          placeholder="owner@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-300"
        >
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-12 w-full rounded border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-300/60"
          placeholder="••••••••••••"
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
        <LockKeyhole className="h-4 w-4" />
        {isPending ? "確認中..." : "ログイン"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
