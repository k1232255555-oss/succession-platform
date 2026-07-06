import { AuditAction } from "@prisma/client";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const roleDescriptions = [
  {
    role: "OWNER",
    description: "全権限。請求、ユーザー管理、監査ログ確認が可能。",
  },
  {
    role: "ADMIN",
    description: "ユーザー管理と監査ログ確認が可能。OWNER移譲は不可。",
  },
  {
    role: "MEMBER",
    description: "候補者閲覧、スカウト、メッセージ対応が可能。",
  },
  {
    role: "VIEWER",
    description: "閲覧のみ。スカウトや設定変更は不可。",
  },
];

function formatAction(action: AuditAction) {
  return action
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function SecuritySettingsPage() {
  const user = await requireUser();
  requireRole(user, ["OWNER", "ADMIN"]);

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      companyId: user.companyId,
    },
    include: {
      actor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-3 border-b border-zinc-800 pb-6">
          <p className="text-sm font-medium text-amber-200/80">
            Security & Access
          </p>
          <h1 className="text-3xl font-semibold text-white">
            権限管理と監査ログ
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            企業アカウントの権限設計と、重要操作の履歴を確認できます。
          </p>
        </div>

        <section className="grid gap-4 py-6 md:grid-cols-2 xl:grid-cols-4">
          {roleDescriptions.map((item) => (
            <article
              key={item.role}
              className="rounded border border-zinc-800 bg-black/35 p-5"
            >
              <h2 className="text-lg font-semibold text-amber-200">
                {item.role}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
          <h2 className="text-xl font-semibold text-white">Recent Audit Logs</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr className="border-b border-zinc-800">
                  <th className="py-3 pr-4 font-medium">日時</th>
                  <th className="py-3 pr-4 font-medium">操作</th>
                  <th className="py-3 pr-4 font-medium">ユーザー</th>
                  <th className="py-3 pr-4 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-900">
                    <td className="py-3 pr-4 text-zinc-400">
                      {log.createdAt.toLocaleString("ja-JP")}
                    </td>
                    <td className="py-3 pr-4 font-medium text-amber-200">
                      {formatAction(log.action)}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">
                      {log.actor?.email ?? "System"}
                    </td>
                    <td className="py-3 pr-4 text-zinc-500">
                      {log.ipAddress ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
