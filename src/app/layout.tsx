import type { Metadata } from "next";
import { getSafeAppUrl } from "@/lib/env";
import "./globals.css";

const appUrl = getSafeAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Succession Club | 未来へ、事業をつなぐ。",
    template: "%s | Succession Club",
  },
  description:
    "後継者不足に悩む事業者と、事業を引き継いで挑戦したい人をつなぐ仕組みを検証する、招待制クローズドβ。",
  applicationName: "Succession Club",
  authors: [{ name: "Succession Club" }],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Succession Club | 未来へ、事業をつなぐ。",
    description:
      "後継者不足に悩む事業者と、事業を引き継いで挑戦したい人をつなぐ仕組みを検証する、招待制クローズドβ。",
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
