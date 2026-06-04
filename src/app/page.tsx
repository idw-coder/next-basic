import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  BadgeCheck,
  Clock,
  RotateCcw,
  Flame,
  Target,
  TrendingUp,
  UserCircle,
  ArrowRight,
  ChevronRight,
  Shuffle,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/SectionHeading';
import { NewsList } from '@/components/news-list';
import { getAllBooks, getChaptersByBook, NEW_BOOK_SLUGS } from '@/lib/books';
import BookCard from '@/app/books/_components/BookCard';

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

const CATEGORY_COLORS: Record<string, { border: string; hoverBg: string }> = {
  'html-basic': {
    border: 'border-orange-400',
    hoverBg: 'group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10',
  },
  'css-basic': {
    border: 'border-blue-400',
    hoverBg: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10',
  },
  'javascript-basic': {
    border: 'border-yellow-400',
    hoverBg: 'group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10',
  },
  'react-basic': {
    border: 'border-cyan-400',
    hoverBg: 'group-hover:bg-cyan-50 dark:group-hover:bg-cyan-500/10',
  },
  'vue-basic': {
    border: 'border-emerald-400',
    hoverBg: 'group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10',
  },
  'nodejs-basic': {
    border: 'border-green-500',
    hoverBg: 'group-hover:bg-green-50 dark:group-hover:bg-green-500/10',
  },
  nextjs: {
    border: 'border-gray-500',
    hoverBg: 'group-hover:bg-gray-100 dark:group-hover:bg-gray-500/10',
  },
  'git-basic': {
    border: 'border-rose-500',
    hoverBg: 'group-hover:bg-rose-50 dark:group-hover:bg-rose-500/10',
  },
  'aws-basic': {
    border: 'border-orange-500',
    hoverBg: 'group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10',
  },
  'nginx-basic': {
    border: 'border-teal-500',
    hoverBg: 'group-hover:bg-teal-50 dark:group-hover:bg-teal-500/10',
  },
  'ts-general': {
    border: 'border-indigo-400',
    hoverBg: 'group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10',
  },
  'security-general': {
    border: 'border-red-500',
    hoverBg: 'group-hover:bg-red-50 dark:group-hover:bg-red-500/10',
  },
  'sql-basic': {
    border: 'border-fuchsia-500',
    hoverBg: 'group-hover:bg-fuchsia-50 dark:group-hover:bg-fuchsia-500/10',
  },
  'cs-basic': {
    border: 'border-purple-400',
    hoverBg: 'group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10',
  },
  docker: {
    border: 'border-sky-400',
    hoverBg: 'group-hover:bg-sky-50 dark:group-hover:bg-sky-500/10',
  },
  linux: {
    border: 'border-lime-500',
    hoverBg: 'group-hover:bg-lime-50 dark:group-hover:bg-lime-500/10',
  },
};

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
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* ヒーロー */}
      <section className="mb-12 md:mb-16 relative">
        <svg
          className="absolute left-1/2 top-0 -translate-x-1/2 w-screen h-full pointer-events-none select-none"
          aria-hidden="true"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M -10 285 C 120 278 280 180 410 15 L 410 55 C 280 220 120 295 -10 300 Z"
            fill="#e5e7eb"
            opacity="0.45"
          />
        </svg>
        <div
          className="absolute top-2 right-6 sm:right-14 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-primary/10 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 right-1 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-8 right-1/4 w-6 h-6 rounded-full bg-amber-200/30 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1 left-1/4 w-4 h-4 rounded-full bg-gray-300/50 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/3 left-4 sm:left-8 w-7 h-7 rounded-full bg-primary/8 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative flex flex-col-reverse justify-center sm:flex-row sm:items-center gap-4 sm:gap-8">
          <div className="flex justify-center sm:justify-start">
            <Image
              src="/inpiration_man_color.png"
              alt="ひらめきを得て学習している人のイラスト"
              width={588}
              height={761}
              priority
              className="w-full max-w-[120px] sm:max-w-[160px] md:max-w-[200px] h-auto -scale-x-100"
            />
          </div>
          <div className="text-center sm:text-left sm:flex-1 sm:max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3 sm:mb-4 md:text-5xl leading-tight">
              ウェブ知識を
              <span className="inline-block">
                <span className="text-red-500">スキマ時間</span>で学習
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground md:text-lg mb-3 sm:mb-4">
              1問30秒から。4択クイズでサクッと力試し
            </p>
            <div className="relative flex flex-wrap justify-center sm:justify-start gap-1.5 mb-4 sm:mb-6">
              <Sparkles
                className="absolute -top-2.5 -left-1 sm:-left-3 size-3.5 sm:size-4 text-amber-400 pointer-events-none"
                aria-hidden="true"
              />
              <Sparkles
                className="absolute -top-1 right-4 sm:right-auto sm:left-[70%] size-3 sm:size-3.5 text-red-400/25 pointer-events-none -rotate-12"
                aria-hidden="true"
              />
              <Sparkles
                className="absolute top-1/2 -right-1 sm:right-auto sm:left-[90%] size-3.5 sm:size-4 text-amber-300/60 pointer-events-none rotate-6"
                aria-hidden="true"
              />
              <Sparkles
                className="absolute -bottom-2 left-[30%] sm:left-[45%] size-3 sm:size-3.5 text-red-400/30 pointer-events-none rotate-12"
                aria-hidden="true"
              />
              {[
                { name: 'HTML', cls: 'text-orange-600 bg-orange-50 border-orange-200' },
                { name: 'CSS', cls: 'text-blue-600 bg-blue-50 border-blue-200' },
                { name: 'JavaScript', cls: 'text-amber-600 bg-amber-50 border-amber-200' },
                { name: 'React', cls: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
                { name: 'Vue', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                { name: 'Node.js', cls: 'text-green-600 bg-green-50 border-green-200' },
                { name: 'TypeScript', cls: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                { name: 'AWS', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
                { name: 'Git', cls: 'text-rose-600 bg-rose-50 border-rose-200' },
                { name: 'Next.js', cls: 'text-slate-700 bg-slate-50 border-slate-200' },
                { name: 'Docker', cls: 'text-sky-600 bg-sky-50 border-sky-200' },
                { name: 'Linux', cls: 'text-lime-600 bg-lime-50 border-lime-200' },
                { name: 'SQL', cls: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200' },
              ].map((tag) => (
                <span
                  key={tag.name}
                  className={`text-[10px] sm:text-xs font-semibold rounded-full px-2 py-0.5 sm:px-2.5 sm:py-0.5 border ${tag.cls}`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="#categories" className="inline-flex items-center gap-2 font-bold">
                  学習を始める
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                会員登録なしですぐ始められます
              </span>
            </div>
            <div className="mt-4 sm:mt-6 flex justify-center sm:justify-start">
              <div className="inline-flex items-center gap-3 sm:gap-5 rounded-md border border-gray-200 bg-white/80 px-4 sm:px-5 py-2 sm:py-2.5 shadow-sm">
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-black text-red-500 leading-none">16</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">カテゴリ</p>
                </div>
                <div className="h-6 sm:h-7 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-black text-foreground leading-none">
                    {totalCount > 0 ? totalCount : 500}
                    <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">
                      +
                    </span>
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">問題数</p>
                </div>
                <div className="h-6 sm:h-7 w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-bold text-green-600 leading-none">無料</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
                    で利用可能
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴 */}
      <section className="mb-12 md:mb-16 bg-muted/40 rounded-md px-5 py-8 md:px-8">
        <SectionHeading className="mb-6" icon={<Sparkles className="size-5 text-red-400" />}>
          このサイトの特徴
        </SectionHeading>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
          {[
            {
              icon: BadgeCheck,
              color: 'text-primary',
              title: '無料で利用可能',
              desc: '会員登録なしでも\nすぐに問題を解ける',
            },
            {
              icon: Clock,
              color: 'text-primary',
              title: 'スキマ時間で学べる',
              desc: '1問ずつ短時間で\n解答できる設計',
            },
            {
              icon: RotateCcw,
              color: 'text-primary',
              title: '復習しやすい',
              desc: '間違えた問題を\n繰り返し解き直せる',
            },
            {
              icon: TrendingUp,
              color: 'text-primary',
              title: '成長を実感',
              desc: '正答率や学習日数を\nプロフィールで確認',
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <f.icon className={`size-6 ${f.color}`} />
              </div>
              <p className="font-semibold text-foreground text-sm mb-1">{f.title}</p>
              <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 学習カテゴリ */}
      <section id="categories" className="mb-12 md:mb-16 relative py-8 md:py-10 overflow-hidden">
        <SectionHeading className="mb-6 md:mb-8" subtitle="16カテゴリの問題に挑戦しよう">
          クイズカテゴリ
        </SectionHeading>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const count = counts[cat.slug] ?? 0;
            const colors = CATEGORY_COLORS[cat.slug];
            return (
              <Link
                key={cat.slug}
                href={`/quiz/${cat.slug}`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 sm:p-4 transition hover:shadow-md hover:border-primary/30"
              >
                <div
                  className={`
                    size-3 shrink-0
                    rounded-full border-2 ${colors?.border ?? 'border-gray-300'}
                    ${cat.bgColor}
                  `}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {cat.name}
                  </p>
                  {count > 0 && (
                    <p className="text-[11px] text-muted-foreground">{count}問</p>
                  )}
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-primary shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* 教科書 */}
      <section id="books" className="mb-12 md:mb-16">
        <SectionHeading className="mb-6 md:mb-8" subtitle="基礎から体系的に学べる技術書コンテンツ">
          教科書
        </SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 max-w-4xl mx-auto">
          {bookList.slice(0, 6).map((book) => (
            <BookCard
              key={book.bookSlug}
              bookSlug={book.bookSlug}
              title={book.title}
              description={book.description}
              chapterCount={getChaptersByBook(book.bookSlug).length}
              isNew={NEW_BOOK_SLUGS.has(book.bookSlug)}
            />
          ))}
        </div>
        <div className="text-center mt-6">
          <Button variant="outline" className="rounded-full px-6" size="sm" asChild>
            <Link href="/books" className="inline-flex items-center gap-1 text-xs font-semibold">
              すべての教科書を見る（全{bookList.length}冊）
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 会員登録CTA */}
      <section className="mb-12 md:mb-16 bg-blue-50/50 dark:bg-blue-950/20 rounded-md px-5 py-8 md:px-8">
        <SectionHeading
          className="mb-6"
          subtitle="登録しなくてもすべての問題を解けます。登録すると以下の機能が使えます。"
        >
          無料会員登録で学習をもっと便利に
        </SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 max-w-3xl mx-auto mb-6">
          {[
            {
              icon: Target,
              color: 'text-green-500',
              bg: 'bg-green-500/10',
              title: '正答率を記録',
              desc: '成長を数字で実感',
            },
            {
              icon: Flame,
              color: 'text-orange-500',
              bg: 'bg-orange-500/10',
              title: '連続学習ストリーク',
              desc: '毎日の習慣を可視化',
            },
            {
              icon: TrendingUp,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
              title: 'カテゴリ別の進捗',
              desc: '得意・苦手が一目瞭然',
            },
            {
              icon: UserCircle,
              color: 'text-violet-500',
              bg: 'bg-violet-500/10',
              title: 'デバイス間で同期',
              desc: 'PC・スマホどちらでも',
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-md border p-4">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-md ${f.bg}`}
              >
                <f.icon className={`size-5 ${f.color}`} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button className="rounded-full px-8" size="lg" asChild>
            <Link href="/register" className="inline-flex items-center gap-2 font-bold">
              無料で会員登録する
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ランダムクイズ & キーワード検索 CTA */}
      <section className="mb-12 md:mb-16 grid gap-4 sm:grid-cols-2">
        <Link href="/quiz/random" className="block group">
          <div className="rounded-md border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-5 sm:p-6 hover:border-blue-400 dark:hover:border-blue-600 transition-colors h-full">
            <div className="flex items-start gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors">
                <Shuffle className="size-6 sm:size-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-foreground mb-1">
                  ランダムクイズに挑戦！
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  全カテゴリからランダムに出題。5問・10問など問題数を選んでサクッと力試し！
                </p>
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                  挑戦する
                  <ArrowRight className="size-3.5 sm:size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/search" className="block group">
          <div className="rounded-md border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 p-5 sm:p-6 hover:border-violet-400 dark:hover:border-violet-600 transition-colors h-full">
            <div className="flex items-start gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/60 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/60 transition-colors">
                <Search className="size-6 sm:size-7 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-foreground mb-1">
                  キーワードで探す
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  クイズも教科書も横断検索。「Promise」「型ガード」「API設計」などから探せます
                </p>
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400">
                  検索する
                  <ArrowRight className="size-3.5 sm:size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* 学習のすすめ方 */}
      <section className="mb-12 md:mb-16 bg-muted/40 rounded-md px-5 py-8 md:px-8">
        <SectionHeading className="mb-6">学習のすすめ方</SectionHeading>
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-4">
          {[
            {
              step: 1,
              color: 'bg-red-400',
              title: 'まずはクイズに挑戦',
              desc: 'スキマ時間に1問ずつ。会員登録なしですぐ始められます。',
            },
            {
              step: 2,
              color: 'bg-blue-400',
              title: '間違えた問題を復習',
              desc: '解答履歴から間違えた問題をピックアップして解き直しましょう。',
            },
            {
              step: 3,
              color: 'bg-indigo-400',
              title: '教科書で体系的に学ぶ',
              desc: 'クイズで気になったテーマは教科書で基礎から順番に理解を深められます。',
            },
            {
              step: 4,
              color: 'bg-amber-400',
              title: 'プロフィールで確認',
              desc: '会員登録すると正答率・連続学習日数・カテゴリ別進捗を確認できます。',
            },
            {
              step: 5,
              color: 'bg-green-400',
              title: 'コードを書いて実践',
              desc: '問題で学んだ知識を、実際にコードを書いて理解を深めましょう。',
            },
          ].map((s, i) => (
            <div key={s.step} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-0 sm:text-center">
              <div className="flex sm:flex-col items-center gap-3 sm:gap-0 shrink-0">
                <div
                  className={`flex size-8 sm:size-9 items-center justify-center rounded-full ${s.color} text-white font-bold text-xs sm:text-sm shadow-sm`}
                >
                  {s.step}
                </div>
                {i < 4 && (
                  <div className="hidden sm:block w-px h-4 bg-gray-300 mx-auto" />
                )}
              </div>
              <div className="sm:mt-1">
                <p className="font-semibold text-foreground text-xs sm:text-sm mb-0.5">{s.title}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* お知らせ */}
      <section id="news" className="mb-8">
        <SectionHeading className="mb-6">お知らせ</SectionHeading>
        <div className="max-w-2xl mx-auto">
          <NewsList items={NEWS} />
          <div className="border-t border-border py-3 space-y-1">
            <span className="text-xs text-muted-foreground">今後の予定</span>
            <p className="text-sm text-foreground">間違っているコード2択クイズなどを順次追加予定</p>
          </div>
        </div>
      </section>
    </div>
  );
}
