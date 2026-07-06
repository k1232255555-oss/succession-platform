import Link from "next/link";
import { AuditAction, type Prisma } from "@prisma/client";
import {
  ArrowLeft,
  FileSearch,
  Filter,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { formatAuditAction } from "@/lib/audit";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

function formatMetadata(metadata: Prisma.JsonValue | null) {
  if (!metadata) {
    return "-";
  }

  return JSON.stringify(metadata, null, 2);
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  const user = await requireUser();
  requireRole(user, ["OWNER", "ADMIN"]);
  const params = (await searchParams) ?? {};
  const action = getParam(params, "action") ?? "";
  const actorId = getParam(params, "actorId") ?? "";
  const q = getParam(params, "q")?.trim() ?? "";

  const actionFilter = Object.values(AuditAction).includes(
    action as AuditAction,
  )
    ? (action as AuditAction)
    : undefined;

  const where: Prisma.AuditLogWhereInput = {
    companyId: user.companyId,
    ...(actionFilter ? { action: actionFilter } : {}),
    ...(actorId ? { actorId } : {}),
  };

  if (q) {
    where.OR = [
      { ipAddress: { contains: q, mode: "insensitive" } },
      { userAgent: { contains: q, mode: "insensitive" } },
      { actor: { email: { contains: q, mode: "insensitive" } } },
      { actor: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [auditLogs, users] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    }),
    prisma.companyUser.findMany({
      where: {
        companyId: user.companyId,
      },
      orderBy: {
        email: "asc",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
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
              <FileSearch className="h-4 w-4" />
              <span>Audit Trail</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              監査ログ検索
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              ログイン、ユーザー管理、候補者管理、対話申請を横断して確認できます。
            </p>
          </div>

          <div className="rounded border border-amber-300/15 bg-black/35 p-4">
            <p className="text-sm text-zinc-400">表示件数</p>
            <p className="mt-1 text-3xl font-semibold text-amber-300">
              {auditLogs.length}
            </p>
          </div>
        </header>

        <form
          action="/settings/audit"
          className="mt-6 rounded border border-zinc-800 bg-black/35 p-4"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto_auto]">
            <input
              name="q"
              defaultValue={q}
              placeholder="メール、名前、IP、User-Agent"
              className="h-11 rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-300/50"
            />
            <select
              name="action"
              defaultValue={action}
              className="h-11 rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
            >
              <option value="">すべての操作</option>
              {Object.values(AuditAction).map((item) => (
                <option key={item} value={item}>
                  {formatAuditAction(item)}
                </option>
              ))}
            </select>
            <select
              name="actorId"
              defaultValue={actorId}
              className="h-11 rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
            >
              <option value="">すべてのユーザー</option>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.email}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
            >
              検索
            </button>
            <Link
              href="/settings/audit"
              className="inline-flex h-11 items-center justify-center rounded border border-zinc-800 px-4 text-sm font-semibold text-zinc-300 transition hover:border-amber-300/30 hover:text-amber-100"
            >
              リセット
            </Link>
          </div>
        </form>

        <section className="mt-6 grid gap-4">
          {auditLogs.map((log) => (
            <article
              key={log.id}
              className="rounded border border-zinc-800 bg-zinc-950/85 p-5"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                      {formatAuditAction(log.action)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {log.createdAt.toLocaleString("ja-JP")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                    <UserRound className="h-4 w-4 text-amber-300" />
                    <span>{log.actor?.email ?? "System"}</span>
                  </div>
                </div>
                <div className="text-xs leading-6 text-zinc-500 lg:text-right">
                  <p>IP: {log.ipAddress ?? "-"}</p>
                  <p className="max-w-xl truncate">
                    UA: {log.userAgent ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded border border-zinc-800 bg-black/35 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                  <span>metadata</span>
                </div>
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-6 text-zinc-300">
                  {formatMetadata(log.metadata)}
                </pre>
              </div>
            </article>
          ))}

          {auditLogs.length === 0 ? (
            <section className="rounded border border-zinc-800 bg-black/35 p-8 text-center">
              <FileSearch className="mx-auto h-8 w-8 text-amber-300" />
              <h2 className="mt-4 text-xl font-semibold text-white">
                条件に合う監査ログはありません
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                条件を変えて再検索してください。
              </p>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
