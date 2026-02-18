import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowLeft, Megaphone, BookOpenCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizListClient from "./QuizListClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

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

/**
 * カテゴリ情報の取得
 */
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

/**
 * クイズ一覧の取得（検索条件対応）
 */
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

/**
 * このカテゴリに関連するタグ一覧のみを取得（バックエンドに追加したAPIを使用）
 */
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
    category.description ||
    `${category.category_name}に関するクイズ問題集です。`;

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    // layout側のサイト共通keywordsを上書き
    keywords: [category.category_name, "クイズ", "問題集", "ウェブ開発", "学習"],
  };
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

  // クイズ一覧とフィルタ用タグ一覧を並列で取得
  const [quizzes, tags] = await Promise.all([
    getQuizzes(category.id, q, tagSlug),
    getTagsByCategory(category.id),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <Button asChild variant="link" className="px-0 mb-4 -ml-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4 shrink-0" />
            トップページに戻る
          </Link>
        </Button>
        <section className="flex flex-col-reverse justify-center sm:flex-row sm:items-center gap-6">
          <div className="flex justify-center sm:justify-start">
            <Image
              src="/inpiration_man_color.png"
              alt="Quiz Image"
              width={588}
              height={761}
              className="w-full max-w-[160px] md:max-w-[200px] h-auto -scale-x-100"
            />
          </div>
          <div className="sm:flex-1 sm:max-w-xl">
            <div className="relative rounded-[44px] border-[3px] border-primary/55 bg-background/95 px-5 py-5 md:px-8 md:py-6 shadow-sm">
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-primary/55 bg-background/95 sm:hidden"
              />
              <span
                aria-hidden="true"
                className="absolute -left-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-b-[3px] border-l-[3px] border-primary/55 bg-background/95 sm:block"
              />
              <h1 className="text-2xl font-extrabold text-foreground mb-2 md:text-3xl inline-flex items-center gap-2">
                <BookOpenCheck className="size-6 shrink-0 text-primary" />
                {category.category_name} 問題集
              </h1>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* アラート（お知らせの強調） */}
      <div className="mb-8 md:mb-10">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&_div]:text-current max-w-md mx-auto">
          <AlertTitle className="font-semibold text-center inline-flex items-center justify-center gap-2">
            <Megaphone className="size-4 shrink-0" />
            順次機能追加中...
          </AlertTitle>
          <AlertDescription className="justify-center">
            解答履歴機能、ランダム連続解答機能を準備中です
          </AlertDescription>
        </Alert>
      </div>

      {/* UIとURL操作をClient Componentに委譲 */}
      <QuizListClient
        initialQuizzes={quizzes}
        tags={tags}
        categoryId={category.id}
        categorySlug={categorySlug}
        currentQuery={q}
        currentTagSlug={tagSlug}
      />
    </div>
  );
}