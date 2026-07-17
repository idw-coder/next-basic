import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import './globals.css';

import GoogleAdSense, { HideAdsForEntry } from '@/components/GoogleAdSense';
import HeaderNav from '@/components/HeaderNav';
import HeaderSearch from '@/components/HeaderSearch';
import { getAllBooks } from '@/lib/books';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  const headerBooks = getAllBooks().map((book) => ({
    bookSlug: book.bookSlug,
    title: book.title,
    description: book.description,
    coverImage: book.coverImage,
  }));

  return (
    <html lang="ja">
      <head>
        {clientId && !isDevelopment && (
          <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        )}
      </head>
      <body className="app-font">
        {clientId && !isDevelopment && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <HideAdsForEntry />
        <header className="sticky top-0 z-50 border-b border-cream-line bg-cream-deep/88 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-ink/10" />
          <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
            <Link
              href="/"
              className="group flex shrink-0 flex-col items-start gap-1 text-ink transition-colors hover:text-brand-blue"
            >
              <span className="text-[17px] font-black leading-none tracking-normal md:text-xl">
                ウェブエンジニア問題集
              </span>
            </Link>
            <Suspense>
              <HeaderNav books={headerBooks} />
            </Suspense>
          </div>
        </header>
        <div className="sticky top-14 z-40 border-b border-cream-line bg-cream-deep/95 backdrop-blur-xl md:top-16">
          <div className="mx-auto max-w-7xl px-4 py-2 md:px-6">
            <HeaderSearch books={headerBooks} />
          </div>
        </div>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-cream-deep border-t border-cream-line px-4 py-6 mt-10 md:px-6 md:py-8 md:mt-16">
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
            <div className="text-center text-ink-muted text-xs md:text-sm">
              <p>&copy; 2026 ウェブエンジニア問題集. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
