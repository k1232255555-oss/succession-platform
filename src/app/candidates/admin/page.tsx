import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Crown,
  FilePenLine,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import { deleteCandidateAction } from "@/app/candidates/admin/actions";
import { requireRole, requireUser } from "@/lib/auth";
import { reviewStatusLabels } from "@/lib/candidates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CandidateAdminPage() {
  const user = await requireUser();
  requireRole(user, ["OWNER"]);

  const candidates = await prisma.successorCandidate.findMany({
    where: {
      companyId: user.companyId,
    },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/candidates"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
            >
              <ArrowLeft className="h-4 w-4" />
              候補者一覧へ戻る
            </Link>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-200/80">
              <Crown className="h-4 w-4" />
              <span>OWNER Console</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              候補者管理
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              候補者プロフィールの登録・編集・削除を行えます。操作は監査ログに記録されます。
            </p>
          </div>

          <Link
            href="/candidates/admin/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded bg-amber-300 px-4 text-sm font-bold text-black transition hover:bg-amber-200"
          >
            <Plus className="h-4 w-4" />
            新規登録
          </Link>
        </header>

        <section className="grid gap-3 py-6 sm:grid-cols-3">
          <div className="rounded border border-amber-300/15 bg-black/35 p-5">
            <p className="text-sm text-zinc-400">登録候補者</p>
            <p className="mt-3 text-4xl font-semibold text-amber-300">
              {candidates.length}
            </p>
          </div>
          <div className="rounded border border-amber-300/15 bg-black/35 p-5">
            <p className="text-sm text-zinc-400">承認済み</p>
            <p className="mt-3 text-4xl font-semibold text-amber-300">
              {
                candidates.filter(
                  (candidate) => candidate.reviewStatus === "APPROVED",
                ).length
              }
            </p>
          </div>
          <div className="rounded border border-amber-300/15 bg-black/35 p-5">
            <p className="text-sm text-zinc-400">注目候補</p>
            <p className="mt-3 text-4xl font-semibold text-amber-300">
              {candidates.filter((candidate) => candidate.isFeatured).length}
            </p>
          </div>
        </section>

        <section className="rounded border border-zinc-800 bg-zinc-950/85 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <UsersRound className="h-4 w-4" />
            <span>Candidate Records</span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-zinc-500">
                <tr className="border-b border-zinc-800">
                  <th className="py-3 pr-4 font-medium">名前</th>
                  <th className="py-3 pr-4 font-medium">地域</th>
                  <th className="py-3 pr-4 font-medium">希望業種</th>
                  <th className="py-3 pr-4 font-medium">状態</th>
                  <th className="py-3 pr-4 font-medium">更新日</th>
                  <th className="py-3 pr-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => {
                  const deleteAction = deleteCandidateAction.bind(
                    null,
                    candidate.id,
                  );

                  return (
                    <tr key={candidate.id} className="border-b border-zinc-900">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/candidates/${candidate.id}`}
                            className="font-semibold text-white transition hover:text-amber-200"
                          >
                            {candidate.name}
                          </Link>
                          {candidate.isFeatured ? (
                            <BadgeCheck className="h-4 w-4 text-amber-300" />
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {candidate.age}歳
                        </p>
                      </td>
                      <td className="py-4 pr-4 text-zinc-300">
                        {candidate.region}
                      </td>
                      <td className="py-4 pr-4 text-zinc-400">
                        {candidate.desiredIndustries.join(" / ")}
                      </td>
                      <td className="py-4 pr-4 text-amber-200">
                        {reviewStatusLabels[candidate.reviewStatus]}
                      </td>
                      <td className="py-4 pr-4 text-zinc-500">
                        {candidate.updatedAt.toLocaleDateString("ja-JP")}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/candidates/admin/${candidate.id}/edit`}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded border border-zinc-800 px-3 text-xs font-semibold text-zinc-200 transition hover:border-amber-300/30 hover:text-amber-100"
                          >
                            <FilePenLine className="h-3.5 w-3.5" />
                            編集
                          </Link>
                          <form action={deleteAction}>
                            <button
                              type="submit"
                              className="inline-flex h-9 items-center justify-center gap-1 rounded border border-red-400/25 px-3 text-xs font-semibold text-red-200 transition hover:bg-red-400/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              削除
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
