import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  Handshake,
  MessageCircle,
  MessageSquareText,
  SlidersHorizontal,
} from "lucide-react";
import { ScoutStatus } from "@prisma/client";
import { createMessageThreadAction } from "@/app/messages/actions";
import { updateScoutRequestAction } from "@/app/scouts/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoutStatusLabels, scoutStatusOptions } from "@/lib/scouts";

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

function toDateTimeLocal(value: Date | null) {
  if (!value) {
    return "";
  }

  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default async function ScoutsPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const notice = getParam(params, "notice");
  const error = getParam(params, "error");
  const status = getParam(params, "status") ?? "";

  const scoutStatus = Object.values(ScoutStatus).includes(status as ScoutStatus)
    ? (status as ScoutStatus)
    : undefined;

  const scoutRequests = await prisma.scoutRequest.findMany({
    where: {
      companyId: user.companyId,
      ...(scoutStatus ? { status: scoutStatus } : {}),
    },
    include: {
      candidate: true,
      createdBy: true,
      messageThread: true,
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
              <Handshake className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              対話申請の進行管理
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              引き継ぎ希望者との初回対話、面談調整、承諾・辞退までの状態を丁寧に管理します。
            </p>
          </div>

          <Link
            href="/candidates"
            className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
          >
            引き継ぎ希望者を探す
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
          action="/scouts"
          className="mt-6 rounded border border-zinc-800 bg-black/35 p-4"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              name="status"
              defaultValue={status}
              className="h-11 rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none"
            >
              <option value="">すべての状態</option>
              {scoutStatusOptions.map((item) => (
                <option key={item} value={item}>
                  {scoutStatusLabels[item]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded border border-amber-300/30 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
            >
              絞り込む
            </button>
            <Link
              href="/scouts"
              className="inline-flex h-11 items-center justify-center rounded border border-zinc-800 px-4 text-sm font-semibold text-zinc-300 transition hover:border-amber-300/30 hover:text-amber-100"
            >
              リセット
            </Link>
          </div>
        </form>

        <section className="mt-6 grid gap-4">
          {scoutRequests.map((scout) => {
            const updateAction = updateScoutRequestAction.bind(null, scout.id);
            const createThreadAction = createMessageThreadAction.bind(
              null,
              scout.id,
            );

            return (
              <article
                key={scout.id}
                className="rounded border border-zinc-800 bg-zinc-950/85 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                        {scoutStatusLabels[scout.status]}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {scout.updatedAt.toLocaleString("ja-JP")}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-white">
                      {scout.candidate.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {scout.candidate.region} / {scout.candidate.age}歳 / by{" "}
                      {scout.createdBy?.email ?? "System"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {scout.messageThread ? (
                      <Link
                        href={`/messages/${scout.messageThread.id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded bg-amber-300 px-3 text-sm font-bold text-black transition hover:bg-amber-200"
                      >
                        <MessageCircle className="h-4 w-4" />
                        メッセージ
                      </Link>
                    ) : (
                      <form action={createThreadAction}>
                        <button
                          type="submit"
                          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-amber-300 px-3 text-sm font-bold text-black transition hover:bg-amber-200"
                        >
                          <MessageCircle className="h-4 w-4" />
                          開始
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/candidates/${scout.candidateId}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded border border-zinc-800 px-3 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/30 hover:text-amber-100"
                    >
                      詳細
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
                  <div className="rounded border border-zinc-800 bg-black/35 p-4">
                    <div className="flex items-center gap-2 text-sm text-amber-200/80">
                      <MessageSquareText className="h-4 w-4" />
                      <span>送信文</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                      {scout.message}
                    </p>
                  </div>

                  <form action={updateAction} className="grid gap-3">
                    <label>
                      <span className="text-xs font-medium text-zinc-500">
                        状態
                      </span>
                      <select
                        name="status"
                        defaultValue={scout.status}
                        className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                      >
                        {scoutStatusOptions.map((item) => (
                          <option key={item} value={item}>
                            {scoutStatusLabels[item]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="text-xs font-medium text-zinc-500">
                        面談日時
                      </span>
                      <input
                        name="proposedMeetingAt"
                        type="datetime-local"
                        defaultValue={toDateTimeLocal(scout.proposedMeetingAt)}
                        className="mt-2 h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-amber-300/50"
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
                    >
                      <CalendarClock className="h-4 w-4" />
                      更新する
                    </button>
                  </form>
                </div>
              </article>
            );
          })}

          {scoutRequests.length === 0 ? (
            <section className="rounded border border-zinc-800 bg-black/35 p-8 text-center">
              <Handshake className="mx-auto h-8 w-8 text-amber-300" />
              <h2 className="mt-4 text-xl font-semibold text-white">
            対話申請はまだありません
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                プロフィール詳細ページから対話申請を開始できます。
              </p>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
