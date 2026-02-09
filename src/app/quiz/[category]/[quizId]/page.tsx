import QuizClient from './QuizClient';

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
  display_order?: number;
}

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
    const res = await fetch(`http://localhost:8888/api/quiz/${quizId}`, {
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
  params: { category: string; quizId: string };
}) {
  const quiz = await getQuiz(params.quizId);

  return (
    <QuizClient 
      quiz={quiz} 
      categorySlug={params.category} 
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; quizId: string };
}) {
  const quiz = await getQuiz(params.quizId);
  
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