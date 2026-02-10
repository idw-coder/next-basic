import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import GoogleAdSense from "@/app/_components/GoogleAdSense";

export const metadata: Metadata = {
  title: "ウェブエンジニア問題集 | HTML/CSS/React/Node.js 無料学習サイト",
  description: "ウェブ開発に必要なHTML、CSS、JavaScript、React、Node.jsを4択クイズで学べる無料学習プラットフォーム。初学者から実務経験者まで、問題を解きながらスキルアップできます。",
  keywords: ["React", "HTML", "CSS", "JavaScript", "Node.js", "ウェブ開発", "学習", "問題集", "クイズ", "無料"],
  openGraph: {
    title: "ウェブエンジニア問題集 | HTML/CSS/React/Node.js 無料学習サイト",
    description: "ウェブ開発に必要なHTML、CSS、JavaScript、React、Node.jsを4択クイズで学べる無料学習プラットフォーム。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "ウェブエンジニア問題集 | HTML/CSS/React/Node.js 無料学習サイト",
    description: "ウェブ開発に必要なHTML、CSS、JavaScript、React、Node.jsを4択クイズで学べる無料学習プラットフォーム。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <html lang="ja">
      <head>
        {clientId && !isDevelopment && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition">
              ウェブエンジニア問題集
            </Link>
            <nav className="flex gap-6">
              <Link href="/#categories" className="text-gray-700 hover:text-blue-600 transition">
                カテゴリ
              </Link>
              <Link href="/#news" className="text-gray-700 hover:text-blue-600 transition">
                お知らせ
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-50 border-t border-gray-200 p-8 mt-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center min-h-[100px] mb-6">
              <GoogleAdSense adSlot={adSlot} />
            </div>
            <div className="text-center text-gray-600 text-sm">
              <p>&copy; 2026 ウェブエンジニア問題集. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}