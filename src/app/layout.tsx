import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import './globals.css';
import GoogleAdSense, { HideAdsForEntry } from '@/components/GoogleAdSense';
import HeaderNav from '@/components/HeaderNav';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://study.ntorelabo.com'),
  title: 'ウェブエンジニア問題集 | HTML/CSS/React/Node.js 無料学習サイト',
  description:
    'ウェブ開発に必要なHTML、CSS、JavaScript、React、Node.jsを4択クイズで学べる無料学習プラットフォーム。初学者から実務経験者まで、問題を解きながらスキルアップできます。',
  keywords: [
    'React',
    'HTML',
    'CSS',
    'JavaScript',
    'Node.js',
    'ウェブ開発',
    '学習',
    '問題集',
    'クイズ',
    '無料',
  ],
  openGraph: {
    title: 'ウェブエンジニア問題集 | HTML/CSS/React/Node.js 無料学習サイト',
    description:
      'ウェブ開発に必要なHTML、CSS、JavaScript、React、Node.jsを4択クイズで学べる無料学習プラットフォーム。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ウェブエンジニア問題集 | HTML/CSS/React/Node.js 無料学習サイト',
    description:
      'ウェブ開発に必要なHTML、CSS、JavaScript、React、Node.jsを4択クイズで学べる無料学習プラットフォーム。',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <html lang="ja">
      <head>
        {clientId && !isDevelopment && (
          <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        )}
      </head>
      <body>
        {clientId && !isDevelopment && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <HideAdsForEntry />
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-gray-900 hover:text-primary transition-colors shrink-0"
            >
              <Image src="/favicon.ico" alt="" width={32} height={32} className="shrink-0" />
              <span className="text-base md:text-lg">ウェブエンジニア問題集</span>
            </Link>
            <Suspense>
              <HeaderNav />
            </Suspense>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-50 border-t border-gray-200 px-4 py-6 mt-10 md:px-6 md:py-8 md:mt-16">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-[280px] mx-auto mb-4 md:max-w-[468px] md:mb-6 min-h-[80px] md:min-h-[100px] overflow-hidden">
              <GoogleAdSense adSlot={adSlot} />
            </div>
            <div className="flex justify-center mb-4">
              <a
                href="https://x.com/web_eng_quiz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ウェブエンジニア問題集の公式Xアカウントをフォロー"
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-xs md:text-sm font-semibold hover:opacity-85 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4 fill-current"
                >
                  <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.844l-5.356-7.01L4.2 22H.944l8.02-9.164L.5 2h7.02l4.84 6.398L18.244 2zm-1.2 18h1.88L7.02 4H5.02l12.024 16z" />
                </svg>
                Xでフォロー
              </a>
            </div>
            <div className="text-center text-gray-600 text-xs md:text-sm">
              <p>&copy; 2026 ウェブエンジニア問題集. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
