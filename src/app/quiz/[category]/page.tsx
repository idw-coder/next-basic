import Link from 'next/link';
import { Metadata } from 'next';

// サーバーサイド(SSR)なら内部URL、なければ公開URL、最後はローカル開発用
const API_BASE_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

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
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const categories: Category[] = await res.json();
    return categories.find(c => c.slug === categorySlug) || null;
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return null;
  }
}

async function getQuizzes(categoryId: number): Promise<Quiz[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/category/${categoryId}/quizzes`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
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
      title: 'カテゴリが見つかりません | ウェブエンジニア問題集',
    };
  }

  const quizzes = await getQuizzes(category.id);

  return {
    title: `${category.category_name} 問題集（全${quizzes.length}問） | ウェブエンジニア問題集`,
    description: category.description || `${category.category_name}に関する問題を${quizzes.length}問掲載。4択クイズ形式で実践的なスキルを習得できます。初学者から実務経験者まで、無料で学習できる問題集です。`,
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">カテゴリが見つかりません</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          トップページに戻る
        </Link>
      </div>
    );
  }

  const quizzes = await getQuizzes(category.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← トップページに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.category_name} 問題集</h1>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-6">
          <p className="text-yellow-800">現在、この カテゴリには問題がありません。</p>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-6">全 {quizzes.length} 問</p>
          <div className="space-y-4">
            {quizzes.map((quiz, index) => (
              <Link
                key={quiz.id}
                href={`/quiz/${categorySlug}/${quiz.id}`}
                className="block border border-gray-200 rounded p-6 hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      問題 {index + 1}
                    </h3>
                    <p className="text-gray-700">{quiz.question}</p>
                  </div>
                  <div className="flex-shrink-0 text-blue-600">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}