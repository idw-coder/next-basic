import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

/** カテゴリslugごとの問題数を取得（SSR用・既存APIのみ使用） */
async function getQuizCountsBySlugs(
  slugs: string[]
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
          { cache: "no-store" }
        );
        if (!res.ok) return { slug, count: 0 };
        const quizzes: unknown[] = await res.json();
        return { slug, count: quizzes.length };
      })
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
            <h2 className="text-3xl font-bold text-foreground mb-4 md:text-4xl">
              ウェブ知識をスキマ時間で学習
            </h2>
            <p className="text-md text-muted-foreground mb-6 md:text-xl md:mb-8">
              HTML、CSS、JavaScript、React
              を4択クイズで習得できる無料学習プラットフォーム
            </p>
          </div>
        </div>
      </section>

      {/* アラート（お知らせの強調） */}
      <div className="mb-8 md:mb-10">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&_div]:text-current max-w-md mx-auto">
          <AlertTitle className="font-semibold text-center">順次コンテンツ追加中</AlertTitle>
          <AlertDescription className="justify-center">
            現在html css javascript react クイズから公開開始しています
          </AlertDescription>
        </Alert>
      </div>

      {/* サイトの特徴 */}
      <section className="mb-12 md:mb-16">
        <h3 className="text-xl font-bold text-foreground mb-6 md:text-2xl">
          このサイトの特徴
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>完全無料</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                すべての問題を無料で利用可能。会員登録なしでも学習を始められます。
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>スキマ時間で学べる</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                スキマ時間でも学べるように、問題を短時間で解けるようになっています。
                <br />
                <br />
                <span className="text-primary">ランダム連続解答機能は現在準備中です。</span>
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-primary/8">
            <CardHeader>
              <CardTitle>間違えた問題を復習ができる</CardTitle>
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
          <Link href="/quiz/html-basic" className="block">
            <Card className="border-primary/40 bg-primary/2 hover:border-primary/60 hover:bg-primary/10 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle>HTML</CardTitle>
                <Badge>問題数: {counts["html-basic"] ?? 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>
                  ウェブページの構造を作るHTMLと、デザインを制御するCSSの基礎から実践的なテクニックまで学習できます。セマンティックHTML、Flexbox、Grid、レスポンシブデザインなどを問題形式で習得。
                </CardDescription>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• HTMLタグの使い分け</li>
                  <li>• CSSセレクタとプロパティ</li>
                  <li>• レイアウト手法（Flexbox/Grid）</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
          <Link href="/quiz/css-basic" className="block">
            <Card className="border-primary/40 bg-primary/2 hover:border-primary/60 hover:bg-primary/10 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle>CSS</CardTitle>
                <Badge>問題数: {counts["css-basic"] ?? 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>
                  ウェブページの構造を作るHTMLと、デザインを制御するCSSの基礎から実践的なテクニックまで学習できます。セマンティックHTML、Flexbox、Grid、レスポンシブデザインなどを問題形式で習得。
                </CardDescription>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• HTMLタグの使い分け</li>
                  <li>• CSSセレクタとプロパティ</li>
                  <li>• レイアウト手法（Flexbox/Grid）</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
          <Link href="/quiz/javascript-basic" className="block">
            <Card className="border-primary/40 bg-primary/2 hover:border-primary/60 hover:bg-primary/10 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle>JavaScript</CardTitle>
                {counts["javascript-basic"] > 0 ? (
                  <Badge>問題数: {counts["javascript-basic"]}</Badge>
                ) : (
                  <Badge variant="secondary">準備中</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>
                  ウェブサイトに動きをつけるJavaScriptの基本文法から、非同期処理、DOM操作、ES6+の新機能まで幅広くカバー。実務で必要な知識を体系的に学習できます。
                </CardDescription>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 変数、関数、オブジェクト</li>
                  <li>• Promise、async/await</li>
                  <li>• DOM操作とイベント処理</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/quiz/react-basic" className="block">
            <Card className="border-primary/40 bg-primary/2 hover:border-primary/60 hover:bg-primary/10 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle>React</CardTitle>
                <Badge>問題数: {counts["react-basic"] ?? 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>
                  モダンなフロントエンド開発に欠かせないReactライブラリ。コンポーネント設計、Hooks、状態管理など、実践的な問題で理解を深められます。初学者にもわかりやすい解説付き。
                </CardDescription>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• コンポーネントとProps</li>
                  <li>• useState、useEffect等のHooks</li>
                  <li>• イベントハンドリングと状態管理</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:border-muted-foreground/30 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle>Node.js</CardTitle>
              <Badge variant="secondary">準備中</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>
                サーバーサイドJavaScriptの実行環境Node.js。Express.jsを使ったAPI開発、ファイル操作、モジュールシステムなど、バックエンド開発の基礎を問題で習得できます。
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Node.jsの基本とモジュール</li>
                <li>• Express.jsでのAPI開発</li>
                <li>• 非同期処理とストリーム</li>
              </ul>
            </CardContent>
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
                <p className="text-foreground">HTML、CSS、JavaScript、Reactクイズを公開しました</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">今後の予定</p>
                <p className="text-foreground">
                  Node.js、Git、Docker、AWSのクイズを順次追加予定です
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
                    基礎から始める
                  </p>
                  <p className="text-muted-foreground text-sm">
                    HTML/CSSの基礎を固めてから、JavaScriptに進むことをおすすめします。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">2.</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    繰り返し解く
                  </p>
                  <p className="text-muted-foreground text-sm">
                    間違えた問題は復習し、理解が定着するまで何度も解き直しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">3.</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    実際にコードを書く
                  </p>
                  <p className="text-muted-foreground text-sm">
                    問題で学んだ知識は、実際に手を動かしてコードを書くことで定着します。
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
