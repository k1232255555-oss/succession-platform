import Link from "next/link";
import {
  ArrowUpRight,
  Inbox,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { MessageThreadStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { getMessagePreview, getUnreadCount } from "@/lib/messages";
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

export default async function MessagesPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const q = getParam(params, "q")?.trim() ?? "";
  const status = getParam(params, "status") ?? "";
  const notice = getParam(params, "notice");
  const error = getParam(params, "error");

  const threadStatus = Object.values(MessageThreadStatus).includes(
    status as MessageThreadStatus,
  )
    ? (status as MessageThreadStatus)
    : undefined;

  const threads = await prisma.messageThread.findMany({
    where: {
      companyId: user.companyId,
      ...(threadStatus ? { status: threadStatus } : {}),
      ...(q
        ? {
            OR: [
              { subject: { contains: q, mode: "insensitive" } },
              {
                scoutRequest: {
                  candidate: {
                    name: { contains: q, mode: "insensitive" },
                  },
                },
              },
              {
                messages: {
                  some: {
                    body: { contains: q, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      scoutRequest: {
        include: {
          candidate: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        include: {
          readReceipts: {
            where: {
              userId: user.id,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
            >
              <MessageCircle className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              メッセージ
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              対話申請ごとの相談スレッドを確認できます。候補者側・運営側連携に拡張しやすいメッセージ基盤です。
            </p>
          </div>

          <Link
            href="/scouts"
            className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
          >
            対話申請管理
            <ArrowUpRight className="h-4 w-4" />
          </Link>
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

        <form
          action="/messages"
          className="mt-6 rounded border border-zinc-800 bg-black/35 p-4"
        >
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto_auto]">
            <div className="flex h-11 items-center gap-2 rounded border border-zinc-800 bg-zinc-950 px-3">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                name="q"
                defaultValue={q}
                placeholder="件名、候補者名、本文"
                className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              />
            </div>
            <select
              name="status"
              defaultValue={status}
              className="h-11 rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none"
            >
              <option value="">すべて</option>
              <option value={MessageThreadStatus.OPEN}>OPEN</option>
              <option value={MessageThreadStatus.CLOSED}>CLOSED</option>
            </select>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
            >
              検索
            </button>
            <Link
              href="/messages"
              className="inline-flex h-11 items-center justify-center rounded border border-zinc-800 px-4 text-sm font-semibold text-zinc-300 transition hover:border-amber-300/30 hover:text-amber-100"
            >
              リセット
            </Link>
          </div>
        </form>

        <section className="mt-6 grid gap-4">
          {threads.map((thread) => {
            const unreadCount = getUnreadCount(thread.messages, user.id);
            const latestMessage = thread.messages[0];

            return (
              <article
                key={thread.id}
                className="rounded border border-zinc-800 bg-zinc-950/85 p-5 transition hover:border-amber-300/30"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                        {thread.status}
                      </span>
                      {unreadCount > 0 ? (
                        <span className="rounded border border-red-300/25 bg-red-400/10 px-2.5 py-1 text-xs font-semibold text-red-100">
                          未読 {unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                      {thread.subject}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {thread.scoutRequest.candidate.name} /{" "}
                      {thread.scoutRequest.candidate.region}
                    </p>
                  </div>
                  <Link
                    href={`/messages/${thread.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
                  >
                    開く
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-5 rounded border border-zinc-800 bg-black/35 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                    <span>
                      最新:{" "}
                      {latestMessage
                        ? latestMessage.createdAt.toLocaleString("ja-JP")
                        : "-"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {latestMessage
                      ? getMessagePreview(latestMessage.body)
                      : "まだメッセージはありません。"}
                  </p>
                </div>
              </article>
            );
          })}

          {threads.length === 0 ? (
            <section className="rounded border border-zinc-800 bg-black/35 p-8 text-center">
              <Inbox className="mx-auto h-8 w-8 text-amber-300" />
              <h2 className="mt-4 text-xl font-semibold text-white">
                メッセージスレッドはまだありません
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                対話申請管理または候補者詳細からスレッドを開始できます。
              </p>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
