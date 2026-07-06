import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";
import { NotificationStatus, NotificationType } from "@prisma/client";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusStyles: Record<NotificationStatus, string> = {
  PENDING: "border-zinc-700 bg-zinc-900 text-zinc-300",
  SENT: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  SKIPPED: "border-zinc-700 bg-zinc-900 text-zinc-400",
  FAILED: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

const typeLabels: Record<NotificationType, string> = {
  SCOUT_CREATED: "スカウト作成",
  MESSAGE_SENT: "メッセージ送信",
  BILLING_PAYMENT_FAILED: "決済失敗",
  MESSAGE_THREAD_CLOSED: "スレッド終了",
};

function getEmailConfigStatus() {
  if (process.env.NOTIFICATION_EMAILS_ENABLED !== "true") {
    return "メール通知は無効です";
  }

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return "メール通知の環境変数が不足しています";
  }

  return "メール通知は有効です";
}

export default async function NotificationSettingsPage() {
  const user = await requireUser();
  requireRole(user, ["OWNER", "ADMIN"]);

  const notifications = await prisma.notificationLog.findMany({
    where: {
      companyId: user.companyId,
    },
    include: {
      recipientUser: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-amber-200/80">
              Notifications
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              通知ログ
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              スカウト、メッセージ、決済失敗のメール通知履歴を確認できます。
            </p>
          </div>
          <Link
            href="/settings/security"
            className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
          >
            <Bell className="h-4 w-4" />
            設定へ戻る
          </Link>
        </div>

        <section className="grid gap-4 py-6 md:grid-cols-3">
          <div className="rounded border border-zinc-800 bg-black/35 p-5">
            <p className="text-sm text-zinc-500">設定状態</p>
            <p className="mt-2 text-lg font-semibold text-amber-200">
              {getEmailConfigStatus()}
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-black/35 p-5">
            <p className="text-sm text-zinc-500">直近ログ</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {notifications.length}
            </p>
          </div>
          <div className="rounded border border-zinc-800 bg-black/35 p-5">
            <p className="text-sm text-zinc-500">失敗</p>
            <p className="mt-2 text-3xl font-semibold text-rose-200">
              {
                notifications.filter(
                  (notification) =>
                    notification.status === NotificationStatus.FAILED,
                ).length
              }
            </p>
          </div>
        </section>

        <section className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Recent Logs</h2>
            <span className="text-xs text-zinc-500">直近100件</span>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr className="border-b border-zinc-800">
                  <th className="py-3 pr-4 font-medium">日時</th>
                  <th className="py-3 pr-4 font-medium">種別</th>
                  <th className="py-3 pr-4 font-medium">状態</th>
                  <th className="py-3 pr-4 font-medium">宛先</th>
                  <th className="py-3 pr-4 font-medium">件名</th>
                  <th className="py-3 pr-4 font-medium">詳細</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className="border-b border-zinc-900 align-top"
                  >
                    <td className="py-3 pr-4 text-zinc-400">
                      {notification.createdAt.toLocaleString("ja-JP")}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">
                      {typeLabels[notification.type]}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded border px-2.5 py-1 text-xs font-semibold ${statusStyles[notification.status]}`}
                      >
                        {notification.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">
                      <div>{notification.recipientEmail}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {notification.recipientUser?.name ?? "削除済みユーザー"}
                      </div>
                    </td>
                    <td className="max-w-sm py-3 pr-4 text-zinc-300">
                      {notification.subject}
                    </td>
                    <td className="py-3 pr-4 text-zinc-500">
                      {notification.errorMessage ? (
                        <span className="text-rose-200">
                          {notification.errorMessage}
                        </span>
                      ) : notification.providerMessageId ? (
                        <span className="inline-flex items-center gap-1 text-emerald-200">
                          {notification.providerMessageId}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        "-"
                      )}
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
