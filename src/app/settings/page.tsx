import Link from "next/link";
import {
  Bell,
  CreditCard,
  Database,
  FileSearch,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { requireRole, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const settingLinks = [
  {
    href: "/settings/security",
    label: "権限とセキュリティ",
    description: "ロール設計、最新監査ログ、重要設定への導線を確認します。",
    icon: ShieldCheck,
  },
  {
    href: "/settings/billing",
    label: "決済とプラン",
    description: "β無料運用、将来のStripe課金、請求履歴、利用上限を確認します。",
    icon: CreditCard,
  },
  {
    href: "/settings/users",
    label: "社内ユーザー",
    description: "ユーザー追加、権限変更、停止、パスワード再設定を行います。",
    icon: UsersRound,
  },
  {
    href: "/settings/audit",
    label: "監査ログ",
    description: "ログイン、候補者、対話申請、決済、通知の操作履歴を検索します。",
    icon: FileSearch,
  },
  {
    href: "/settings/succession-briefs",
    label: "承継ブリーフ",
    description: "匿名・構造化された承継論点データと集計を確認します。",
    icon: Database,
  },
  {
    href: "/settings/notifications",
    label: "通知ログ",
    description: "メール通知の送信、スキップ、失敗履歴を確認します。",
    icon: Bell,
  },
];

export default async function SettingsPage() {
  const user = await requireUser();
  requireRole(user, ["OWNER", "ADMIN"]);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="border-b border-zinc-800 pb-6">
          <p className="text-sm font-medium text-amber-200/80">
            Operations
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">設定</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            本番運用に必要な権限、請求、監査、通知をまとめて管理します。
          </p>
        </header>

        <section className="grid gap-4 py-6 md:grid-cols-2">
          {settingLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded border border-zinc-800 bg-black/35 p-5 transition hover:border-amber-300/35 hover:bg-amber-300/[0.04]"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded border border-amber-300/25 bg-amber-300/10 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white group-hover:text-amber-100">
                      {item.label}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
