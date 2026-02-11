import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizListClient from "./QuizListClient";

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

  return {
    title: `${category.category_name} 問題集 | ウェブエンジニア問題集`,
    description: category.description,
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
            <h1 className="text-2xl font-bold text-foreground mb-2 md:text-3xl">
              {category.category_name} 問題集
            </h1>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
          </div>
        </section>
      </div>

      {/* UIとURL操作をClient Componentに委譲 */}
      <QuizListClient
        initialQuizzes={quizzes}
        tags={tags}
        categorySlug={categorySlug}
        currentQuery={q}
        currentTagSlug={tagSlug}
      />
    </div>
  );
}