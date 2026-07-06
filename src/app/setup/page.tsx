import { notFound, redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "@/app/setup/setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (process.env.ALLOW_BOOTSTRAP_ADMIN !== "true") {
    notFound();
  }

  const [user, existingUsers] = await Promise.all([
    getCurrentUser(),
    prisma.companyUser.count(),
  ]);

  if (user) {
    redirect("/");
  }

  if (existingUsers > 0) {
    notFound();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-zinc-100">
      <section className="w-full max-w-2xl rounded border border-amber-300/20 bg-black/55 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
          <ShieldCheck className="h-4 w-4" />
          <span>Initial Setup</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          初期OWNERアカウント作成
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          本番環境では作成後すぐに ALLOW_BOOTSTRAP_ADMIN を false または未設定に戻してください。
        </p>
        <SetupForm />
      </section>
    </main>
  );
}
