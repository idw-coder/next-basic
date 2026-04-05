import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight, Search } from "lucide-react";
import SearchClient from "./SearchClient";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://web-mondai.com";

interface Category {
  id: number;
  slug: string;
  category_name: string;
}

interface Tag {
  id: number;
  slug: string;
  name: string;
}

export interface SearchQuiz {
  id: number;
  slug: string;
  question: string;
  tags: Tag[];
  categoryId: number;
  categorySlug: string;
  categoryName: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function searchAllQuizzes(
  categories: Category[],
  q: string
): Promise<SearchQuiz[]> {
  if (!q.trim()) return [];

  const results = await Promise.all(
    categories.map(async (cat) => {
      try {
        const params = new URLSearchParams({ q });
        const res = await fetch(
          `${API_BASE_URL}/api/quiz/category/${cat.id}/quizzes?${params.toString()}`,
          { cache: "no-store" }
        );
        if (!res.ok) return [];
        const quizzes: { id: number; slug: string; question: string; tags: Tag[] }[] =
          await res.json();
        return quizzes.map((quiz) => ({
          ...quiz,
          categoryId: cat.id,
          categorySlug: cat.slug,
          categoryName: cat.category_name,
        }));
      } catch {
        return [];
      }
    })
  );

  return results.flat();
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;

  const title = q
    ? `「${q}」の検索結果 | ウェブエンジニア問題集`
    : "問題検索 | ウェブエンジニア問題集";
  const description = q
    ? `「${q}」に関連するウェブ開発クイズの検索結果。4択クイズ形式で無料学習できます。`
    : "キーワードで問題を横断検索。HTML、CSS、JavaScript、React など全カテゴリから一括で探せます。";

  return {
    title,
    description,
    alternates: {
      canonical: "/quiz/search",
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ja_JP",
      url: `${SITE_URL}/quiz/search`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function buildJsonLd(q?: string, resultCount?: number) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "問題検索",
        item: `${SITE_URL}/quiz/search`,
      },
    ],
  };

  const searchAction = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: q ? `「${q}」の検索結果` : "問題検索",
    description: "ウェブエンジニア問題集の横断検索",
    url: `${SITE_URL}/quiz/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    ...(resultCount !== undefined && { numberOfItems: resultCount }),
    isPartOf: {
      "@type": "WebSite",
      name: "ウェブエンジニア問題集",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/quiz/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  };

  return [breadcrumb, searchAction];
}

const SUGGESTED_KEYWORDS = [
  "Promise",
  "Flexbox",
  "Hooks",
  "async",
  "セレクタ",
  "DOM",
  "S3",
  "rebase",
  "XSS",
  "ジェネリクス",
  "Docker",
  "リバースプロキシ",
  "Hydration",
  "Server Actions",
  "chmod",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const categories = await getCategories();
  const results = q ? await searchAllQuizzes(categories, q) : [];
  const jsonLdList = buildJsonLd(q, q ? results.length : undefined);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {jsonLdList.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}

      {/* パンくず */}
      <nav aria-label="パンくずリスト" className="mb-6 text-sm">
        <ol className="flex items-center gap-1 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="text-foreground font-medium">問題検索</li>
        </ol>
      </nav>

      {/* ヘッダー */}
      <section className="mb-10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Search className="size-7 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2 md:text-3xl">
            問題を検索
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            全{categories.length}カテゴリからキーワードで横断検索できます
          </p>
        </div>
      </section>

      <SearchClient
        initialResults={results}
        categories={categories}
        currentQuery={q || ""}
        suggestedKeywords={SUGGESTED_KEYWORDS}
      />
    </div>
  );
}
