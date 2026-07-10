import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  MonitorX,
  ShieldCheck,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { UserRole } from "@prisma/client";
import {
  createCompanyUserAction,
  resetCompanyUserPasswordAction,
  revokeCompanyUserSessionsAction,
  updateCompanyUserAction,
} from "@/app/settings/users/actions";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const roleLabels: Record<UserRole, string> = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function roleOptions(actorRole: UserRole, currentRole?: UserRole) {
  const manageableRoles =
    actorRole === UserRole.OWNER
      ? [UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER, UserRole.VIEWER]
      : [UserRole.MEMBER, UserRole.VIEWER];
  const roles =
    currentRole && !manageableRoles.includes(currentRole)
      ? [currentRole, ...manageableRoles]
      : manageableRoles;

  return roles.map((role) => (
    <option key={`${currentRole ?? "new"}-${role}`} value={role}>
      {roleLabels[role]}
    </option>
  ));
}

export default async function UsersSettingsPage({ searchParams }: PageProps) {
  const currentUser = await requireUser();
  requireRole(currentUser, ["OWNER", "ADMIN"]);
  const params = (await searchParams) ?? {};

  const users = await prisma.companyUser.findMany({
    where: {
      companyId: currentUser.companyId,
    },
    include: {
      sessions: {
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  const notice = getParam(params, "notice");
  const error = getParam(params, "error");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/settings/security"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
            >
              <ArrowLeft className="h-4 w-4" />
              権限管理へ戻る
            </Link>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <UsersRound className="h-4 w-4" />
              <span>ユーザー管理</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              ユーザー管理
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              社内メンバーの追加、権限変更、アカウント停止、パスワード再設定、セッション失効を管理します。
            </p>
          </div>

          <div className="rounded border border-amber-300/15 bg-black/35 p-4">
            <p className="text-sm text-zinc-400">ログイン中</p>
            <p className="mt-1 font-semibold text-white">{currentUser.name}</p>
            <p className="mt-1 text-sm text-amber-200">{currentUser.role}</p>
          </div>
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

        <section className="grid gap-4 py-6 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <UserPlus className="h-4 w-4" />
              <span>新規ユーザー</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              メンバーを追加
            </h2>

            <form action={createCompanyUserAction} className="mt-5 grid gap-4">
              <label>
                <span className="text-xs font-medium text-zinc-500">名前</span>
                <input
                  name="name"
                  required
                  className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                />
              </label>
              <label>
                <span className="text-xs font-medium text-zinc-500">
                  メールアドレス
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                />
              </label>
              <label>
                <span className="text-xs font-medium text-zinc-500">
                  初期パスワード
                </span>
                <input
                  name="password"
                  type="password"
                  minLength={12}
                  required
                  className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                />
              </label>
              <label>
                <span className="text-xs font-medium text-zinc-500">権限</span>
                <select
                  name="role"
                  defaultValue={UserRole.MEMBER}
                  className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                >
                  {roleOptions(currentUser.role)}
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
              >
                <UserPlus className="h-4 w-4" />
                作成する
              </button>
            </form>
          </article>

          <section className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <ShieldCheck className="h-4 w-4" />
              <span>登録ユーザー</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              登録ユーザー
            </h2>

            <div className="mt-5 grid gap-4">
              {users.map((user) => {
                const updateAction = updateCompanyUserAction.bind(null, user.id);
                const passwordAction = resetCompanyUserPasswordAction.bind(
                  null,
                  user.id,
                );
                const revokeAction = revokeCompanyUserSessionsAction.bind(
                  null,
                  user.id,
                );
                const canEditOwner =
                  user.role !== UserRole.OWNER ||
                  currentUser.role === UserRole.OWNER;

                return (
                  <article
                    key={user.id}
                    className="rounded border border-zinc-800 bg-black/35 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {user.name}
                          </h3>
                          <span className="rounded border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-200">
                            {user.role}
                          </span>
                          <span
                            className={`rounded border px-2 py-1 text-xs font-semibold ${
                              user.isActive
                                ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                                : "border-red-400/20 bg-red-400/10 text-red-200"
                            }`}
                          >
                            {user.isActive ? "有効" : "停止中"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          アクティブセッション: {user.sessions.length}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500">
                        最終ログイン:{" "}
                        {user.lastLoginAt
                          ? user.lastLoginAt.toLocaleString("ja-JP")
                          : "-"}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <form
                        action={updateAction}
                        className="grid gap-3 md:grid-cols-[1fr_160px_120px_auto]"
                      >
                        <input
                          name="name"
                          defaultValue={user.name}
                          disabled={!canEditOwner}
                          className="h-11 rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50 disabled:opacity-50"
                        />
                        <select
                          name="role"
                          defaultValue={user.role}
                          disabled={!canEditOwner}
                          className="h-11 rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50 disabled:opacity-50"
                        >
                          {roleOptions(currentUser.role, user.role)}
                        </select>
                        <label className="inline-flex h-11 items-center gap-2 rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300">
                          <input
                            type="checkbox"
                            name="isActive"
                            defaultChecked={user.isActive}
                            disabled={!canEditOwner || user.id === currentUser.id}
                            className="h-4 w-4 accent-amber-300"
                          />
                          有効
                        </label>
                        <button
                          type="submit"
                          disabled={!canEditOwner}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10 disabled:opacity-50"
                        >
                          <UserCog className="h-4 w-4" />
                          更新
                        </button>
                      </form>

                      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                        <form action={passwordAction} className="flex gap-2">
                          <input
                            name="password"
                            type="password"
                            minLength={12}
                            placeholder="新しいパスワード"
                            disabled={!canEditOwner}
                            className="h-11 min-w-0 flex-1 rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-300/50 disabled:opacity-50"
                          />
                          <button
                            type="submit"
                            disabled={!canEditOwner}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded border border-zinc-800 px-4 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/30 hover:text-amber-100 disabled:opacity-50"
                          >
                            <KeyRound className="h-4 w-4" />
                            再設定
                          </button>
                        </form>

                        <form action={revokeAction}>
                          <button
                            type="submit"
                            disabled={!canEditOwner}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-zinc-800 px-4 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/30 hover:text-amber-100 disabled:opacity-50"
                          >
                            <MonitorX className="h-4 w-4" />
                            セッション失効
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
