import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* ヒーロー */}
      <section className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl font-bold text-foreground mb-4 md:text-4xl">
          ウェブ開発を問題で学ぶ
        </h2>
        <p className="text-lg text-muted-foreground mb-6 md:text-xl md:mb-8">
          HTML/CSS/JavaScript/React/Node.js
          を4択クイズで習得できる無料学習プラットフォーム
        </p>
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&_div]:text-current max-w-md mx-auto">
          <AlertTitle className="font-semibold">順次コンテンツ追加中</AlertTitle>
          <AlertDescription>
            現在Reactクイズから公開開始しています
          </AlertDescription>
        </Alert>
      </section>

      {/* サイトの特徴 */}
      <section className="mb-12 md:mb-16">
        <h3 className="text-xl font-bold text-foreground mb-6 md:text-2xl">
          このサイトの特徴
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>実践的な問題</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                実務で使える知識を4択クイズ形式で出題。基礎から応用まで段階的に学習できます。
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>幅広い技術カバー</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                HTML/CSSの基礎からReact、Node.jsまで、モダンなウェブ開発に必要な技術を網羅。
              </CardDescription>
            </CardContent>
          </Card>
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
        </div>
      </section>

      {/* 学習カテゴリ */}
      <section id="categories" className="mb-12 md:mb-16">
        <h3 className="text-xl font-bold text-foreground mb-6 md:text-2xl">
          学習カテゴリ
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:border-muted-foreground/30 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle>HTML/CSS</CardTitle>
              <Badge variant="secondary">準備中</Badge>
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

          <Card className="hover:border-muted-foreground/30 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle>JavaScript</CardTitle>
              <Badge variant="secondary">準備中</Badge>
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

          <Link href="/quiz/react-basic" className="block">
            <Card className="border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle>React</CardTitle>
                <Badge>問題数: 20</Badge>
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
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="pb-3 border-b border-border last:border-0">
                <p className="text-sm text-muted-foreground">2026/02/08</p>
                <p className="text-foreground">Reactクイズ20問を公開しました</p>
              </div>
              <div className="pb-3 border-b border-border last:border-0">
                <p className="text-sm text-muted-foreground">2026/02/08</p>
                <p className="text-foreground">ウェブエンジニア問題集を開設しました</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">今後の予定</p>
                <p className="text-foreground">
                  HTML/CSS、JavaScript、Node.jsのクイズを順次追加予定です
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
                  <p className="font-semibold text-foreground mb-1">基礎から始める</p>
                  <p className="text-muted-foreground text-sm">
                    HTML/CSSの基礎を固めてから、JavaScriptに進むことをおすすめします。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">2.</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">繰り返し解く</p>
                  <p className="text-muted-foreground text-sm">
                    間違えた問題は復習し、理解が定着するまで何度も解き直しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary shrink-0">3.</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">実際にコードを書く</p>
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
