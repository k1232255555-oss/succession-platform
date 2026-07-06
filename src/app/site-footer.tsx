import Link from "next/link";

const legalLinks = [
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/commercial-transaction", label: "特定商取引法に基づく表記" },
  { href: "/contact", label: "お問い合わせ" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-black px-4 py-6 text-xs text-zinc-500 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Succession Club. 未来へ、事業をつなぐ。</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-amber-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
