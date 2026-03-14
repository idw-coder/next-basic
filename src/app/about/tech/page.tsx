import type { Metadata } from "next";
import Link from "next/link";
import MermaidDiagram from "@/components/MermaidDiagram";
import { EntryGuard } from "@/components/EntryGuard";

export const metadata: Metadata = {
  title: "技術構成 | ウェブエンジニア問題集",
  description:
    "ウェブエンジニア問題集のシステム構成・使用技術・インフラ構成について紹介します。",
};

const ARCHITECTURE_CHART = `graph TD
  User[ユーザー ブラウザ] -->|HTTPS| Nginx
  Admin[管理者 ブラウザ] -->|HTTPS| Nginx
  Nginx -->|リバースプロキシ :3000| NextJS[Next.js SSR]
  Nginx -->|静的配信| VueAdmin[Vue 3 管理画面]
  Nginx -->|リバースプロキシ :8888| Backend[Express.js API]
  NextJS -->|Internal API| Backend
  VueAdmin -->|REST API| Backend
  Backend -->|TypeORM| MySQL[(MySQL 8.4)]
  Backend -->|OAuth2| Google[Google OAuth]

  subgraph Docker / GHCR
    Nginx
    NextJS
    Backend
    MySQL
    VueAdmin
  end`;

const techStack = [
  {
    category: "フロントエンド",
    items: [
      { name: "Next.js 15 (React 19)", note: "App Router / SSR / SSG" },
      { name: "Tailwind CSS v4", note: "ユーティリティファースト" },
      { name: "shadcn/ui", note: "Radix UI ベースのコンポーネント" },
      {
        name: "Vue 3 + Vuetify（管理画面）、Vuex（状態管理）",
        note: "管理ダッシュボード",
        wip: true,
      },
    ],
  },
  {
    category: "バックエンド",
    items: [
      { name: "Express.js (TypeScript)", note: "REST API サーバー" },
      { name: "TypeORM", note: "型安全な ORM" },
      { name: "JWT", note: "アクセストークン / リフレッシュトークン" },
    ],
  },
  {
    category: "データベース",
    items: [{ name: "MySQL 8.4 LTS", note: "クイズ・ユーザー・学習履歴" }],
  },
  {
    category: "認証・セキュリティ",
    items: [
      { name: "Google OAuth 2.0", note: "ソーシャルログイン" },
      { name: "Nginx + Let's Encrypt", note: "HTTPS / リバースプロキシ" },
    ],
  },
  {
    category: "インフラ",
    items: [
      {
        name: "Docker / GHCR",
        note: "コンテナイメージで構成",
        wip: true,
      },
      { name: "GitHub Actions", note: "CI/CD 自動デプロイ" },
    ],
  },
  {
    category: "開発ツール",
    items: [
      { name: "TypeScript", note: "フロント・バックエンド共通" },
      { name: "ESLint + Prettier", note: "Lint / フォーマット" },
    ],
  },
];

export default function TechPage() {
  return (
    <EntryGuard>
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        このページは現在改善中です。内容やデザインは今後変更される場合があります。
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-1">技術構成</h1>
      <p className="text-sm text-muted-foreground mb-10">
        ウェブエンジニア問題集を支える技術スタックとシステム構成
      </p>

      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
          システム構成図
        </h2>
        <MermaidDiagram chart={ARCHITECTURE_CHART} id="architecture-diagram" />
        <p className="text-xs text-muted-foreground mt-3">
          Nginx
          をリバースプロキシとして、Next.js・Express.js&nbsp;API・管理画面を統合配信
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-6 border-b pb-2">使用技術</h2>
        <div className="space-y-8">
          {techStack.map((section) => (
            <div key={section.category}>
              <h3 className="mb-2">
                <span className="text-sm bg-gray-100 px-4 p-2 rounded-xl font-semibold tracking-wide">{section.category}</span>
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {section.items.map((item) => (
                    <tr
                      key={item.name}
                      className="border-b border-border/40 text-xs last:border-b-0"
                    >
                      <td className="py-2 pr-4 w-[240px] font-medium text-[12px] whitespace-nowrap align-top">
                        {item.name}
                        {item.wip && (
                          <span className="ml-2 text-[11px] text-amber-600 font-normal">
                            移行中
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {item.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
          ソースコード
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          GitHub でソースコードを公開しています。
        </p>
        <div className="flex gap-6 text-sm">
          <Link
            href="https://github.com/idw-coder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            プロフィール ↗
          </Link>
          <Link
            href="https://github.com/idw-coder/express-mysql-docker"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            リポジトリ ↗
          </Link>
        </div>
      </section>
    </div>
    </EntryGuard>
  );
}
