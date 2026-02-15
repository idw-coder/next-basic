import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizInteraction from "./QuizInteraction";

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
  display_order?: number;
}

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

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
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return null;
  }
}

/**
 * BlockNote形式のJSONかどうかを簡易判定
 */
function isBlockNoteFormat(explanation: string): boolean {
  const trimmed = explanation.trim();
  if (!trimmed.startsWith("[")) return false;
  try {
    const parsed = JSON.parse(explanation);
    if (!Array.isArray(parsed)) return false;
    return parsed.every(
      (b) =>
        b !== null &&
        typeof b === "object" &&
        "type" in b &&
        typeof b.type === "string"
    );
  } catch {
    return false;
  }
}

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ category: string; quizId: string }>;
}) {
  const { category, quizId } = await params;
  const quiz = await getQuiz(quizId);

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>問題が見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link
                href={`/quiz/${category}`}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="size-4 shrink-0" />
                問題一覧に戻る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Button asChild variant="link" className="px-0 -ml-2">
          <Link
            href={`/quiz/${category}`}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="size-4 shrink-0" />
            問題一覧に戻る
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-md sm:text-lg">{quiz.question}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* インタラクション部分をClient Componentに委譲 */}
          <QuizInteraction quiz={quiz} categorySlug={category}>
            {/* プレーンテキストの解説のみSSRで出力（SEO対策） */}
            {quiz.explanation && !isBlockNoteFormat(quiz.explanation) && (
              <div className="text-muted-foreground whitespace-pre-wrap">
                {quiz.explanation}
              </div>
            )}
          </QuizInteraction>
        </CardContent>
      </Card>
    </div>
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
      title: "問題が見つかりません | ウェブエンジニア問題集",
    };
  }

  return {
    title: `${quiz.question} | ウェブエンジニア問題集`,
    description: quiz.explanation?.slice(0, 150) || quiz.question,
  };
}