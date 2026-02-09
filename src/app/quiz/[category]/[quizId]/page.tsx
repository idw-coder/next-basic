import QuizClient from './QuizClient';

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
  display_order?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

interface QuizDetail {
  id: number;
  slug: string;
  category_id: number;
  question: string;
  explanation?: string;
  choices: Choice[];
}

async function getQuiz(quizId: string): Promise<QuizDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/${quizId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return null;
  }
}

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ category: string; quizId: string }>;
}) {
  const { category, quizId } = await params;
  const quiz = await getQuiz(quizId);

  return (
    <QuizClient
      quiz={quiz}
      categorySlug={category}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; quizId: string }>;
}) {
  const { quizId } = await params;
  const quiz = await getQuiz(quizId);
  
  if (!quiz) {
    return {
      title: '問題が見つかりません | ウェブエンジニア問題集',
    };
  }

  return {
    title: `${quiz.question} | ウェブエンジニア問題集`,
    description: quiz.explanation?.slice(0, 150) || quiz.question,
  };
}