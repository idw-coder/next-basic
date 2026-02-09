import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* ヒーローセクション */}
      <section className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          ウェブ開発を問題で学ぶ
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          HTML/CSS/JavaScript/React/Node.js を4択クイズで習得できる無料学習プラットフォーム
        </p>
        <div className="inline-block bg-yellow-100 border border-yellow-300 rounded px-6 py-3 text-yellow-800">
          <p className="font-semibold">順次コンテンツ追加中</p>
          <p className="text-sm mt-1">現在Reactクイズから公開開始しています</p>
        </div>
      </section>

      {/* サイトの特徴 */}
      <section className="mb-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">このサイトの特徴</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded p-6">
            <h4 className="font-bold text-lg mb-2">実践的な問題</h4>
            <p className="text-gray-600">実務で使える知識を4択クイズ形式で出題。基礎から応用まで段階的に学習できます。</p>
          </div>
          <div className="border border-gray-200 rounded p-6">
            <h4 className="font-bold text-lg mb-2">幅広い技術カバー</h4>
            <p className="text-gray-600">HTML/CSSの基礎からReact、Node.jsまで、モダンなウェブ開発に必要な技術を網羅。</p>
          </div>
          <div className="border border-gray-200 rounded p-6">
            <h4 className="font-bold text-lg mb-2">完全無料</h4>
            <p className="text-gray-600">すべての問題を無料で利用可能。会員登録なしでも学習を始められます。</p>
          </div>
        </div>
      </section>

      {/* 学習カテゴリ */}
      <section id="categories" className="mb-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">学習カテゴリ</h3>
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* HTML/CSS */}
          <div className="border border-gray-200 rounded p-6 hover:border-gray-400 transition">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-xl font-bold text-gray-900">HTML/CSS</h4>
              <span className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded">準備中</span>
            </div>
            <p className="text-gray-600 mb-4">
              ウェブページの構造を作るHTMLと、デザインを制御するCSSの基礎から実践的なテクニックまで学習できます。セマンティックHTML、Flexbox、Grid、レスポンシブデザインなどを問題形式で習得。
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• HTMLタグの使い分け</li>
              <li>• CSSセレクタとプロパティ</li>
              <li>• レイアウト手法（Flexbox/Grid）</li>
            </ul>
          </div>

          {/* JavaScript */}
          <div className="border border-gray-200 rounded p-6 hover:border-gray-400 transition">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-xl font-bold text-gray-900">JavaScript</h4>
              <span className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded">準備中</span>
            </div>
            <p className="text-gray-600 mb-4">
              ウェブサイトに動きをつけるJavaScriptの基本文法から、非同期処理、DOM操作、ES6+の新機能まで幅広くカバー。実務で必要な知識を体系的に学習できます。
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• 変数、関数、オブジェクト</li>
              <li>• Promise、async/await</li>
              <li>• DOM操作とイベント処理</li>
            </ul>
          </div>

          {/* React */}
          <Link href="/quiz/react-basic">
            <div className="border border-blue-300 rounded p-6 bg-blue-50 hover:border-blue-500 transition cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-bold text-gray-900">React</h4>
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded">問題数: 20</span>
              </div>
              <p className="text-gray-600 mb-4">
                モダンなフロントエンド開発に欠かせないReactライブラリ。コンポーネント設計、Hooks、状態管理など、実践的な問題で理解を深められます。初学者にもわかりやすい解説付き。
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• コンポーネントとProps</li>
                <li>• useState、useEffect等のHooks</li>
                <li>• イベントハンドリングと状態管理</li>
              </ul>
            </div>
          </Link>

          {/* Node.js */}
          <div className="border border-gray-200 rounded p-6 hover:border-gray-400 transition">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-xl font-bold text-gray-900">Node.js</h4>
              <span className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded">準備中</span>
            </div>
            <p className="text-gray-600 mb-4">
              サーバーサイドJavaScriptの実行環境Node.js。Express.jsを使ったAPI開発、ファイル操作、モジュールシステムなど、バックエンド開発の基礎を問題で習得できます。
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Node.jsの基本とモジュール</li>
              <li>• Express.jsでのAPI開発</li>
              <li>• 非同期処理とストリーム</li>
            </ul>
          </div>

        </div>
      </section>

      {/* お知らせ */}
      <section id="news">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">お知らせ</h3>
        <div className="border border-gray-200 rounded p-6 space-y-3">
          <div className="pb-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">2026/02/08</p>
            <p className="text-gray-900">Reactクイズ20問を公開しました</p>
          </div>
          <div className="pb-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">2026/02/08</p>
            <p className="text-gray-900">ウェブエンジニア問題集を開設しました</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">今後の予定</p>
            <p className="text-gray-900">HTML/CSS、JavaScript、Node.jsのクイズを順次追加予定です</p>
          </div>
        </div>
      </section>

      {/* 学習のすすめ方 */}
      <section className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">学習のすすめ方</h3>
        <div className="bg-gray-50 border border-gray-200 rounded p-6">
          <ol className="space-y-4">
            <li className="flex">
              <span className="font-bold text-blue-600 mr-3">1.</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">基礎から始める</p>
                <p className="text-gray-600">HTML/CSSの基礎を固めてから、JavaScriptに進むことをおすすめします。</p>
              </div>
            </li>
            <li className="flex">
              <span className="font-bold text-blue-600 mr-3">2.</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">繰り返し解く</p>
                <p className="text-gray-600">間違えた問題は復習し、理解が定着するまで何度も解き直しましょう。</p>
              </div>
            </li>
            <li className="flex">
              <span className="font-bold text-blue-600 mr-3">3.</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">実際にコードを書く</p>
                <p className="text-gray-600">問題で学んだ知識は、実際に手を動かしてコードを書くことで定着します。</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}