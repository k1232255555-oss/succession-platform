import type { Metadata } from "next";
import { SiteFooter } from "@/app/site-footer";
import { getSafeAppUrl } from "@/lib/env";
import "./globals.css";

const appUrl = getSafeAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Succession Club | 未来へ、事業をつなぐ。",
    template: "%s | Succession Club",
  },
  description: "日本の事業承継を支える中立的なプラットフォーム",
  applicationName: "Succession Club",
  authors: [{ name: "Succession Club" }],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Succession Club | 未来へ、事業をつなぐ。",
    description: "M&A、親族承継、従業員承継に加わる、事業承継のもう一つの選択肢。",
    url: appUrl,
    siteName: "Succession Club",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full bg-zinc-950 flex flex-col">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
