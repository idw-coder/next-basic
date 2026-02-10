import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

interface Quiz {
  id: number;
  slug: string;
  question: string;
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

async function getQuizzes(categoryId: number): Promise<Quiz[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/quiz/category/${categoryId}/quizzes`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
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
    return {
      title: "カテゴリが見つかりません | ウェブエンジニア問題集",
    };
  }

  const quizzes = await getQuizzes(category.id);

  return {
    title: `${category.category_name} 問題集（全${quizzes.length}問） | ウェブエンジニア問題集`,
    description:
      category.description ||
      `${category.category_name}に関する問題を${quizzes.length}問掲載。4択クイズ形式で実践的なスキルを習得できます。`,
  };
}

export default async function CategoryQuizPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
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

  const quizzes = await getQuizzes(category.id);

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
              alt="クイズにチャレンジするイメージイラスト"
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

      {quizzes.length === 0 ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&_div]:text-current">
          <AlertDescription>
            現在、このカテゴリには問題がありません。
          </AlertDescription>
        </Alert>
      ) : (
        <div>
          <p className="text-muted-foreground mb-6">
            全 <Badge variant="secondary">{quizzes.length}</Badge> 問
          </p>
          <div className="space-y-4">
            {quizzes.map((quiz, index) => (
              <Link
                key={quiz.id}
                href={`/quiz/${categorySlug}/${quiz.id}`}
                className="block"
              >
                <Card className="transition-colors hover:border-primary/50 hover:bg-primary/5">
                  <CardContent className="flex items-center gap-4">
                    <Badge
                      variant="default"
                      className="size-8 shrink-0 rounded-lg p-0 flex items-center justify-center text-base font-bold"
                    >
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground">{quiz.question}</p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-primary" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
