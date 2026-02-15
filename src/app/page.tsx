import Link from "next/link";
import Image from "next/image";
import {
  Megaphone,
  Sparkles,
  BadgeCheck,
  Clock,
  RotateCcw,
  PlayCircle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

/** カテゴリslugごとの問題数を取得（SSR用・既存APIのみ使用） */
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
  "aws-basic",
  "git-basic",
] as const;

export default async function Home() {
  const counts = await getQuizCountsBySlugs([...CATEGORY_SLUGS]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* ヒーロー（メインビジュアル） */}
      <section className="mb-12 md:mb-16">
        <div className="flex flex-col-reverse justify-center sm:flex-row sm:items-center gap-6">
          <div className="flex justify-center sm:justify-start">
            <Image
              src="/inpiration_man_color.png"
              alt="ひらめきを得て学習している人のイラスト"
              width={588}
              height={761}
              priority
              className="w-full max-w-[180px] md:max-w-[220px] h-auto -scale-x-100"
            />
          </div>
          <div className="text-center sm:text-left sm:flex-1 sm:max-w-xl">
            <div className="relative border-[3px] border-primary/55 bg-background/95 rounded-[60px] px-5 py-5 md:px-10 md:py-6 shadow-sm">
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-primary/55 bg-background/95 sm:hidden"
              />
              <span
                aria-hidden="true"
                className="absolute -left-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-b-[3px] border-l-[3px] border-primary/55 bg-background/95 sm:block"
              />
              <h2 className="text-2xl font-bold text-foreground mb-4 md:text-3xl">
                ウェブ知識を<br className="block sm:hidden" />スキマ時間で学習
              </h2>
              <p className="text-md text-muted-foreground md:text-xl">
                HTML、CSS、JavaScript、React、Vue、Node.js、AWS、Gitを<br />
                4択クイズで習得できる無料学習プラットフォーム
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* アラート（お知らせの強調） */}
      <div className="mb-8 md:mb-10">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&_div]:text-current max-w-md mx-auto">
          <AlertTitle className="font-semibold text-center inline-flex items-center justify-center gap-2">
            <Megaphone className="size-4 shrink-0" />
            順次コンテンツ追加中
          </AlertTitle>
          <AlertDescription className="justify-center">
            現在html css javascript react vue nodejs aws git クイズから公開開始しています
            <br />
            Dockerのクイズを順次追加予定です
          </AlertDescription>
        </Alert>
      </div>

      {/* サイトの特徴 */}
      <section className="mb-12 md:mb-16">
        <h3 className="text-xl font-bold text-foreground mb-6 md:text-2xl flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          このサイトの特徴
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-primary" />
                完全無料
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                すべての問題を無料で利用可能。会員登録なしでも学習を始められます。
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                スキマ時間で学べる
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                スキマ時間でも学べるように、問題を短時間で解けるようになっています。
                <br />
                <br />
                <span className="text-primary">
                  ランダム連続解答機能は現在準備中です。
                </span>
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-primary/8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="size-4 text-primary" />
                間違えた問題を復習ができる
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                問題の解答履歴を保存し、間違えた問題を復習できるようになっています。
                <br />
                <br />
                <span className="text-primary">こちら現在準備中です。</span>
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 学習カテゴリ */}
      <section id="categories" className="mb-12 md:mb-16">
        <h3 className="text-xl font-bold text-foreground mb-6 md:text-2xl">
          学習カテゴリ
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-orange-500/5 border-none rounded-lg h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-orange-700 dark:text-orange-400 group-hover:underline">
                HTML
              </CardTitle>
              <Badge className="bg-orange-500/20 text-orange-800 dark:text-orange-200">
                問題数
                <span className="font-bold">{counts["html-basic"] ?? 0}</span>
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 min-h-0">
              <CardDescription>
                HTMLとは、ウェブページの構造を作るための言語です。HTMLタグを使ってウェブページの構造を作ります。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HTMLの基本構文</li>
                <li>• HTMLタグ、属性、要素の使い方</li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="bg-orange-500 hover:bg-orange-600 cursor-pointer rounded-full w-full">
                <Link
                  href="/quiz/html-basic"
                  className="inline-flex w-full items-center justify-center gap-2 font-bold"
                >
                  <PlayCircle className="size-5 shrink-0" />
                  問題を解く
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-blue-500/5 border-none rounded-lg h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-blue-700 dark:text-blue-400 group-hover:underline">
                CSS
              </CardTitle>
              <Badge className="bg-blue-500/20 text-blue-800 dark:text-blue-200">
                問題数
                <span className="font-bold">{counts["css-basic"] ?? 0}</span>
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 min-h-0">
              <CardDescription>
                ウェブページのデザインを制御するCSSの基礎から実践的なテクニックまで学習できます。セマンティックCSS、Flexbox、Grid、レスポンシブデザインなどを問題形式で習得。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSSセレクタとプロパティ</li>
                <li>• レイアウト手法（Flexbox/Grid）</li>
                <li>• レスポンシブデザイン</li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full w-full">
                <Link
                  href="/quiz/css-basic"
                  className="inline-flex w-full items-center justify-center gap-2 font-bold"
                >
                  <PlayCircle className="size-5 shrink-0" />
                  問題を解く
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-amber-500/5 border-none rounded-lg h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-amber-700 dark:text-amber-400 group-hover:underline">
                JavaScript
              </CardTitle>
              {counts["javascript-basic"] > 0 ? (
                <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-200">
                  問題数
                  <span className="font-bold">
                    {counts["javascript-basic"]}
                  </span>
                </Badge>
              ) : (
                <Badge variant="secondary">準備中</Badge>
              )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 min-h-0">
              <CardDescription>
                ウェブサイトに動きをつけるJavaScriptの基本文法から、非同期処理、DOM操作、ES6+の新機能まで幅広くカバー。実務で必要な知識を体系的に学習できます。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 変数、関数、オブジェクト</li>
                <li>• Promise、async/await</li>
                <li>• DOM操作とイベント処理</li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="bg-amber-500 hover:bg-amber-600 cursor-pointer rounded-full w-full">
                <Link
                  href="/quiz/javascript-basic"
                  className="inline-flex w-full items-center justify-center gap-2 font-bold"
                >
                  <PlayCircle className="size-5 shrink-0" />
                  問題を解く
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-cyan-500/5 border-none rounded-lg h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-cyan-700 dark:text-cyan-400 group-hover:underline">
                React
              </CardTitle>
              <Badge className="bg-cyan-500/20 text-cyan-800 dark:text-cyan-200">
                問題数
                <span className="font-bold">{counts["react-basic"] ?? 0}</span>
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 min-h-0">
              <CardDescription>
                モダンなフロントエンド開発に欠かせないReactライブラリ。コンポーネント設計、Hooks、状態管理など、実践的な問題で理解を深められます。初学者にもわかりやすい解説付き。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• コンポーネントとProps</li>
                <li>• useState、useEffect等のHooks</li>
                <li>• イベントハンドリングと状態管理</li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer rounded-full w-full">
                <Link
                  href="/quiz/react-basic"
                  className="inline-flex w-full items-center justify-center gap-2 font-bold"
                >
                  <PlayCircle className="size-5 shrink-0" />
                  問題を解く
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-emerald-500/5 border-none rounded-lg h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-emerald-700 dark:text-emerald-400 group-hover:underline">
                Vue.js
              </CardTitle>
              <Badge className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                問題数
                <span className="font-bold">{counts["vue-basic"] ?? 0}</span>
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 min-h-0">
              <CardDescription>
                Vue 2/3の基本概念、Options/Composition API、ディレクティブ、ライフサイクルに関する問題です。段階的に学べる実践的なクイズで理解を深められます。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ディレクティブ（v-if、v-for、v-model）</li>
                <li>• Composition API（ref、reactive）</li>
                <li>• ライフサイクル、Pinia、Vue Router</li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="bg-emerald-500 hover:bg-emerald-600 cursor-pointer rounded-full w-full">
                <Link
                  href="/quiz/vue-basic"
                  className="inline-flex w-full items-center justify-center gap-2 font-bold"
                >
                  <PlayCircle className="size-5 shrink-0" />
                  問題を解く
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-green-500/5 border-none rounded-lg h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-green-700 dark:text-green-400 group-hover:underline">
                Node.js
              </CardTitle>
              <Badge className="bg-green-500/20 text-green-800 dark:text-green-200">
                問題数
                <span className="font-bold">{counts["nodejs-basic"] ?? 0}</span>
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 min-h-0">
              <CardDescription>
                サーバーサイドJavaScriptの実行環境Node.js。Express.jsを使ったAPI開発、ファイル操作、モジュールシステムなど、バックエンド開発の基礎を問題で習得できます。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Node.jsの基本とモジュール</li>
                <li>• Express.jsでのAPI開発</li>
                <li>• 非同期処理とストリーム</li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="bg-green-500 hover:bg-green-600 cursor-pointer rounded-full w-full">
                <Link
                  href="/quiz/nodejs-basic"
                  className="inline-flex w-full items-center justify-center gap-2 font-bold"
                >
                  <PlayCircle className="size-5 shrink-0" />
                  問題を解く
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-rose-600/5 border-none rounded-lg h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-rose-700 dark:text-rose-400 group-hover:underline">
                Git
              </CardTitle>
              <Badge className="bg-rose-600/20 text-rose-800 dark:text-rose-200">
                問題数
                <span className="font-bold">{counts["git-basic"] ?? 0}</span>
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 min-h-0">
              <CardDescription>
                バージョン管理システムGitの基本コマンドから、現場で頻発するエラーの解決方法までを網羅したクイズです。実務で役立つ知識を習得できます。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 基本コマンド（init、clone、commit、status）</li>
                <li>• ブランチ・マージ・リベース</li>
                <li>• よくあるエラーと解決方法</li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="bg-rose-600 hover:bg-rose-700 cursor-pointer rounded-full w-full">
                <Link
                  href="/quiz/git-basic"
                  className="inline-flex w-full items-center justify-center gap-2 font-bold"
                >
                  <PlayCircle className="size-5 shrink-0" />
                  問題を解く
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-amber-600/5 border-none rounded-lg h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-amber-800 dark:text-amber-400 group-hover:underline">
                AWS
              </CardTitle>
              <Badge className="bg-amber-600/20 text-amber-900 dark:text-amber-200">
                問題数
                <span className="font-bold">{counts["aws-basic"] ?? 0}</span>
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 min-h-0">
              <CardDescription>
                Amazon Web Servicesの代表的なサービスを問題で学べます。EC2、S3、Lambda、RDSなど、インフラとアプリケーション開発に必要な知識を習得できます。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• EC2、S3、VPCの基本</li>
                <li>• Lambda、API Gateway</li>
                <li>• RDS、CloudFront</li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button className="bg-amber-600 hover:bg-amber-700 cursor-pointer rounded-full w-full">
                <Link
                  href="/quiz/aws-basic"
                  className="inline-flex w-full items-center justify-center gap-2 font-bold"
                >
                  <PlayCircle className="size-5 shrink-0" />
                  問題を解く
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-blue-500/5 border-none rounded-lg h-full">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="text-blue-700 dark:text-blue-400">
                Docker
              </CardTitle>
              <Badge className="bg-blue-500/20 text-blue-800 dark:text-blue-200">
                準備中
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 min-h-0">
              <CardDescription>
                コンテナ仮想化の事実上の標準であるDocker。イメージのビルド、コンテナの起動・管理、Docker Composeによるマルチコンテナ構成など、実務で必要な知識を問題形式で習得できます。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• イメージとコンテナの基本</li>
                <li>• Dockerfile、docker-compose</li>
                <li>• ネットワークとボリューム</li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                disabled
                className="bg-blue-500/50 hover:bg-blue-500/50 cursor-not-allowed rounded-full w-full opacity-80"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Clock className="size-5 shrink-0" />
                  準備中
                </span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* お知らせ */}
      <section id="news" className="mb-12 md:mb-16">
        <h3 className="text-xl font-bold text-foreground mb-6 md:text-2xl">
          お知らせ
        </h3>
        <Card>
          <CardContent>
            <div className="space-y-3">
              <div className="pb-3 border-b border-border last:border-0">
                <p className="text-sm text-muted-foreground">2026/02/08</p>
                <p className="text-foreground">
                  ウェブエンジニア問題集を開設しました
                </p>
              </div>
              <div className="pb-3 border-b border-border last:border-0">
                <p className="text-sm text-muted-foreground">2026/02/08</p>
                <p className="text-foreground">
                  HTML、CSS、JavaScript、Reactクイズを公開しました
                </p>
              </div>
              <div className="pb-3 border-b border-border last:border-0">
                <p className="text-sm text-muted-foreground">2026/02/14</p>
                <p className="text-foreground">
                  Vue、Node.jsクイズを公開しました
                </p>
              </div>
              <div className="pb-3 border-b border-border last:border-0">
                <p className="text-sm text-muted-foreground">2026/02/15</p>
                <p className="text-foreground">
                  AWS、Gitクイズを公開しました
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">今後の予定</p>
                <p className="text-foreground">
                  Dockerのクイズを順次追加予定です
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 学習のすすめ方 */}
      <section className="mt-12 md:mt-16">
        <h3 className="text-xl font-bold text-foreground mb-6 md:text-2xl">
          学習のすすめ方
        </h3>
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">1.</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    スキマ時間でコツコツと学習
                  </p>
                  <p className="text-muted-foreground text-sm">
                    スキマ時間でも学習できるように、問題を短時間で解けるようになっています。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">2.</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    間違えた問題は復習し、理解が定着するまで何度も解き直しましょう。
                  </p>
                  <p className="text-muted-foreground text-sm">
                    復習機能は現在準備中です。解説、参考記事についても順次追加予定です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">3.</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    実際にコードを書いて、理解を深めましょう。
                  </p>
                  <p className="text-muted-foreground text-sm">
                    問題で学んだ知識は、実際に手を動かしてコードを書いて理解を深めましょう。
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
