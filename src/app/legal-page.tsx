import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/app/site-footer";

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
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Succession Clubへ戻る
          </Link>

          <header className="mt-8 border-b border-slate-200 pb-8">
            <div className="inline-flex items-center gap-2 rounded border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800">
              <ShieldCheck className="h-4 w-4" />
              方針と規約
            </div>
            <h1 className="mt-5 text-3xl font-semibold text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {description}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              最終更新日: 2026年7月10日
            </p>
          </header>

          <div className="grid gap-6 py-8">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-slate-950">
                  {section.title}
                </h2>
                <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
