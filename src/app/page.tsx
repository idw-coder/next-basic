import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  BadgeCheck,
  Clock,
  RotateCcw,
  PlayCircle,
  Flame,
  Target,
  TrendingUp,
  UserCircle,
  ArrowRight,
  ChevronRight,
  Shuffle,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

async function getQuizCountsBySlugs(
  slugs: string[],
): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  try {
    const categoriesRes = await fetch(`${API_BASE_URL}/api/quiz/categories`, {
      cache: "no-store",
    });
    if (!categoriesRes.ok) return Object.fromEntries(slugs.map((s) => [s, 0]));
    const categories: { id: number; slug: string }[] =
      await categoriesRes.json();

    const counts = await Promise.all(
      slugs.map(async (slug) => {
        const cat = categories.find((c) => c.slug === slug);
        if (!cat) return { slug, count: 0 };
        const res = await fetch(
          `${API_BASE_URL}/api/quiz/category/${cat.id}/quizzes`,
          { cache: "no-store" },
        );
        if (!res.ok) return { slug, count: 0 };
        const quizzes: unknown[] = await res.json();
        return { slug, count: quizzes.length };
      }),
    );
    counts.forEach(({ slug, count }) => (out[slug] = count));
  } catch (error) {
    console.error("Failed to fetch quiz counts:", error);
    slugs.forEach((s) => (out[s] = 0));
  }
  return out;
}

const CATEGORY_SLUGS = [
  "html-basic",
  "css-basic",
  "javascript-basic",
  "react-basic",
  "vue-basic",
  "nodejs-basic",
  "nextjs",
  "aws-basic",
  "git-basic",
  "nginx-basic",
  "ts-general",
  "security-general",
  "cs-basic",
  "docker",
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
    slug: "html-basic", name: "HTML",
    color: "text-orange-600 dark:text-orange-400",
    hoverColor: "bg-orange-500 hover:bg-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-500/10",
    badgeBg: "bg-orange-100 dark:bg-orange-500/20",
    badgeText: "text-orange-700 dark:text-orange-300",
    description: "ウェブページの構造を作るための言語。タグや属性の使い方を学びます。",
    topics: ["基本構文", "タグ・属性・要素"],
  },
  {
    slug: "css-basic", name: "CSS",
    color: "text-blue-600 dark:text-blue-400",
    hoverColor: "bg-blue-500 hover:bg-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    badgeBg: "bg-blue-100 dark:bg-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-300",
    description: "デザインを制御するCSSの基礎から、Flexbox・Grid・レスポンシブまで。",
    topics: ["セレクタ・プロパティ", "Flexbox / Grid", "レスポンシブ"],
  },
  {
    slug: "javascript-basic", name: "JavaScript",
    color: "text-amber-600 dark:text-amber-400",
    hoverColor: "bg-amber-500 hover:bg-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    badgeBg: "bg-amber-100 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-300",
    description: "基本文法から非同期処理、DOM操作、ES6+の新機能まで幅広くカバー。",
    topics: ["変数・関数", "Promise / async", "DOM操作"],
  },
  {
    slug: "react-basic", name: "React",
    color: "text-cyan-600 dark:text-cyan-400",
    hoverColor: "bg-cyan-500 hover:bg-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
    badgeBg: "bg-cyan-100 dark:bg-cyan-500/20",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    description: "コンポーネント設計、Hooks、状態管理など実践的な問題で理解を深められます。",
    topics: ["コンポーネント・Props", "Hooks", "状態管理"],
  },
  {
    slug: "vue-basic", name: "Vue.js",
    color: "text-emerald-600 dark:text-emerald-400",
    hoverColor: "bg-emerald-500 hover:bg-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    badgeBg: "bg-emerald-100 dark:bg-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    description: "Vue 2/3の基本概念からComposition API、ディレクティブまで。",
    topics: ["ディレクティブ", "Composition API", "Pinia / Router"],
  },
  {
    slug: "nodejs-basic", name: "Node.js",
    color: "text-green-600 dark:text-green-400",
    hoverColor: "bg-green-500 hover:bg-green-600",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    badgeBg: "bg-green-100 dark:bg-green-500/20",
    badgeText: "text-green-700 dark:text-green-300",
    description: "Express.jsでのAPI開発やモジュールシステムなど、バックエンドの基礎。",
    topics: ["基本・モジュール", "Express.js", "非同期処理"],
  },
  {
    slug: "nextjs", name: "Next.js",
    color: "text-slate-700 dark:text-slate-300",
    hoverColor: "bg-slate-700 hover:bg-slate-800",
    bgColor: "bg-slate-50 dark:bg-slate-500/10",
    badgeBg: "bg-slate-100 dark:bg-slate-500/20",
    badgeText: "text-slate-700 dark:text-slate-300",
    description: "App Router・Server Components・エラー解決など、Next.jsの実践的なトピックをカバー。",
    topics: ["App Router", "Server Components", "エラー解決"],
  },
  {
    slug: "git-basic", name: "Git",
    color: "text-rose-600 dark:text-rose-400",
    hoverColor: "bg-rose-600 hover:bg-rose-700",
    bgColor: "bg-rose-50 dark:bg-rose-600/10",
    badgeBg: "bg-rose-100 dark:bg-rose-600/20",
    badgeText: "text-rose-700 dark:text-rose-300",
    description: "基本コマンドから現場で頻発するエラーの解決方法まで網羅。",
    topics: ["基本コマンド", "ブランチ・マージ", "エラー解決"],
  },
  {
    slug: "aws-basic", name: "AWS",
    color: "text-amber-700 dark:text-amber-400",
    hoverColor: "bg-amber-600 hover:bg-amber-700",
    bgColor: "bg-amber-50 dark:bg-amber-600/10",
    badgeBg: "bg-amber-100 dark:bg-amber-600/20",
    badgeText: "text-amber-800 dark:text-amber-300",
    description: "EC2、S3、Lambda、RDSなど代表的なサービスを問題形式で学べます。",
    topics: ["EC2 / S3 / VPC", "Lambda / API GW", "RDS / CloudFront"],
  },
  {
    slug: "nginx-basic", name: "Nginx",
    color: "text-teal-600 dark:text-teal-400",
    hoverColor: "bg-teal-500 hover:bg-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-500/10",
    badgeBg: "bg-teal-100 dark:bg-teal-500/20",
    badgeText: "text-teal-700 dark:text-teal-300",
    description: "リバースプロキシや静的ファイル配信、HTTPS対応など実務に直結する知識。",
    topics: ["location / server", "リバースプロキシ", "SSL / キャッシュ"],
  },
  {
    slug: "ts-general", name: "TypeScript",
    color: "text-indigo-600 dark:text-indigo-400",
    hoverColor: "bg-indigo-500 hover:bg-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    badgeBg: "bg-indigo-100 dark:bg-indigo-500/20",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    description: "基本文法・型システム・Utility Typesからよくあるコンパイルエラーまで幅広くカバー。",
    topics: ["型システム・ジェネリクス", "Utility Types", "コンパイルエラー"],
  },
  {
    slug: "security-general", name: "セキュリティ",
    color: "text-red-600 dark:text-red-400",
    hoverColor: "bg-red-500 hover:bg-red-600",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    badgeBg: "bg-red-100 dark:bg-red-500/20",
    badgeText: "text-red-700 dark:text-red-300",
    description: "XSS・CSRF・SQLインジェクションなどWebセキュリティの基礎知識を問題形式で学習。",
    topics: ["XSS / CSRF", "暗号化・認証", "ネットワーク"],
  },
  {
    slug: "cs-basic", name: "CS基礎",
    color: "text-purple-600 dark:text-purple-400",
    hoverColor: "bg-purple-500 hover:bg-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    badgeBg: "bg-purple-100 dark:bg-purple-500/20",
    badgeText: "text-purple-700 dark:text-purple-300",
    description: "データ構造・アルゴリズム・計算量など、コンピュータサイエンスの基礎を網羅。",
    topics: ["データ構造", "アルゴリズム", "計算量・エラー"],
  },
  {
    slug: "docker", name: "Docker",
    color: "text-sky-600 dark:text-sky-400",
    hoverColor: "bg-sky-500 hover:bg-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-500/10",
    badgeBg: "bg-sky-100 dark:bg-sky-500/20",
    badgeText: "text-sky-700 dark:text-sky-300",
    description: "コンテナ仮想化のDocker。Dockerfile・docker compose・ボリューム管理などを問題形式で習得。",
    topics: ["イメージ・コンテナ", "Dockerfile", "docker compose"],
  },
];

const NEWS = [
  { date: "2026/04/01", text: "Next.js・Dockerクイズを公開しました", isNew: true },
  { date: "2026/03/01", text: "TypeScript・セキュリティ・CS基礎クイズを公開しました", isNew: false },
  { date: "2026/02/28", text: "Google認証を導入しました、サイトの利用をより便利に安心して行えます", isNew: false },
  { date: "2026/02/25", text: "ランダムクイズ機能を公開しました", isNew: false },
  { date: "2026/02/21", text: "学習記録・プロフィール機能を公開しました", isNew: false },
  { date: "2026/02/18", text: "解答履歴機能を公開しました", isNew: false },
  { date: "2026/02/15", text: "AWS、Git、Nginxクイズを公開しました", isNew: false },
  { date: "2026/02/14", text: "Vue、Node.jsクイズを公開しました", isNew: false },
  { date: "2026/02/08", text: "HTML、CSS、JavaScript、Reactクイズを公開しました", isNew: false },
  { date: "2026/02/08", text: "ウェブエンジニア問題集を開設しました", isNew: false },
];

export default async function Home() {
  const counts = await getQuizCountsBySlugs([...CATEGORY_SLUGS]);
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      {/* ヒーロー */}
      <section className="mb-16 md:mb-20">
        <div className="flex flex-col-reverse justify-center sm:flex-row sm:items-center gap-8">
          <div className="flex justify-center sm:justify-start">
            <Image
              src="/inpiration_man_color.png"
              alt="ひらめきを得て学習している人のイラスト"
              width={588}
              height={761}
              priority
              className="w-full max-w-[160px] md:max-w-[200px] h-auto -scale-x-100"
            />
          </div>
          <div className="text-center sm:text-left sm:flex-1 sm:max-w-xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4 md:text-4xl leading-tight">
              ウェブ知識を
              <br className="block sm:hidden" />
              <span className="text-primary">スキマ時間</span>で学習
            </h1>
            <p className="text-base text-muted-foreground md:text-lg mb-6 leading-relaxed">
              HTML、CSS、JavaScript、TypeScript、セキュリティ など
              <br className="hidden md:block" />
              14カテゴリの4択クイズで実践的なウェブ知識を身につけよう
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="#categories" className="inline-flex items-center gap-2 font-bold">
                  学習を始める
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <span className="text-xs text-muted-foreground">会員登録なしですぐ始められます</span>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴 */}
      <section className="mb-16 md:mb-20 bg-muted/40 rounded-2xl px-5 py-10 md:px-8">
        <h2 className="text-xl font-bold mb-8 md:text-2xl text-center text-foreground">
          <Sparkles className="size-5 inline-block mr-2 -mt-0.5 text-primary" />
          このサイトの特徴
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {[
            { icon: BadgeCheck, color: "text-primary", title: "完全無料", desc: "会員登録なしでも\nすべての問題を利用可能" },
            { icon: Clock, color: "text-primary", title: "スキマ時間で学べる", desc: "1問ずつ短時間で\n解答できる設計" },
            { icon: RotateCcw, color: "text-primary", title: "復習しやすい", desc: "間違えた問題を\n繰り返し解き直せる" },
            { icon: TrendingUp, color: "text-primary", title: "成長を実感", desc: "正答率や学習日数を\nプロフィールで確認" },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <f.icon className={`size-6 ${f.color}`} />
              </div>
              <p className="font-semibold text-foreground text-sm mb-1">{f.title}</p>
              <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 会員登録CTA */}
      <section className="mb-16 md:mb-20 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl px-5 py-10 md:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold md:text-2xl mb-2 text-foreground">
            無料会員登録で学習をもっと便利に
          </h2>
          <p className="text-sm text-muted-foreground">
            登録しなくてもすべての問題を解けます。登録すると以下の機能が使えます。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl mx-auto mb-8">
          {[
            { icon: Target, color: "text-green-500", bg: "bg-green-500/10", title: "正答率を記録", desc: "成長を数字で実感" },
            { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", title: "連続学習ストリーク", desc: "毎日の習慣を可視化" },
            { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", title: "カテゴリ別の進捗", desc: "得意・苦手が一目瞭然" },
            { icon: UserCircle, color: "text-violet-500", bg: "bg-violet-500/10", title: "デバイス間で同期", desc: "PC・スマホどちらでも" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-lg border p-4">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${f.bg}`}>
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
      <section className="mb-16 md:mb-20 grid gap-4 sm:grid-cols-2">
        <Link href="/quiz/random" className="block group">
          <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-5 sm:p-6 hover:border-blue-400 dark:hover:border-blue-600 transition-colors h-full">
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

        <Link href="/quiz/search" className="block group">
          <div className="rounded-2xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 p-5 sm:p-6 hover:border-violet-400 dark:hover:border-violet-600 transition-colors h-full">
            <div className="flex items-start gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/60 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/60 transition-colors">
                <Search className="size-6 sm:size-7 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-foreground mb-1">
                  キーワードで問題を探す
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  「Promise」「Flexbox」「XSS」など、気になるワードで全カテゴリを横断検索！
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

      {/* 学習カテゴリ */}
      <section id="categories" className="mb-16 md:mb-20">
        <h2 className="text-xl font-bold mb-6 md:mb-8 md:text-2xl text-center text-foreground">
          学習カテゴリ
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const count = counts[cat.slug] ?? 0;
            return (
              <Card key={cat.slug} className={`${cat.bgColor} gap-0 py-0 border-none h-full`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0 px-3 pt-3 sm:px-6 sm:pt-6">
                  <CardTitle className={`${cat.color} text-sm sm:text-lg`}>{cat.name}</CardTitle>
                  <Badge className={`${cat.badgeBg} ${cat.badgeText} text-[10px] sm:text-xs shrink-0`}>
                    {count > 0 ? `${count}問` : "準備中"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 sm:space-y-3 px-3 sm:px-6 pt-1.5 sm:pt-3">
                  <CardDescription className="leading-relaxed text-xs sm:text-sm hidden sm:block">
                    {cat.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1">
                    {cat.topics.map((t) => (
                      <span key={t} className="text-[9px] sm:text-[11px] text-muted-foreground bg-background/60 rounded-full px-1.5 sm:px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="px-3 pb-3 sm:px-6 sm:pb-6 pt-1.5 sm:pt-3">
                  <Button className={`${cat.hoverColor} rounded-full w-full text-white h-7 sm:h-10 text-[11px] sm:text-sm`} asChild>
                    <Link
                      href={`/quiz/${cat.slug}`}
                      className="inline-flex w-full items-center justify-center gap-1.5 sm:gap-2 font-bold"
                    >
                      <PlayCircle className="size-3 sm:size-4 shrink-0" />
                      問題を解く
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}

        </div>
      </section>

      {/* 学習のすすめ方 */}
      <section className="mb-16 md:mb-20 bg-muted/40 rounded-2xl px-5 py-10 md:px-8">
        <h2 className="text-xl font-bold mb-8 md:text-2xl text-center text-foreground">
          学習のすすめ方
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {[
            { step: 1, title: "まずはクイズに挑戦", desc: "スキマ時間に1問ずつ。会員登録なしですぐ始められます。" },
            { step: 2, title: "間違えた問題を復習", desc: "解答履歴から間違えた問題をピックアップして解き直しましょう。" },
            { step: 3, title: "プロフィールで確認", desc: "会員登録すると正答率・連続学習日数・カテゴリ別進捗を確認できます。" },
            { step: 4, title: "コードを書いて実践", desc: "問題で学んだ知識を、実際にコードを書いて理解を深めましょう。" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto mb-2 sm:mb-3 flex size-8 sm:size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs sm:text-sm">
                {s.step}
              </div>
              <p className="font-semibold text-foreground text-xs sm:text-sm mb-1">{s.title}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* お知らせ */}
      <section id="news" className="mb-8">
        <h2 className="text-xl font-bold mb-6 md:text-2xl text-center text-foreground">
          お知らせ
        </h2>
        <div className="max-w-2xl mx-auto divide-y divide-border">
          {NEWS.map((item, i) => (
            <div key={i} className="py-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {item.date}
                </span>
                {item.isNew && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 leading-4">
                    NEW
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground">{item.text}</p>
            </div>
          ))}
          <div className="py-3 space-y-1">
            <span className="text-xs text-muted-foreground">今後の予定</span>
            <p className="text-sm text-foreground">
              間違っているコード2択クイズなどを順次追加予定
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
