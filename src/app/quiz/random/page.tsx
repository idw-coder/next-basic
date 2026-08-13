import { Metadata } from "next";
import RandomQuizClient from "./RandomQuizClient";
import { getQuizCategories } from "@/lib/server/quizCategories";

interface Category {
  id: number;
  slug: string;
  category_name: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const { categories } = await getQuizCategories();
    return categories;
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "ランダムクイズ | ウェブエンジニア問題集",
  description:
    "全カテゴリからランダムに出題。5問・10問など問題数を選んでチャレンジ！",
};

export default async function RandomQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; categoryId?: string; completed?: string }>;
}) {
  const { category, categoryId, completed } = await searchParams;
  const categories = await getCategories();

  const matchedCategory = category
    ? categories.find((c) => c.slug === category)
    : categoryId
      ? categories.find((c) => String(c.id) === categoryId)
      : undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 md:py-4">
      <RandomQuizClient
        key={matchedCategory?.slug ?? "all"}
        categories={categories}
        initialCategorySlug={matchedCategory?.slug}
        isCompleted={completed === "1"}
      />
    </div>
  );
}
