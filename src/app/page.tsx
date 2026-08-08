import BookCard from '@/app/books/_components/BookCard';
import ReviewPromptCard from '@/components/ReviewPromptCard';
import { SectionHeading } from '@/components/SectionHeading';
import { NewsList } from '@/components/news-list';
import { Button } from '@/components/ui/button';
import { getAllBooks, getChaptersByBook, NEW_BOOK_SLUGS } from '@/lib/books';
import {
  ArrowRight,
  Atom,
  BadgeCheck,
  Braces,
  ChevronRight,
  Clock,
  Cloud,
  Code2,
  Container,
  Cpu,
  Database,
  FileCode2,
  FileType,
  Flame,
  GitBranch,
  Globe,
  Paintbrush,
  RotateCcw,
  Server,
  Shield,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  UserCircle,
  type LucideIcon,
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

const categoryIconMap: Record<string, LucideIcon> = {
  'html-basic': FileCode2,
  'css-basic': Paintbrush,
  'javascript-basic': Braces,
  'react-basic': Atom,
  'vue-basic': Code2,
  'nodejs-basic': Globe,
  nextjs: Globe,
  'git-basic': GitBranch,
  'aws-basic': Cloud,
  'nginx-basic': Server,
  'ts-general': FileType,
  'security-general': Shield,
  'sql-basic': Database,
  'cs-basic': Cpu,
  docker: Container,
  linux: Terminal,
};

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
    date: '2026/07/18',
    text: '教科書「AZ-900 合格とクラウドの基礎がわかるAzure入門」を公開しました。クラウドの概念からEntra ID・RBACまで順次章を追加中です',
    isNew: true,
    link: '/books/azure-az-900',
  },
  {
    date: '2026/07/16',
    text: '復習機能を強化しました。苦手な問題をまとめて解き直せる復習ページとヘッダーからの復習リンクを追加しています',
    isNew: true,
    link: '/quiz/review',
  },
  {
    date: '2026/06/29',
    text: 'クイズのブックマーク機能を追加しました。気になる問題を保存して復習できます',
    isNew: false,
    link: '/quiz/bookmarks',
  },
  {
    date: '2026/06/26',
    text: '教科書コンテンツを全面リニューアルしました。図解や解説をより分かりやすく改善しています',
    isNew: false,
    link: '/books',
  },
  {
    date: '2026/05/26',
    text: '教科書「システム設計をちゃんと理解する」を公開しました',
    isNew: false,
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
    <div className="bg-cream text-ink">
      {/* ヒーロー */}
      <section className="relative min-h-[calc(100svh-8.5rem)] overflow-hidden bg-cream px-4 py-4 md:min-h-[calc(100svh-9rem)] md:px-6 md:py-6">
        <Image
          src="/images/top-hero-editorial.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-[78%_center] md:object-[62%_28%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.98)_0%,rgba(255,250,244,0.9)_46%,rgba(255,250,244,0.52)_72%,rgba(255,250,244,0.12)_100%)] md:bg-[linear-gradient(90deg,rgba(255,250,244,0.98)_0%,rgba(255,250,244,0.92)_28%,rgba(255,250,244,0.46)_54%,rgba(255,250,244,0.1)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cream to-transparent" />
        <div className="pointer-events-none absolute -left-7 top-[18%] hidden rotate-[-8deg] text-[7rem] font-black leading-none text-brand-blue/10 md:block">
          QUIZ
        </div>
        <div className="pointer-events-none absolute bottom-20 right-4 hidden rotate-90 text-4xl font-black tracking-[0.28em] text-white/70 [text-shadow:0_1px_20px_rgba(47,48,47,0.25)] lg:block">
          BOOK / CODE
        </div>

        <div className="relative mx-auto flex min-h-[calc(100svh-11rem)] max-w-6xl items-center md:min-h-[calc(100svh-13rem)]">
          <div className="w-full max-w-[34rem] pt-2">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-red/25 bg-white/80 px-3 py-1 text-[10px] font-extrabold tracking-[0.14em] text-brand-red-deep shadow-[0_10px_30px_rgba(47,48,47,0.08)] sm:text-xs">
              <span className="size-2 rounded-full bg-brand-lime" />
              1問30秒から、理解を更新する
            </p>
            <h1 className="max-w-[11em] font-display text-[2.15rem] font-black leading-[1.04] tracking-normal text-ink sm:text-[2.8rem] md:text-[3.6rem]">
              ウェブ
              <span className="block text-brand-blue">エンジニア</span>
              <span className="block">問題集</span>
            </h1>
            <p className="mt-3 w-fit -rotate-1 bg-brand-red px-3 py-1.5 text-base font-black leading-tight text-white shadow-[8px_8px_0_var(--color-brand-lime)] sm:mt-4 sm:px-4 sm:text-xl">
              解ける。気づく。身につく。
            </p>
            <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-ink-body [&]:decoration-clone sm:text-base sm:leading-8">
              <span className="[background:linear-gradient(to_top,rgba(255,255,255,0.75)_40%,transparent_40%)] [box-decoration-break:clone]">
                HTML、CSS、JavaScript、React、Next.jsまで。クイズで苦手に気づき、教科書ですぐ学び直せる無料学習サイトです。
              </span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
              <Button
                size="default"
                className="h-11 rounded-full bg-brand-blue px-5 text-sm font-black shadow-[0_12px_28px_rgba(9,103,201,0.24)] hover:bg-brand-blue-deep sm:h-11 sm:px-7 sm:text-base"
                asChild
              >
                <Link href="#categories" className="inline-flex items-center gap-1.5 sm:gap-2">
                  クイズを選ぶ
                  <ArrowRight className="size-3.5 sm:size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-11 rounded-full border-ink/20 bg-white/85 px-5 text-sm font-black text-ink shadow-[0_12px_28px_rgba(47,48,47,0.08)] hover:bg-white sm:h-11 sm:px-7 sm:text-base"
                asChild
              >
                <Link href="/books">教科書を読む</Link>
              </Button>
            </div>
            <div className="mt-4 grid max-w-sm grid-cols-3 rounded-[1.25rem] border border-white/80 bg-white/90 px-3 py-2.5 shadow-[0_18px_50px_rgba(47,48,47,0.12)] backdrop-blur sm:mt-5">
              <div className="text-center">
                <p className="text-2xl font-black leading-none text-brand-red sm:text-3xl">16</p>
                <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-body">
                  カテゴリ
                </p>
              </div>
              <div className="border-x border-ink/10 text-center">
                <p className="text-2xl font-black leading-none text-ink sm:text-3xl">
                  {totalCount > 0 ? totalCount : 500}
                  <span className="text-sm font-bold text-ink-muted">+</span>
                </p>
                <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-body">問</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black leading-none text-brand-blue sm:text-3xl">0円</p>
                <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-body">
                  すべて無料
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[linear-gradient(180deg,var(--color-cream)_0%,#ffffff_36%,var(--color-cream)_100%)]">
        <div className="mx-auto max-w-6xl px-4 pt-4 pb-8 md:pt-8 md:pb-14">
          {/* 特徴 */}
          <section className="mb-10 pt-2 md:mb-20 md:pt-4">
            <SectionHeading
              className="mb-4 sm:mb-7"
              icon={<Sparkles className="size-5 text-brand-red" />}
            >
              このサイトの特徴
            </SectionHeading>
            <div className="grid grid-cols-2 gap-2 sm:gap-x-5 sm:gap-y-5 md:grid-cols-4">
              {[
                {
                  icon: BadgeCheck,
                  color: 'text-brand-blue',
                  title: '無料で利用可能',
                  desc: '会員登録なしでもすぐに問題を解ける',
                },
                {
                  icon: Clock,
                  color: 'text-brand-red',
                  title: 'スキマ時間で学べる',
                  desc: '1問ずつ短時間で解答/解説確認できる設計',
                },
                {
                  icon: RotateCcw,
                  color: 'text-brand-blue',
                  title: '復習しやすい',
                  desc: '間違えた問題を繰り返し解き直せる、ブックマークしたり、教科書で詳細に学べる',
                },
                {
                  icon: TrendingUp,
                  color: 'text-brand-red',
                  title: '成長を実感',
                  desc: '正答率や学習日数をプロフィールで確認',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-2 rounded-xl border border-ink/10 bg-white p-2.5 shadow-[8px_8px_0_rgba(215,255,56,0.28)] sm:gap-3 sm:p-4"
                >
                  <f.icon className={`mt-0.5 size-4 ${f.color} shrink-0 sm:size-5`} />
                  <div>
                    <p className="mb-0.5 text-xs font-bold text-ink sm:text-sm">{f.title}</p>
                    <p className="text-[10px] leading-relaxed text-ink-muted sm:text-xs">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 苦手がある人だけに出る復習導線 */}
          <ReviewPromptCard />

          {/* 学習カテゴリ */}
          <section id="categories" className="relative mb-10 scroll-mt-20 md:mb-20">
            <div className="mb-4 flex justify-center">
              <div className="relative inline-block rounded-full bg-brand-blue px-5 py-1.5 text-xs font-bold text-white shadow-[8px_8px_0_var(--color-brand-lime)] sm:text-sm">
                どのカテゴリから始める？
                <div className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-brand-blue" />
              </div>
            </div>
            <SectionHeading
              className="mb-8 md:mb-10"
              subtitle={`${CATEGORIES.length}カテゴリ・全${totalCount > 0 ? totalCount : 500}問以上から挑戦しよう`}
            >
              クイズカテゴリ
            </SectionHeading>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
              {CATEGORIES.map((cat, i) => {
                const count = counts[cat.slug] ?? 0;
                const num = String(i + 1).padStart(2, '0');
                const CatIcon = categoryIconMap[cat.slug] ?? FileCode2;
                return (
                  <Link
                    key={cat.slug}
                    href={`/quiz/${cat.slug}`}
                    className={`group relative flex items-start gap-3 overflow-hidden rounded-xl border border-white/75 ${cat.bgColor} px-3 py-3 shadow-[0_10px_28px_rgba(47,48,47,0.04)] transition-colors hover:border-ink/25 sm:gap-4 sm:px-4 sm:py-3.5`}
                  >
                    {/* 背景アイコン */}
                    <CatIcon
                      className={`pointer-events-none absolute right-[15%] top-1/2 size-14 -translate-y-1/2 rotate-[15deg] ${cat.color} opacity-[0.07] blur-[1px] sm:size-16`}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />

                    <span
                      className={`shrink-0 text-2xl font-black leading-none sm:text-3xl ${cat.color} opacity-20`}
                    >
                      {num}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-baseline gap-2">
                        <h3 className={`text-sm font-bold sm:text-base ${cat.color}`}>
                          {cat.name}
                        </h3>
                        {count > 0 && (
                          <span
                            className={`text-[10px] tabular-nums sm:text-[11px] ${cat.badgeText} opacity-60`}
                          >
                            {count}問
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-1 text-[10px] leading-relaxed text-ink-muted sm:text-xs">
                        {cat.description}
                      </p>
                    </div>

                    <ArrowRight
                      className={`mt-1.5 size-4 shrink-0 ${cat.color} opacity-30 transition-transform group-hover:translate-x-0.5 group-hover:opacity-60`}
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 教科書 */}
          <section
            id="books"
            className="mb-8 rounded-[1.5rem] border border-brand-blue/10 bg-brand-blue-wash/90 px-3 py-5 shadow-[0_24px_70px_rgba(9,103,201,0.07)] sm:rounded-[2rem] md:mb-16 md:px-10 md:py-12"
          >
            <div className="mb-4 sm:mb-8 grid gap-2 sm:gap-4 md:grid-cols-[0.8fr_1fr] md:items-end">
              <SectionHeading center={false} subtitle="基礎から体系的に学べる技術書コンテンツ">
                教科書
              </SectionHeading>
              <p className="text-xs leading-relaxed text-ink-muted sm:text-sm sm:leading-7">
                クイズで曖昧だったところは、教科書に戻って確認。迷ったときの次の一手がすぐ見つかります。
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
                      chapterLabel: c.chapterLabel,
                      chapterSlug: c.chapterSlug,
                    }))}
                    isNew={NEW_BOOK_SLUGS.has(book.bookSlug)}
                  />
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="rounded-full border-brand-blue/25 bg-white px-6 font-bold text-brand-blue shadow-[0_10px_24px_rgba(9,103,201,0.08)]"
                size="sm"
                asChild
              >
                <Link
                  href="/books"
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                >
                  すべての教科書を見る（全{bookList.length}冊）
                  <ChevronRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </section>

          {/* 会員登録CTA */}
          <section className="mb-8 rounded-[1.5rem] border border-ink/15 bg-white/92 px-4 py-5 shadow-[0_24px_70px_rgba(47,48,47,0.08)] sm:rounded-[2rem] md:mb-16 md:px-10 md:py-8">
            <div className="mb-3 flex justify-center">
              <span className="inline-block rounded-full bg-brand-lime px-3 py-1 text-xs font-black tracking-[0.14em] text-ink">
                FREE
              </span>
            </div>
            <SectionHeading className="mb-1 sm:mb-2">無料で学習をもっと便利に</SectionHeading>
            <p className="mb-4 text-center text-xs text-ink-muted sm:mb-6 sm:text-sm">
              登録なしでも全問解けます。登録すると以下が使えます。
            </p>
            <div className="mx-auto mb-4 grid max-w-3xl grid-cols-2 gap-x-4 gap-y-2 sm:mb-6 sm:gap-x-8 sm:gap-y-3 lg:grid-cols-4">
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
                  title: '学習ストリーク',
                  desc: '毎日の習慣を可視化',
                },
                {
                  icon: TrendingUp,
                  color: 'text-blue-500',
                  title: 'カテゴリ別進捗',
                  desc: '得意・苦手が一目瞭然',
                },
                {
                  icon: UserCircle,
                  color: 'text-violet-500',
                  title: 'デバイス間同期',
                  desc: 'PC・スマホどちらでも',
                },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-1.5 sm:gap-2.5">
                  <f.icon className={`mt-0.5 size-3.5 ${f.color} shrink-0 sm:size-4`} />
                  <div>
                    <p className="text-xs font-bold text-ink sm:text-sm">{f.title}</p>
                    <p className="text-[10px] text-ink-muted sm:text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button
                className="rounded-full bg-brand-red px-6 font-black shadow-[8px_8px_0_var(--color-brand-lime)] hover:bg-brand-red-deep sm:px-8"
                size="default"
                asChild
              >
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-bold sm:gap-2"
                >
                  無料で会員登録する
                  <ChevronRight className="size-3.5 sm:size-4" />
                </Link>
              </Button>
            </div>
          </section>

          {/* ランダムクイズ & キーワード検索 CTA */}
          <section className="mb-8 grid grid-cols-2 gap-2 sm:gap-4 md:mb-16">
            <Link href="/quiz/random" className="group block">
              <div className="flex h-full flex-col rounded-xl border border-brand-blue/20 bg-brand-blue-tint p-3 text-center shadow-[0_18px_45px_rgba(9,103,201,0.08)] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_rgba(9,103,201,0.16)] sm:rounded-[2rem] sm:p-8">
                <h2 className="mb-0.5 text-xs font-extrabold text-ink sm:mb-1.5 sm:text-lg">
                  ランダムクイズ
                </h2>
                <p className="mb-2 text-[10px] leading-relaxed text-ink-muted sm:mb-4 sm:text-sm">
                  全カテゴリから出題
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline">、</span>サクッと力試し
                </p>
                <span className="mx-auto inline-flex items-center justify-center gap-1 rounded-full bg-brand-blue px-3.5 py-1 text-[10px] font-bold text-white transition-colors group-hover:bg-brand-blue-deep sm:gap-1.5 sm:px-6 sm:py-2 sm:text-sm">
                  挑戦する
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform sm:size-4" />
                </span>
                <div className="mt-auto flex h-14 items-end justify-center pt-2 sm:h-36 sm:pt-4">
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
              <div className="flex h-full flex-col rounded-xl border border-brand-red/20 bg-brand-red-tint p-3 text-center shadow-[0_18px_45px_rgba(255,98,77,0.08)] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_rgba(255,98,77,0.16)] sm:rounded-[2rem] sm:p-8">
                <h2 className="mb-0.5 text-xs font-extrabold text-ink sm:mb-1.5 sm:text-lg">
                  キーワード検索
                </h2>
                <p className="mb-2 text-[10px] leading-relaxed text-ink-muted sm:mb-4 sm:text-sm">
                  クイズも教科書も
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline">、</span>横断検索
                </p>
                <span className="mx-auto inline-flex items-center justify-center gap-1 rounded-full bg-brand-red px-3.5 py-1 text-[10px] font-bold text-white transition-colors group-hover:bg-brand-red-deep sm:gap-1.5 sm:px-6 sm:py-2 sm:text-sm">
                  検索する
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform sm:size-4" />
                </span>
                <div className="mt-auto flex h-14 items-end justify-center pt-2 sm:h-36 sm:pt-4">
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
          <section className="mb-10 md:mb-20">
            <div className="mb-3 flex justify-center">
              <div className="relative inline-block rounded-full bg-brand-red px-4 py-1.5 text-xs font-bold text-white shadow-[8px_8px_0_var(--color-brand-lime)] sm:text-sm">
                5ステップで効率的に！
                <div className="absolute -bottom-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-brand-red" />
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
                    <div className="absolute left-[10%] right-[10%] top-5 h-0.5 bg-ink/20" />
                    <div className="grid grid-cols-5 gap-4">
                      {steps.map((s) => (
                        <div key={s.step} className="flex flex-col items-center text-center">
                          <div className="relative z-10 mb-3 flex size-10 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white ring-4 ring-white/80">
                            {String(s.step).padStart(2, '0')}
                          </div>
                          <p className="mb-0.5 text-sm font-bold text-ink">{s.title}</p>
                          <p className="text-xs leading-relaxed text-ink-muted">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Mobile: vertical list */}
                  <div className="sm:hidden space-y-3">
                    {steps.map((s) => (
                      <div key={s.step} className="flex items-start gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                          {String(s.step).padStart(2, '0')}
                        </div>
                        <div>
                          <p className="mb-0.5 text-sm font-bold text-ink">{s.title}</p>
                          <p className="text-xs leading-relaxed text-ink-muted">{s.desc}</p>
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
            <div className="mx-auto max-w-2xl rounded-[2rem] border border-ink/10 bg-white/92 px-5 py-4 shadow-[0_24px_70px_rgba(47,48,47,0.08)]">
              <NewsList items={NEWS} />
              <div className="space-y-1 border-t border-ink/10 py-3">
                <span className="text-xs text-ink-muted">今後の予定</span>
                <p className="text-sm text-ink">間違っているコード2択クイズなどを順次追加予定</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
