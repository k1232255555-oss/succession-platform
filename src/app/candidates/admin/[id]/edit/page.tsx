import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FilePenLine } from "lucide-react";
import { updateCandidateAction } from "@/app/candidates/admin/actions";
import { CandidateForm } from "@/app/candidates/admin/candidate-form";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getError(params: Record<string, string | string[] | undefined>) {
  const value = params.error;
  return Array.isArray(value) ? value[0] : value;
}

export default async function EditCandidatePage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireUser();
  requireRole(user, ["OWNER"]);
  const { id } = await params;
  const query = (await searchParams) ?? {};

  const candidate = await prisma.successorCandidate.findFirst({
    where: {
      id,
      companyId: user.companyId,
    },
  });

  if (!candidate) {
    notFound();
  }

  const action = updateCandidateAction.bind(null, candidate.id);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.13),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_48%,#030303_100%)]" />

      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-10">
        <header className="border-b border-zinc-800 pb-6">
          <Link
            href="/candidates/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
          >
            <ArrowLeft className="h-4 w-4" />
            管理画面へ戻る
          </Link>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <FilePenLine className="h-4 w-4" />
            <span>Edit Candidate</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {candidate.name} を編集
          </h1>
        </header>

        <section className="mt-6 rounded border border-zinc-800 bg-zinc-950/85 p-5">
          <CandidateForm
            action={action}
            candidate={candidate}
            error={getError(query)}
            submitLabel="更新する"
          />
        </section>
      </div>
    </main>
  );
}
