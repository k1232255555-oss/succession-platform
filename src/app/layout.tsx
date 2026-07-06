import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://legacy-gate.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Legacy Gate | Dashboard",
    template: "%s | Legacy Gate",
  },
  description: "次世代型・事業承継マッチングプラットフォーム",
  applicationName: "Legacy Gate",
  authors: [{ name: "Legacy Gate" }],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Legacy Gate | Dashboard",
    description: "黒字廃業の危機にある企業と、審査済みの若者を繋ぐクローズドプラットフォーム",
    url: appUrl,
    siteName: "Legacy Gate",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
