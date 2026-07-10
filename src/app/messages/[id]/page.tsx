import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCheck,
  LockKeyhole,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import { MessageThreadStatus } from "@prisma/client";
import {
  closeMessageThreadAction,
  markMessageThreadReadAction,
  sendMessageAction,
} from "@/app/messages/actions";
import { requireUser } from "@/lib/auth";
import { getUnreadCount, messageBodyMaxLength } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function MessageThreadPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const notice = getParam(query, "notice");
  const error = getParam(query, "error");

  const thread = await prisma.messageThread.findFirst({
    where: {
      id,
      companyId: user.companyId,
    },
    include: {
      scoutRequest: {
        include: {
          candidate: true,
        },
      },
      createdBy: true,
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          senderUser: true,
          readReceipts: true,
        },
      },
    },
  });

  if (!thread) {
    notFound();
  }

  const unreadCount = getUnreadCount(thread.messages, user.id);
  const sendAction = sendMessageAction.bind(null, thread.id);
  const readAction = markMessageThreadReadAction.bind(null, thread.id);
  const closeAction = closeMessageThreadAction.bind(null, thread.id);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/messages"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
            >
              <ArrowLeft className="h-4 w-4" />
              メッセージ一覧へ戻る
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-amber-200/80">
              <MessageCircle className="h-4 w-4" />
              <span>{thread.status}</span>
              {unreadCount > 0 ? <span>未読 {unreadCount}</span> : null}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {thread.subject}
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {thread.scoutRequest.candidate.name} /{" "}
              {thread.scoutRequest.candidate.region} / 対話申請ID{" "}
              {thread.scoutRequest.id}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <form action={readAction}>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
              >
                <CheckCheck className="h-4 w-4" />
                既読にする
              </button>
            </form>
            {thread.status === MessageThreadStatus.OPEN ? (
              <form action={closeAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded border border-zinc-800 px-4 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/30 hover:text-amber-100"
                >
                  <LockKeyhole className="h-4 w-4" />
                  クローズ
                </button>
              </form>
            ) : null}
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

        <section className="mt-6 space-y-4">
          {thread.messages.map((message) => {
            const isMine = message.senderUserId === user.id;
            const isReadByMe = message.readReceipts.some(
              (receipt) => receipt.userId === user.id,
            );

            return (
              <article
                key={message.id}
                className={`rounded border p-4 ${
                  isMine
                    ? "border-amber-300/20 bg-amber-300/[0.06]"
                    : "border-zinc-800 bg-zinc-950/85"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {message.senderName}
                    </span>
                    <span className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-400">
                      {message.senderType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{message.createdAt.toLocaleString("ja-JP")}</span>
                    {isMine || isReadByMe ? (
                      <span className="inline-flex items-center gap-1 text-amber-200/80">
                        <CheckCheck className="h-3.5 w-3.5" />
                        既読
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-200">
                  {message.body}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-6 rounded border border-zinc-800 bg-black/35 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <ShieldCheck className="h-4 w-4" />
            <span>返信</span>
          </div>

          {thread.status === MessageThreadStatus.OPEN ? (
            <form action={sendAction} className="mt-4 grid gap-3">
              <textarea
                name="body"
                rows={6}
                required
                maxLength={messageBodyMaxLength}
                placeholder="候補者側・運営側へ共有したい内容を入力してください。"
                className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-300/50"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-zinc-500">
                  HTMLは使用できません。入力内容はテキストとして安全に表示されます。
                </p>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
                >
                  <Send className="h-4 w-4" />
                  送信
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-4 text-sm text-zinc-400">
              このスレッドはクローズ済みです。新しい返信はできません。
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
