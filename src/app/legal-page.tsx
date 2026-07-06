import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export type LegalSection = {
  title: string;
  body: string[];
};

export function LegalPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Legacy Gateへ戻る
        </Link>

        <header className="mt-8 border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 rounded border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm font-medium text-amber-200">
            <ShieldCheck className="h-4 w-4" />
            Legal
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>
          <p className="mt-4 text-xs text-zinc-500">最終更新日: 2026年7月6日</p>
        </header>

        <div className="grid gap-6 py-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded border border-zinc-800 bg-black/35 p-5"
            >
              <h2 className="text-xl font-semibold text-amber-200">
                {section.title}
              </h2>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-zinc-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
