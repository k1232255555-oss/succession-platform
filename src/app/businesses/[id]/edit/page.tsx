import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { updateBusinessOpportunityAction } from "@/app/businesses/actions";
import { BusinessOpportunityForm } from "@/app/businesses/business-opportunity-form";
import { canManageBusinessOpportunities, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditBusinessOpportunityPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireUser();

  if (!canManageBusinessOpportunities(user)) {
    redirect("/businesses");
  }

  const { id } = await params;
  const query = await searchParams;
  const opportunity = await prisma.businessOpportunity.findFirst({
    where: {
      id,
      companyId: user.companyId,
    },
  });

  if (!opportunity) {
    notFound();
  }

  const updateAction = updateBusinessOpportunityAction.bind(null, opportunity.id);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href={`/businesses/${opportunity.id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          詳細へ戻る
        </Link>

        <header className="mt-6 border-b border-zinc-800 pb-6">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <BriefcaseBusiness className="h-4 w-4" />
            承継プロジェクト
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            残したい事業を編集
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            会社を特定できる情報を含めず、未来へつなぎたい内容だけを整理してください。
          </p>
        </header>

        {query?.error ? (
          <div className="mt-6 rounded border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {query.error}
          </div>
        ) : null}

        <section className="mt-6">
          <BusinessOpportunityForm
            action={updateAction}
            opportunity={opportunity}
          />
        </section>
      </div>
    </main>
  );
}
