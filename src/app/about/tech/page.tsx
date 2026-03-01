import type { Metadata } from "next";
import Link from "next/link";
import {
  Server,
  Database,
  Globe,
  Shield,
  Code2,
  Layers,
  Github,
  ExternalLink,
  Construction,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MermaidDiagram from "@/components/MermaidDiagram";

export const metadata: Metadata = {
  title: "技術構成 | ウェブエンジニア問題集",
  description:
    "ウェブエンジニア問題集のシステム構成・使用技術・インフラ構成について紹介します。",
};

const ARCHITECTURE_CHART = `graph TD
  User[ユーザー ブラウザ] -->|HTTPS| Nginx
  Admin[管理者 ブラウザ] -->|HTTPS| Nginx
  Nginx -->|リバースプロキシ :3000| NextJS[Next.js SSR]
  Nginx -->|静的配信| ViteAdmin[React Vite 管理画面]
  Nginx -->|リバースプロキシ :8888| Backend[Express.js API]
  NextJS -->|Internal API| Backend
  ViteAdmin -->|REST API| Backend
  Backend -->|TypeORM| MySQL[(MySQL 8.4)]
  Backend -->|OAuth2| Google[Google OAuth]

  subgraph AWS Lightsail
    Nginx
    NextJS
    Backend
    MySQL
    ViteAdmin
  end`;

interface TechItem {
  name: string;
  description: string;
  badge?: string;
}

interface TechSection {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  color: string;
  bgColor: string;
  badgeBg: string;
  badgeText: string;
  items: TechItem[];
}

const TECH_SECTIONS: TechSection[] = [
  {
    icon: Globe,
    title: "フロントエンド",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    badgeBg: "bg-blue-100 dark:bg-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-300",
    items: [
      {
        name: "Next.js 15",
        description: "App Router・SSR/SSGでSEOとパフォーマンスを両立",
        badge: "React 19",
      },
      {
        name: "Tailwind CSS v4",
        description: "ユーティリティファーストでレスポンシブ・ダークモード対応",
      },
      {
        name: "shadcn/ui",
        description: "Radix UIベースのアクセシブルなUIコンポーネント",
      },
      {
        name: "React Vite（管理画面）",
        description: "管理者向けダッシュボードをViteで高速開発",
      },
    ],
  },
  {
    icon: Server,
    title: "バックエンド",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    badgeBg: "bg-green-100 dark:bg-green-500/20",
    badgeText: "text-green-700 dark:text-green-300",
    items: [
      {
        name: "Express.js",
        description: "REST APIサーバー。クイズ・ユーザー管理のエンドポイントを提供",
        badge: "TypeScript",
      },
      {
        name: "TypeORM",
        description: "TypeScript対応のORMでデータベースを型安全に操作",
      },
      {
        name: "JWT認証",
        description: "アクセストークン・リフレッシュトークンによるステートレス認証",
      },
    ],
  },
  {
    icon: Database,
    title: "データベース",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    badgeBg: "bg-amber-100 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-300",
    items: [
      {
        name: "MySQL 8.4",
        description: "クイズデータ・ユーザー情報・学習履歴を格納",
        badge: "LTS",
      },
    ],
  },
  {
    icon: Shield,
    title: "認証・セキュリティ",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    badgeBg: "bg-red-100 dark:bg-red-500/20",
    badgeText: "text-red-700 dark:text-red-300",
    items: [
      {
        name: "Google OAuth 2.0",
        description: "Googleアカウントでのソーシャルログインに対応",
      },
      {
        name: "Nginx + Let's Encrypt",
        description: "HTTPS化・リバースプロキシ・静的配信を1台で完結",
      },
    ],
  },
  {
    icon: Layers,
    title: "インフラ・デプロイ",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    badgeBg: "bg-purple-100 dark:bg-purple-500/20",
    badgeText: "text-purple-700 dark:text-purple-300",
    items: [
      {
        name: "AWS Lightsail",
        description: "低コストなVPSで全サービスを1インスタンスにホスティング",
      },
      {
        name: "GitHub Actions",
        description: "mainブランチへのpushで自動デプロイ（CI/CD）",
        badge: "CI/CD",
      },
    ],
  },
  {
    icon: Code2,
    title: "開発ツール",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-500/10",
    badgeBg: "bg-teal-100 dark:bg-teal-500/20",
    badgeText: "text-teal-700 dark:text-teal-300",
    items: [
      {
        name: "TypeScript",
        description: "フロントエンド・バックエンド全体を型安全に開発",
      },
      {
        name: "ESLint + Prettier",
        description: "コード品質とフォーマットを自動チェック",
      },
    ],
  },
];

export default function TechPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      {/* 改善中バナー */}
      <div className="mb-8 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-center gap-3">
        <Construction className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          このページは現在改善中です。内容やデザインは今後変更される場合があります。
        </p>
      </div>

      {/* ページヘッダー */}
      <section className="mb-12 md:mb-16 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4 md:text-4xl">
          技術構成
        </h1>
        <p className="text-base text-muted-foreground md:text-lg max-w-2xl mx-auto leading-relaxed">
          ウェブエンジニア問題集を支える技術スタックとシステム構成を紹介します。
        </p>
      </section>

      {/* セクション1: システム構成図 */}
      <section className="mb-12 md:mb-16">
        <h2 className="text-xl font-bold mb-6 md:text-2xl text-center text-foreground">
          <Server className="size-5 inline-block mr-2 -mt-0.5 text-primary" />
          システム構成図
        </h2>
        <MermaidDiagram chart={ARCHITECTURE_CHART} id="architecture-diagram" />
        <p className="text-xs text-muted-foreground text-center mt-3">
          Nginx をリバースプロキシとして、Next.js（SSR）・Express.js
          API・管理画面を統合的に配信しています。
        </p>
      </section>

      {/* セクション2: 技術スタック */}
      <section className="mb-12 md:mb-16">
        <h2 className="text-xl font-bold mb-6 md:mb-8 md:text-2xl text-center text-foreground">
          <Code2 className="size-5 inline-block mr-2 -mt-0.5 text-primary" />
          使用技術
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_SECTIONS.map((section) => (
            <Card
              key={section.title}
              className={`${section.bgColor} border-none`}
            >
              <CardHeader className="pb-3">
                <CardTitle
                  className={`${section.color} text-base flex items-center gap-2`}
                >
                  <section.icon className="size-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        {item.name}
                      </span>
                      {item.badge && (
                        <Badge
                          className={`${section.badgeBg} ${section.badgeText} text-[10px] px-1.5 py-0`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* セクション3: GitHub */}
      <section className="mb-8">
        <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 text-center">
          <Github className="size-10 mx-auto mb-4 text-foreground" />
          <h2 className="text-xl font-bold mb-2 text-foreground md:text-2xl">
            ソースコード
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
            このプロジェクトのソースコードはGitHubで公開しています。
            フィードバックやコントリビューションを歓迎します。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button className="rounded-full px-6" asChild>
              <Link
                href="https://github.com/idw-coder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold"
              >
                <Github className="size-4" />
                GitHub プロフィール
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full px-6" asChild>
              <Link
                href="https://github.com/idw-coder/express-mysql-docker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold"
              >
                リポジトリを見る
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
