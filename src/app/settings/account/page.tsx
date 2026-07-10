import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Clock3,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AuditAction } from "@prisma/client";
import { changeOwnPasswordAction } from "@/app/settings/account/actions";
import { formatAuditAction } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const accountAuditLabels: Partial<Record<AuditAction, string>> = {
  [AuditAction.LOGIN_SUCCESS]: "ログイン",
  [AuditAction.LOGIN_FAILED]: "ログイン失敗",
  [AuditAction.LOGOUT]: "ログアウト",
  [AuditAction.SESSION_REVOKED]: "セッション終了",
  [AuditAction.USER_UPDATED]: "アカウント情報更新",
};

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

export default async function AccountSettingsPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const notice = getParam(params, "notice");
  const error = getParam(params, "error");
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      companyId: user.companyId,
      actorId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  const accountItems = [
    { label: "名前", value: user.name, icon: UserRound },
    { label: "メールアドレス", value: user.email, icon: Mail },
    { label: "所属会社", value: user.company.name, icon: Building2 },
    { label: "ロール", value: user.role, icon: ShieldCheck },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードへ戻る
        </Link>

        <header className="mt-6 border-b border-zinc-800 pb-6">
          <p className="text-sm font-medium text-amber-200/80">
            アカウント設定
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            マイページ
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            登録情報の確認と、ご自身のログインパスワードの変更ができます。
          </p>
        </header>

        {notice ? (
          <div className="mt-5 rounded border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 py-6 sm:grid-cols-2">
          {accountItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className="rounded border border-zinc-800 bg-black/35 p-5"
              >
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Icon className="h-4 w-4 text-amber-200" />
                  <span>{item.label}</span>
                </div>
                <p className="mt-3 break-words font-semibold text-white">
                  {item.value}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 pb-8 lg:grid-cols-2">
          <article className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <KeyRound className="h-4 w-4" />
              <h2 className="text-lg font-semibold">パスワード変更</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              変更後は、この画面を開いている端末以外を含む既存セッションを終了し、新しいセッションを発行します。
            </p>

            <form action={changeOwnPasswordAction} className="mt-5 grid gap-4">
              <label>
                <span className="text-xs font-medium text-zinc-500">
                  現在のパスワード
                </span>
                <input
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  required
                  className="mt-2 h-11 w-full rounded border border-zinc-800 bg-black px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                />
              </label>
              <label>
                <span className="text-xs font-medium text-zinc-500">
                  新しいパスワード
                </span>
                <input
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  required
                  className="mt-2 h-11 w-full rounded border border-zinc-800 bg-black px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                />
              </label>
              <label>
                <span className="text-xs font-medium text-zinc-500">
                  新しいパスワード（確認）
                </span>
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  required
                  className="mt-2 h-11 w-full rounded border border-zinc-800 bg-black px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
              >
                <KeyRound className="h-4 w-4" />
                パスワードを変更
              </button>
            </form>
          </article>

          <article className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <Clock3 className="h-4 w-4" />
              <h2 className="text-lg font-semibold">最近の操作</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded border border-zinc-800 bg-black/35 p-4"
                >
                  <p className="text-sm font-semibold text-zinc-100">
                    {accountAuditLabels[log.action] ??
                      formatAuditAction(log.action)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {log.createdAt.toLocaleString("ja-JP")}
                  </p>
                </div>
              ))}
              {auditLogs.length === 0 ? (
                <p className="rounded border border-zinc-800 bg-black/35 p-4 text-sm text-zinc-400">
                  表示できる操作履歴はまだありません。
                </p>
              ) : null}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
