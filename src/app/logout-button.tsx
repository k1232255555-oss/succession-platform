import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/logout/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 rounded border border-zinc-800 bg-zinc-900/80 px-4 text-sm font-semibold text-zinc-200 transition hover:border-amber-300/40 hover:text-amber-200"
      >
        <LogOut className="h-4 w-4" />
        ログアウト
      </button>
    </form>
  );
}
