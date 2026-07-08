import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { createBusinessOpportunityAction } from "@/app/businesses/actions";
import { BusinessOpportunityForm } from "@/app/businesses/business-opportunity-form";
import { canManageBusinessOpportunities, requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewBusinessOpportunityPage({
  searchParams,
}: PageProps) {
  const user = await requireUser();

  if (!canManageBusinessOpportunities(user)) {
    redirect("/businesses");
  }

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/businesses"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          残したい事業へ戻る
        </Link>

        <header className="mt-6 border-b border-zinc-800 pb-6">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <BriefcaseBusiness className="h-4 w-4" />
            承継プロジェクト
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            残したい事業を登録
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            引き継いでほしい事業の概要を、会社名を出さずに整理します。まずは非公開の下書きとして保存されます。
          </p>
        </header>

        {params?.error ? (
          <div className="mt-6 rounded border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {params.error}
          </div>
        ) : null}

        <section className="mt-6">
          <BusinessOpportunityForm action={createBusinessOpportunityAction} />
        </section>
      </div>
    </main>
  );
}
