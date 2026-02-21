import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowLeft, BookOpenCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizListClient from "./QuizListClient";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://web-mondai.com";

export interface Tag {
  id: number;
  slug: string;
  name: string;
}

export interface Quiz {
  id: number;
  slug: string;
  question: string;
  tags: Tag[];
}

interface Category {
  id: number;
  slug: string;
  category_name: string;
  description?: string;
}

async function getCategory(categorySlug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const categories: Category[] = await res.json();
    return categories.find((c) => c.slug === categorySlug) || null;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

async function getQuizzes(
  categoryId: number,
  q?: string,
  tagSlug?: string
): Promise<Quiz[]> {
  try {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (tagSlug) params.append("tagSlug", tagSlug);

    const res = await fetch(
      `${API_BASE_URL}/api/quiz/category/${categoryId}/quizzes?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return [];
  }
}

async function getTagsByCategory(categoryId: number): Promise<Tag[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/quiz/category/${categoryId}/tags`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategory(categorySlug);

  if (!category) {
    return { title: "カテゴリが見つかりません" };
  }

  const title = `${category.category_name} 問題集 | ウェブエンジニア問題集`;
  const description =
    category.description
      ? `${category.category_name}の問題集。${category.description} 無料で学べる4択クイズ形式。`
      : `${category.category_name}に関する4択クイズ問題集。基礎から実践まで無料で学べます。`;

  return {
    title,
    description,
    alternates: {
      canonical: `/quiz/${categorySlug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ja_JP",
      url: `${SITE_URL}/quiz/${categorySlug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    keywords: [
      category.category_name,
      `${category.category_name} クイズ`,
      `${category.category_name} 問題`,
      "ウェブ開発",
      "学習",
      "無料",
    ],
  };
}

function buildJsonLd(category: Category, quizzes: Quiz[], categorySlug: string) {
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
        name: `${category.category_name} 問題集`,
        item: `${SITE_URL}/quiz/${categorySlug}`,
      },
    ],
  };

  const quizPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.category_name} 問題集`,
    description: category.description || `${category.category_name}に関するクイズ問題集`,
    url: `${SITE_URL}/quiz/${categorySlug}`,
    numberOfItems: quizzes.length,
    isPartOf: {
      "@type": "WebSite",
      name: "ウェブエンジニア問題集",
      url: SITE_URL,
    },
  };

  return [breadcrumb, quizPage];
}

export default async function CategoryQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ q?: string; tagSlug?: string }>;
}) {
  const { category: categorySlug } = await params;
  const { q, tagSlug } = await searchParams;

  const category = await getCategory(categorySlug);

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>カテゴリが見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link href="/" className="inline-flex items-center gap-2">
                <ArrowLeft className="size-4 shrink-0" />
                トップページに戻る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [quizzes, tags] = await Promise.all([
    getQuizzes(category.id, q, tagSlug),
    getTagsByCategory(category.id),
  ]);

  const jsonLdList = buildJsonLd(category, quizzes, categorySlug);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* 構造化データ */}
      {jsonLdList.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}

      {/* パンくずリスト */}
      <nav aria-label="パンくずリスト" className="mb-6 text-sm">
        <ol className="flex items-center gap-1 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">ホーム</Link>
          </li>
          <li><ChevronRight className="size-3.5" /></li>
          <li className="text-foreground font-medium">{category.category_name} 問題集</li>
        </ol>
      </nav>

      {/* ヘッダー */}
      <section className="mb-10">
        <div className="flex flex-col-reverse justify-center sm:flex-row sm:items-center gap-6">
          <div className="flex justify-center sm:justify-start">
            <Image
              src="/inpiration_man_color.png"
              alt=""
              width={588}
              height={761}
              className="w-full max-w-[120px] md:max-w-[160px] h-auto -scale-x-100"
            />
          </div>
          <div className="sm:flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2 md:text-3xl flex items-center gap-2">
              <BookOpenCheck className="size-6 shrink-0 text-primary" />
              {category.category_name} 問題集
            </h1>
            {category.description && (
              <p className="text-muted-foreground leading-relaxed">{category.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              全 <span className="font-semibold text-foreground">{quizzes.length}</span> 問
              {tags.length > 0 && ` ・ ${tags.length} タグ`}
            </p>
          </div>
        </div>
      </section>

      {/* 問題一覧 */}
      <section>
        <h2 className="sr-only">{category.category_name}の問題一覧</h2>
        <QuizListClient
          initialQuizzes={quizzes}
          tags={tags}
          categoryId={category.id}
          categorySlug={categorySlug}
          currentQuery={q}
          currentTagSlug={tagSlug}
        />
      </section>
    </div>
  );
}
