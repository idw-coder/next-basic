import { Metadata } from "next";
import RandomQuizClient from "./RandomQuizClient";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

interface Category {
  id: number;
  slug: string;
  category_name: string;
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

export const metadata: Metadata = {
  title: "ランダムクイズ | ウェブエンジニア問題集",
  description:
    "全カテゴリからランダムに出題。5問・10問など問題数を選んでチャレンジ！",
};

export default async function RandomQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; completed?: string }>;
}) {
  const { categoryId, completed } = await searchParams;
  const categories = await getCategories();

  const initialCategoryId = categoryId ? Number(categoryId) : undefined;
  const validCategoryId =
    initialCategoryId && categories.some((c) => c.id === initialCategoryId)
      ? initialCategoryId
      : undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <RandomQuizClient
        categories={categories}
        initialCategoryId={validCategoryId}
        isCompleted={completed === "1"}
      />
    </div>
  );
}
