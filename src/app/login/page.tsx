import { redirect } from "next/navigation";
import { BriefcaseBusiness, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/app/login/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-zinc-100">
      <section className="w-full max-w-md rounded border border-amber-300/20 bg-black/55 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded border border-amber-300/30 bg-amber-300/10 text-amber-300">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-200/80">
              Succession Club
            </p>
            <h1 className="text-lg font-semibold tracking-wide text-white">
              Legacy Gate
            </h1>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <ShieldCheck className="h-4 w-4" />
            <span>完全審査制ログイン</span>
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            企業アカウントでログイン
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            事業承継候補者の情報は承認済みメンバーにのみ公開されます。
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
