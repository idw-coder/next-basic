import BookCard from '@/app/books/_components/BookCard';
import { SectionHeading } from '@/components/SectionHeading';
import { NewsList } from '@/components/news-list';
import { Button } from '@/components/ui/button';
import { getAllBooks, getChaptersByBook, NEW_BOOK_SLUGS } from '@/lib/books';
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Clock,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  UserCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const API_BASE_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

async function getQuizCountsBySlugs(slugs: string[]): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  try {
    const categoriesRes = await fetch(`${API_BASE_URL}/api/quiz/categories`, {
      cache: 'no-store',
    });
    if (!categoriesRes.ok) return Object.fromEntries(slugs.map((s) => [s, 0]));
    const categories: { id: number; slug: string }[] = await categoriesRes.json();

    const counts = await Promise.all(
      slugs.map(async (slug) => {
        const cat = categories.find((c) => c.slug === slug);
        if (!cat) return { slug, count: 0 };
        const res = await fetch(`${API_BASE_URL}/api/quiz/category/${cat.id}/quizzes`, {
          cache: 'no-store',
        });
        if (!res.ok) return { slug, count: 0 };
        const quizzes: unknown[] = await res.json();
        return { slug, count: quizzes.length };
      }),
    );
    counts.forEach(({ slug, count }) => (out[slug] = count));
  } catch (error) {
    console.error('Failed to fetch quiz counts:', error);
    slugs.forEach((s) => (out[s] = 0));
  }
  return out;
}

const CATEGORY_SLUGS = [
  'html-basic',
  'css-basic',
  'javascript-basic',
  'react-basic',
  'vue-basic',
  'nodejs-basic',
  'nextjs',
  'aws-basic',
  'git-basic',
  'nginx-basic',
  'ts-general',
  'security-general',
  'sql-basic',
  'cs-basic',
  'docker',
  'linux',
] as const;

interface CategoryDef {
  slug: string;
  name: string;
  color: string;
  hoverColor: string;
  bgColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  topics: string[];
}

const CATEGORIES: CategoryDef[] = [
  {
    slug: 'html-basic',
    name: 'HTML',
    color: 'text-orange-600 dark:text-orange-400',
    hoverColor: 'bg-orange-500 hover:bg-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-500/10',
    badgeBg: 'bg-orange-100 dark:bg-orange-500/20',
    badgeText: 'text-orange-700 dark:text-orange-300',
    description: 'ウェブページの構造を作るための言語。タグや属性の使い方を学びます。',
    topics: ['基本構文', 'タグ・属性・要素'],
  },
  {
    slug: 'css-basic',
    name: 'CSS',
    color: 'text-blue-600 dark:text-blue-400',
    hoverColor: 'bg-blue-500 hover:bg-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    badgeBg: 'bg-blue-100 dark:bg-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
    description: 'デザインを制御するCSSの基礎から、Flexbox・Grid・レスポンシブまで。',
    topics: ['セレクタ・プロパティ', 'Flexbox / Grid', 'レスポンシブ'],
  },
  {
    slug: 'javascript-basic',
    name: 'JavaScript',
    color: 'text-amber-600 dark:text-amber-400',
    hoverColor: 'bg-amber-500 hover:bg-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    badgeBg: 'bg-amber-100 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    description: '基本文法から非同期処理、DOM操作、ES6+の新機能まで幅広くカバー。',
    topics: ['変数・関数', 'Promise / async', 'DOM操作'],
  },
  {
    slug: 'react-basic',
    name: 'React',
    color: 'text-cyan-600 dark:text-cyan-400',
    hoverColor: 'bg-cyan-500 hover:bg-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    description: 'コンポーネント設計、Hooks、状態管理など実践的な問題で理解を深められます。',
    topics: ['コンポーネント・Props', 'Hooks', '状態管理'],
  },
  {
    slug: 'vue-basic',
    name: 'Vue.js',
    color: 'text-emerald-600 dark:text-emerald-400',
    hoverColor: 'bg-emerald-500 hover:bg-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    description: 'Vue 2/3の基本概念からComposition API、ディレクティブまで。',
    topics: ['ディレクティブ', 'Composition API', 'Pinia / Router'],
  },
  {
    slug: 'nodejs-basic',
    name: 'Node.js',
    color: 'text-green-600 dark:text-green-400',
    hoverColor: 'bg-green-500 hover:bg-green-600',
    bgColor: 'bg-green-50 dark:bg-green-500/10',
    badgeBg: 'bg-green-100 dark:bg-green-500/20',
    badgeText: 'text-green-700 dark:text-green-300',
    description: 'Express.jsでのAPI開発やモジュールシステムなど、バックエンドの基礎。',
    topics: ['基本・モジュール', 'Express.js', '非同期処理'],
  },
  {
    slug: 'nextjs',
    name: 'Next.js',
    color: 'text-slate-700 dark:text-slate-300',
    hoverColor: 'bg-slate-700 hover:bg-slate-800',
    bgColor: 'bg-slate-50 dark:bg-slate-500/10',
    badgeBg: 'bg-slate-100 dark:bg-slate-500/20',
    badgeText: 'text-slate-700 dark:text-slate-300',
    description:
      'App Router・Server Components・エラー解決など、Next.jsの実践的なトピックをカバー。',
    topics: ['App Router', 'Server Components', 'エラー解決'],
  },
  {
    slug: 'git-basic',
    name: 'Git',
    color: 'text-rose-600 dark:text-rose-400',
    hoverColor: 'bg-rose-600 hover:bg-rose-700',
    bgColor: 'bg-rose-50 dark:bg-rose-600/10',
    badgeBg: 'bg-rose-100 dark:bg-rose-600/20',
    badgeText: 'text-rose-700 dark:text-rose-300',
    description: '基本コマンドから現場で頻発するエラーの解決方法まで網羅。',
    topics: ['基本コマンド', 'ブランチ・マージ', 'エラー解決'],
  },
  {
    slug: 'aws-basic',
    name: 'AWS',
    color: 'text-amber-700 dark:text-amber-400',
    hoverColor: 'bg-amber-600 hover:bg-amber-700',
    bgColor: 'bg-amber-50 dark:bg-amber-600/10',
    badgeBg: 'bg-amber-100 dark:bg-amber-600/20',
    badgeText: 'text-amber-800 dark:text-amber-300',
    description: 'EC2、S3、Lambda、RDSなど代表的なサービスを問題形式で学べます。',
    topics: ['EC2 / S3 / VPC', 'Lambda / API GW', 'RDS / CloudFront'],
  },
  {
    slug: 'nginx-basic',
    name: 'Nginx',
    color: 'text-teal-600 dark:text-teal-400',
    hoverColor: 'bg-teal-500 hover:bg-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-500/10',
    badgeBg: 'bg-teal-100 dark:bg-teal-500/20',
    badgeText: 'text-teal-700 dark:text-teal-300',
    description: 'リバースプロキシや静的ファイル配信、HTTPS対応など実務に直結する知識。',
    topics: ['location / server', 'リバースプロキシ', 'SSL / キャッシュ'],
  },
  {
    slug: 'ts-general',
    name: 'TypeScript',
    color: 'text-indigo-600 dark:text-indigo-400',
    hoverColor: 'bg-indigo-500 hover:bg-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-500/20',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    description:
      '基本文法・型システム・Utility Typesからよくあるコンパイルエラーまで幅広くカバー。',
    topics: ['型システム・ジェネリクス', 'Utility Types', 'コンパイルエラー'],
  },
  {
    slug: 'security-general',
    name: 'セキュリティ',
    color: 'text-red-600 dark:text-red-400',
    hoverColor: 'bg-red-500 hover:bg-red-600',
    bgColor: 'bg-red-50 dark:bg-red-500/10',
    badgeBg: 'bg-red-100 dark:bg-red-500/20',
    badgeText: 'text-red-700 dark:text-red-300',
    description: 'XSS・CSRF・SQLインジェクションなどWebセキュリティの基礎知識を問題形式で学習。',
    topics: ['XSS / CSRF', '暗号化・認証', 'ネットワーク'],
  },
  {
    slug: 'sql-basic',
    name: 'SQL',
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    hoverColor: 'bg-fuchsia-500 hover:bg-fuchsia-600',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-500/10',
    badgeBg: 'bg-fuchsia-100 dark:bg-fuchsia-500/20',
    badgeText: 'text-fuchsia-700 dark:text-fuchsia-300',
    description: 'SELECT・JOIN・集計・トランザクションなど、データベース操作の基礎を学べます。',
    topics: ['SELECT / WHERE', 'JOIN・集計', '設計・トランザクション'],
  },
  {
    slug: 'cs-basic',
    name: 'CS基礎',
    color: 'text-purple-600 dark:text-purple-400',
    hoverColor: 'bg-purple-500 hover:bg-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10',
    badgeBg: 'bg-purple-100 dark:bg-purple-500/20',
    badgeText: 'text-purple-700 dark:text-purple-300',
    description: 'データ構造・アルゴリズム・計算量など、コンピュータサイエンスの基礎を網羅。',
    topics: ['データ構造', 'アルゴリズム', '計算量・エラー'],
  },
  {
    slug: 'docker',
    name: 'Docker',
    color: 'text-sky-600 dark:text-sky-400',
    hoverColor: 'bg-sky-500 hover:bg-sky-600',
    bgColor: 'bg-sky-50 dark:bg-sky-500/10',
    badgeBg: 'bg-sky-100 dark:bg-sky-500/20',
    badgeText: 'text-sky-700 dark:text-sky-300',
    description:
      'コンテナ仮想化のDocker。Dockerfile・docker compose・ボリューム管理などを問題形式で習得。',
    topics: ['イメージ・コンテナ', 'Dockerfile', 'docker compose'],
  },
  {
    slug: 'linux',
    name: 'Linux',
    color: 'text-lime-600 dark:text-lime-400',
    hoverColor: 'bg-lime-500 hover:bg-lime-600',
    bgColor: 'bg-lime-50 dark:bg-lime-500/10',
    badgeBg: 'bg-lime-100 dark:bg-lime-500/20',
    badgeText: 'text-lime-700 dark:text-lime-300',
    description:
      'コマンド操作・パーミッション・プロセス管理・ネットワークなど、実務で頻出するLinux基礎知識。',
    topics: ['コマンド操作', 'パーミッション', 'プロセス管理'],
  },
];

const NEWS: { date: string; text: string; isNew: boolean; link?: string }[] = [
  {
    date: '2026/05/26',
    text: '教科書「システム設計をちゃんと理解する」を公開しました',
    isNew: true,
    link: '/books/system-design',
  },
  {
    date: '2026/05/25',
    text: '教科書「JavaScriptをちゃんと理解する」を公開しました',
    isNew: false,
    link: '/books/javascript',
  },
  { date: '2026/04/29', text: 'SQLクイズを公開しました', isNew: false, link: '/quiz/sql-basic' },
  {
    date: '2026/04/21',
    text: '教科書「コンピュータサイエンスの基礎」を公開しました',
    isNew: false,
    link: '/books/cs-basics',
  },
  {
    date: '2026/04/18',
    text: '教科書「Gitをちゃんと使う」「Next.jsを動かして学ぶ」を公開しました',
    isNew: false,
    link: '/books',
  },
  { date: '2026/04/05', text: 'Linuxクイズを公開しました', isNew: false },
  {
    date: '2026/04/04',
    text: 'サブスクリプション機能を準備中です。正式リリースまでもうしばらくお待ちください。',
    isNew: false,
    link: '/payment',
  },
  { date: '2026/04/01', text: 'Next.js・Dockerクイズを公開しました', isNew: false },
  {
    date: '2026/03/01',
    text: 'TypeScript・セキュリティ・CS基礎クイズを公開しました',
    isNew: false,
  },
  {
    date: '2026/02/28',
    text: 'Google認証を導入しました、サイトの利用をより便利に安心して行えます',
    isNew: false,
  },
  { date: '2026/02/25', text: 'ランダムクイズ機能を公開しました', isNew: false },
  { date: '2026/02/21', text: '学習記録・プロフィール機能を公開しました', isNew: false },
  { date: '2026/02/18', text: '解答履歴機能を公開しました', isNew: false },
  { date: '2026/02/15', text: 'AWS、Git、Nginxクイズを公開しました', isNew: false },
  { date: '2026/02/14', text: 'Vue、Node.jsクイズを公開しました', isNew: false },
  { date: '2026/02/08', text: 'HTML、CSS、JavaScript、Reactクイズを公開しました', isNew: false },
  { date: '2026/02/08', text: 'ウェブエンジニア問題集を開設しました', isNew: false },
];

export default async function Home() {
  const counts = await getQuizCountsBySlugs([...CATEGORY_SLUGS]);
  const totalCount = Object.values(counts).reduce((sum, c) => sum + c, 0);
  const bookList = getAllBooks();
  return (
    <div className="bg-[#fbf2e9] text-[#2f302f]">
      {/* ヒーロー */}
      <section className="relative overflow-hidden px-4 pt-8 pb-8 md:pt-16 md:pb-20">
        <Image
          src="/images/creative_color.png"
          alt=""
          width={738}
          height={452}
          priority
          className="pointer-events-none absolute left-1/2 top-4 hidden w-[52rem] max-w-none -translate-x-1/2 rotate-[15deg] opacity-[0.06] blur-[2px] saturate-75 lg:block"
        />
        <div className="relative mx-auto grid max-w-6xl gap-5 md:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative z-10 text-center lg:text-left">
            <p className="mb-3 inline-flex rounded-full border border-[#df796b]/30 bg-white/70 px-3 py-1 text-[11px] font-bold text-[#df796b] sm:text-xs">
              1問30秒から始める基礎練習
            </p>
            <h1 className="text-3xl font-black leading-tight tracking-normal text-[#242424] sm:text-5xl md:text-6xl">
              <span className="block text-[#df796b]">良い理解を</span>
              <span className="block">積み上げる</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#56514c] sm:mt-5 sm:text-base sm:leading-8 lg:mx-0">
              HTML、CSS、JavaScript、React、Next.js まで。クイズで手早く確認し、教科書で体系的に戻れる学習サイトです。
            </p>
            <div className="mt-5 flex flex-row items-center justify-center gap-3 lg:justify-start">
              <Button size="lg" className="h-11 rounded-full bg-[#2f86c9] px-5 text-sm font-bold hover:bg-[#2476b4] sm:h-12 sm:px-8 sm:text-base" asChild>
                <Link href="#categories" className="inline-flex items-center gap-2">
                  クイズを選ぶ
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-11 rounded-full border-[#56514c]/25 bg-white/75 px-5 text-sm font-bold text-[#2f302f] hover:bg-white sm:h-12 sm:px-8 sm:text-base" asChild>
                <Link href="/books">教科書を読む</Link>
              </Button>
            </div>
            <div className="mt-5 flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-3 rounded-[24px] border-2 border-[#2f302f]/70 bg-white px-4 py-2.5 shadow-[8px_8px_0_rgba(47,48,47,0.08)] sm:gap-5 sm:px-5 sm:py-3">
                <div className="text-center">
                  <p className="text-lg font-black leading-none text-[#df796b] sm:text-2xl">16</p>
                  <p className="mt-1 text-[10px] text-[#6d6760]">カテゴリ</p>
                </div>
                <div className="h-7 w-px bg-[#2f302f]/15 sm:h-8" />
                <div className="text-center">
                  <p className="text-lg font-black leading-none text-[#2f302f] sm:text-2xl">
                    {totalCount > 0 ? totalCount : 500}
                    <span className="text-xs font-normal text-[#6d6760]">+</span>
                  </p>
                  <p className="mt-1 text-[10px] text-[#6d6760]">問題数</p>
                </div>
                <div className="h-7 w-px bg-[#2f302f]/15 sm:h-8" />
                <div className="text-center">
                  <p className="text-sm font-black leading-none text-[#2f86c9]">無料</p>
                  <p className="mt-1 text-[10px] text-[#6d6760]">すぐ開始</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative mx-auto mt-2 h-28 w-full max-w-xs sm:hidden">
            <div className="absolute inset-x-4 bottom-0 h-24 rounded-[1.5rem] border-2 border-[#2f302f]/70 bg-[#bde9ec]" />
            <Image
              src="/images/pc-work-woman01.png"
              alt="パソコンで学習する人のイラスト"
              width={260}
              height={260}
              priority
              className="absolute bottom-0 left-1/2 h-32 w-auto -translate-x-1/2 object-contain"
            />
          </div>
          <div className="relative mx-auto hidden h-40 w-full max-w-sm sm:block sm:h-64 sm:max-w-xl md:h-80">
            <div className="absolute right-0 top-0 h-[74%] w-[68%] rounded-[2.25rem] border-2 border-[#2f302f]/70 bg-[#a7d66f] sm:rounded-[2.75rem]">
              <Image
                src="/images/running_man_color-1.png"
                alt="気分転換しながら学習を続ける人のイラスト"
                width={500}
                height={533}
                priority
                className="absolute -bottom-5 left-1/2 h-[110%] w-auto -translate-x-1/2 object-contain sm:-bottom-9 sm:h-[118%]"
              />
            </div>
            <div className="absolute bottom-5 left-0 h-[50%] w-[48%] rounded-[1.5rem] border-2 border-[#2f302f]/70 bg-[#bde9ec] sm:bottom-8 sm:rounded-[2rem]">
              <Image
                src="/images/pc-work-woman01.png"
                alt="パソコンで学習する人のイラスト"
                width={260}
                height={260}
                priority
                className="absolute -bottom-3 left-1/2 h-[118%] w-auto -translate-x-1/2 object-contain sm:-bottom-5"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 md:pt-8 md:pb-14">
        {/* 特徴 */}
        <section className="mb-12 rounded-[2rem] bg-[#fbf2e9]/55 px-5 py-8 md:mb-16 md:px-10">
          <SectionHeading className="mb-7" icon={<Sparkles className="size-5 text-[#df796b]" />}>
            このサイトの特徴
          </SectionHeading>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-4">
          {[
            {
              icon: BadgeCheck,
              color: 'text-[#2f86c9]',
              title: '無料で利用可能',
              desc: '会員登録なしでもすぐに問題を解ける',
            },
            {
              icon: Clock,
              color: 'text-[#df796b]',
              title: 'スキマ時間で学べる',
              desc: '1問ずつ短時間で解答できる設計',
            },
            {
              icon: RotateCcw,
              color: 'text-[#2f86c9]',
              title: '復習しやすい',
              desc: '間違えた問題を繰り返し解き直せる',
            },
            {
              icon: TrendingUp,
              color: 'text-[#df796b]',
              title: '成長を実感',
              desc: '正答率や学習日数をプロフィールで確認',
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-2xl bg-white p-4">
              <f.icon className={`mt-0.5 size-5 ${f.color} shrink-0`} />
              <div>
                <p className="mb-0.5 text-sm font-bold text-[#2f302f]">{f.title}</p>
                <p className="text-xs leading-relaxed text-[#6d6760]">{f.desc}</p>
              </div>
            </div>
          ))}
          </div>
        </section>

      {/* 学習カテゴリ */}
        <section id="categories" className="relative mb-12 overflow-hidden rounded-[2rem] bg-white px-3 py-6 md:mb-16 md:px-10 md:py-12">
          <div className="mb-4 flex justify-center">
            <div className="relative inline-block rounded-full bg-[#2f86c9] px-5 py-1.5 text-xs font-bold text-white sm:text-sm">
              どのカテゴリから始める？
              <div className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-[#2f86c9]" />
            </div>
          </div>
          <SectionHeading
            className="mb-6 md:mb-8"
            subtitle={`16カテゴリ・全${totalCount > 0 ? totalCount : 500}問以上から挑戦しよう`}
          >
            クイズカテゴリ
          </SectionHeading>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const count = counts[cat.slug] ?? 0;
            return (
              <Link
                key={cat.slug}
                href={`/quiz/${cat.slug}`}
                className={`group relative flex min-h-32 flex-col overflow-hidden rounded-[1.35rem] border-2 border-[#2f302f]/60 ${cat.bgColor} p-3 transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(47,48,47,0.08)] sm:p-5`}
              >
                <div
                  className={`absolute -bottom-8 sm:-bottom-10 -right-8 sm:-right-10 size-24 sm:size-36 rounded-full ${cat.hoverColor.split(' ')[0]} opacity-[0.10] pointer-events-none`}
                  aria-hidden="true"
                />
                <div
                  className={`absolute -bottom-3 sm:-bottom-4 -right-3 sm:-right-4 size-16 sm:size-24 rounded-full ${cat.hoverColor.split(' ')[0]} opacity-[0.07] pointer-events-none`}
                  aria-hidden="true"
                />
                <div
                  className={`absolute -bottom-1 -right-1 size-10 sm:size-14 rounded-full ${cat.hoverColor.split(' ')[0]} opacity-[0.05] pointer-events-none`}
                  aria-hidden="true"
                />
                <div className="relative mb-1 flex items-baseline justify-between sm:mb-1.5">
                  <p className={`text-xs sm:text-sm font-bold ${cat.color}`}>{cat.name}</p>
                  {count > 0 && (
                    <span className={`text-[10px] sm:text-[11px] tabular-nums ${cat.badgeText}`}>
                      {count}問
                    </span>
                  )}
                </div>
                <p className="relative mb-2 line-clamp-2 text-[10px] leading-relaxed text-[#6d6760] sm:mb-2.5 sm:text-xs">
                  {cat.description}
                </p>
                <div className="relative mt-auto flex flex-wrap gap-0.5 sm:gap-1">
                  {cat.topics.map((t) => (
                    <span
                      key={t}
                      className={`rounded-full border border-current/15 bg-white/75 px-1 py-0.5 text-[9px] font-medium sm:px-1.5 sm:text-[10px] ${cat.badgeText}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
          </div>
        </section>

      {/* 教科書 */}
        <section id="books" className="mb-12 rounded-[2rem] bg-white px-3 py-6 md:mb-16 md:px-10 md:py-12">
          <div className="mb-8 grid gap-4 md:grid-cols-[0.8fr_1fr] md:items-end">
            <SectionHeading center={false} subtitle="基礎から体系的に学べる技術書コンテンツ">
              教科書
            </SectionHeading>
            <p className="text-sm leading-7 text-[#6d6760]">
              クイズだけで曖昧だったところは、短い章ごとの教科書に戻って確認できます。迷ったときの次の一手がすぐ見つかる構成です。
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {bookList.slice(0, 6).map((book) => {
            const chapters = getChaptersByBook(book.bookSlug);
            return (
              <BookCard
                key={book.bookSlug}
                bookSlug={book.bookSlug}
                title={book.title}
                description={book.description}
                coverImage={book.coverImage}
                chapterCount={chapters.length}
                chapters={chapters.map((c) => ({
                  title: c.title,
                  order: c.order,
                  chapterSlug: c.chapterSlug,
                }))}
                isNew={NEW_BOOK_SLUGS.has(book.bookSlug)}
              />
            );
          })}
          </div>
          <div className="mt-6 text-center">
          <Button variant="outline" className="rounded-full border-[#2f302f]/25 bg-white px-6" size="sm" asChild>
            <Link href="/books" className="inline-flex items-center gap-1 text-xs font-semibold">
              すべての教科書を見る（全{bookList.length}冊）
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
          </div>
        </section>

      {/* 会員登録CTA */}
        <section className="mb-12 rounded-[2rem] border-2 border-[#2f302f]/60 bg-white px-5 py-8 md:mb-16 md:px-10">
          <div className="mb-3 flex justify-center">
            <span className="inline-block rounded-full bg-[#e8f6eb] px-3 py-1 text-xs font-bold tracking-wide text-green-700">
            FREE
            </span>
          </div>
          <SectionHeading className="mb-2">無料会員登録で学習をもっと便利に</SectionHeading>
          <p className="mb-6 text-center text-sm text-[#6d6760]">
            登録しなくてもすべての問題を解けます。登録すると以下の機能が使えます。
          </p>
          <div className="mx-auto mb-6 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-4">
          {[
            {
              icon: Target,
              color: 'text-green-600',
              title: '正答率を記録',
              desc: '成長を数字で実感',
            },
            {
              icon: Flame,
              color: 'text-orange-500',
              title: '連続学習ストリーク',
              desc: '毎日の習慣を可視化',
            },
            {
              icon: TrendingUp,
              color: 'text-blue-500',
              title: 'カテゴリ別の進捗',
              desc: '得意・苦手が一目瞭然',
            },
            {
              icon: UserCircle,
              color: 'text-violet-500',
              title: 'デバイス間で同期',
              desc: 'PC・スマホどちらでも',
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-2.5">
              <f.icon className={`mt-0.5 size-4 ${f.color} shrink-0`} />
              <div>
                <p className="text-sm font-bold text-[#2f302f]">{f.title}</p>
                <p className="text-xs text-[#6d6760]">{f.desc}</p>
              </div>
            </div>
          ))}
          </div>
          <div className="text-center">
          <Button className="rounded-full bg-[#df796b] px-8 hover:bg-[#cf685a]" size="lg" asChild>
            <Link href="/register" className="inline-flex items-center gap-2 font-bold">
              無料で会員登録する
              <ChevronRight className="size-4" />
            </Link>
          </Button>
          </div>
        </section>

      {/* ランダムクイズ & キーワード検索 CTA */}
        <section className="mb-12 grid gap-4 md:mb-16 sm:grid-cols-2">
        <Link href="/quiz/random" className="group block">
          <div className="flex h-full flex-col rounded-[2rem] border-2 border-[#2f302f]/60 bg-[#e9f6f8] p-6 text-center transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_rgba(47,48,47,0.08)] sm:p-8">
            <h2 className="mb-1.5 text-base font-extrabold text-[#2f302f] sm:text-lg">
              ランダムクイズに挑戦
            </h2>
            <p className="mb-4 text-xs text-[#6d6760] sm:text-sm">
              全カテゴリからランダムに出題
              <br />
              5問・10問など問題数を選んでサクッと力試し
            </p>
            <span className="mx-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[#2f86c9] px-6 py-2 text-sm font-bold text-white transition-colors group-hover:bg-[#2476b4]">
              挑戦する
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="mt-auto flex h-28 items-end justify-center pt-4 sm:h-36">
              <Image
                src="/images/plan_selection_man_color.png"
                alt=""
                width={400}
                height={280}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
        </Link>

        <Link href="/search" className="group block">
          <div className="flex h-full flex-col rounded-[2rem] border-2 border-[#2f302f]/60 bg-[#fff3dc] p-6 text-center transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_rgba(47,48,47,0.08)] sm:p-8">
            <h2 className="mb-1.5 text-base font-extrabold text-[#2f302f] sm:text-lg">
              キーワードで探す
            </h2>
            <p className="mb-4 text-xs text-[#6d6760] sm:text-sm">
              クイズも教科書も横断検索
              <br />
              「Promise」「型ガード」「API設計」などから探せます
            </p>
            <span className="mx-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[#df796b] px-6 py-2 text-sm font-bold text-white transition-colors group-hover:bg-[#cf685a]">
              検索する
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="mt-auto flex h-28 items-end justify-center pt-4 sm:h-36">
              <Image
                src="/images/search_woman_color.png"
                alt=""
                width={400}
                height={400}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
        </Link>
        </section>

      {/* 学習のすすめ方 */}
        <section className="mb-12 rounded-[2rem] bg-white/65 px-5 py-8 md:mb-16 md:px-10">
          <div className="mb-3 flex justify-center">
            <div className="relative inline-block rounded-full bg-[#df796b] px-4 py-1.5 text-xs font-bold text-white sm:text-sm">
            5ステップで効率的に！
              <div className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-[#df796b]" />
            </div>
          </div>
          <SectionHeading className="mb-6">学習のすすめ方</SectionHeading>
        {(() => {
          const steps = [
            {
              step: 1,
              title: 'まずはクイズに挑戦',
              desc: 'スキマ時間に1問ずつ。会員登録なしですぐ始められます。',
            },
            {
              step: 2,
              title: '間違えた問題を復習',
              desc: '解答履歴から間違えた問題をピックアップして解き直しましょう。',
            },
            {
              step: 3,
              title: '教科書で体系的に学ぶ',
              desc: 'クイズで気になったテーマは教科書で基礎から順番に理解を深められます。',
            },
            {
              step: 4,
              title: 'プロフィールで確認',
              desc: '会員登録すると正答率・連続学習日数・カテゴリ別進捗を確認できます。',
            },
            {
              step: 5,
              title: 'コードを書いて実践',
              desc: '問題で学んだ知識を、実際にコードを書いて理解を深めましょう。',
            },
          ];
          return (
            <>
              {/* Desktop: timeline */}
              <div className="hidden sm:block relative">
                <div className="absolute left-[10%] right-[10%] top-5 h-0.5 bg-[#2f302f]/20" />
                <div className="grid grid-cols-5 gap-4">
                  {steps.map((s) => (
                    <div key={s.step} className="flex flex-col items-center text-center">
                      <div className="relative z-10 mb-3 flex size-10 items-center justify-center rounded-full bg-[#2f86c9] text-sm font-bold text-white ring-4 ring-white/80">
                        {String(s.step).padStart(2, '0')}
                      </div>
                      <p className="mb-0.5 text-sm font-bold text-[#2f302f]">{s.title}</p>
                      <p className="text-xs leading-relaxed text-[#6d6760]">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Mobile: vertical list */}
              <div className="sm:hidden space-y-3">
                {steps.map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2f86c9] text-xs font-bold text-white">
                      {String(s.step).padStart(2, '0')}
                    </div>
                    <div>
                      <p className="mb-0.5 text-sm font-bold text-[#2f302f]">{s.title}</p>
                      <p className="text-xs leading-relaxed text-[#6d6760]">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
        </section>

      {/* お知らせ */}
        <section id="news" className="mb-8">
          <SectionHeading className="mb-6">お知らせ</SectionHeading>
          <div className="mx-auto max-w-2xl rounded-[2rem] bg-white px-5 py-4">
          <NewsList items={NEWS} />
          <div className="space-y-1 border-t border-[#2f302f]/10 py-3">
            <span className="text-xs text-[#6d6760]">今後の予定</span>
            <p className="text-sm text-[#2f302f]">間違っているコード2択クイズなどを順次追加予定</p>
          </div>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
