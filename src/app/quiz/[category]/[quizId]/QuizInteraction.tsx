"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuizHistory } from "@/hooks/useQuizHistory";
import {
  getRandomSession,
  saveRandomSession,
  clearRandomSession,
  type RandomQuizSession,
} from "@/lib/randomQuizSession";
import ExplanationView from "./ExplanationView";

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

interface QuizInteractionProps {
  quiz: QuizDetail;
  categorySlug: string;
  children?: React.ReactNode;
}

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

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizInteraction({
  quiz,
  categorySlug,
  children,
}: QuizInteractionProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [randomSession, setRandomSession] =
    useState<RandomQuizSession | null>(null);
  const { addAnswer } = useQuizHistory();
  const router = useRouter();

  useEffect(() => {
    const session = getRandomSession();
    if (session) {
      const current = session.quizzes[session.currentIndex];
      if (current && current.id === quiz.id) {
        setRandomSession(session);
      }
    }
  }, [quiz.id]);

  const shuffledChoices = useMemo(
    () => shuffleArray(quiz.choices),
    [quiz.choices],
  );

  const correctChoice = quiz.choices.find((c) => c.is_correct);
  const isCorrect =
    selectedChoice !== null &&
    quiz.choices.find((c) => c.id === selectedChoice)?.is_correct;

  const handleAnswer = () => {
    if (selectedChoice === null) return;
    setIsAnswered(true);
    const correct =
      quiz.choices.find((c) => c.id === selectedChoice)?.is_correct ?? false;
    addAnswer(quiz.id, quiz.category_id, correct);

    if (randomSession) {
      const updated: RandomQuizSession = {
        ...randomSession,
        answers: [
          ...randomSession.answers,
          { quizId: quiz.id, isCorrect: correct },
        ],
      };
      saveRandomSession(updated);
      setRandomSession(updated);
    }
  };

  const handleNextRandomQuiz = () => {
    if (!randomSession) return;
    const nextIndex = randomSession.currentIndex + 1;

    if (nextIndex >= randomSession.quizzes.length) {
      router.push("/quiz/random?completed=1");
    } else {
      const updated = { ...randomSession, currentIndex: nextIndex };
      saveRandomSession(updated);
      const next = updated.quizzes[nextIndex];
      router.push(`/quiz/${next.categorySlug}/${next.id}`);
    }
  };

  const handleExitRandom = () => {
    clearRandomSession();
    setRandomSession(null);
  };

  const isLastRandomQuiz = randomSession
    ? randomSession.currentIndex + 1 >= randomSession.quizzes.length
    : false;

  const randomProgress = randomSession
    ? ((randomSession.currentIndex + (isAnswered ? 1 : 0)) /
        randomSession.quizzes.length) *
      100
    : 0;

  const hasBlockNoteExplanation =
    quiz.explanation && isBlockNoteFormat(quiz.explanation);

  return (
    <div className="space-y-6">
      {/* ランダムクイズ進捗バー */}
      {randomSession && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              ランダムクイズ{" "}
              <span className="font-bold text-foreground text-lg">
                {randomSession.currentIndex + 1}
              </span>
              <span className="mx-1">/</span>
              <span>{randomSession.quizzes.length}</span>
            </span>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {Math.round(randomProgress)}%
              </Badge>
              <button
                type="button"
                onClick={handleExitRandom}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                終了する
              </button>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${randomProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 選択肢 */}
      <div className="space-y-3">
        {shuffledChoices.map((choice) => {
          const isSelected = selectedChoice === choice.id;
          const showCorrect = isAnswered && choice.is_correct;
          const showWrong = isAnswered && isSelected && !choice.is_correct;

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => !isAnswered && setSelectedChoice(choice.id)}
              disabled={isAnswered}
              className={cn(
                "w-full text-left p-2 sm:p-4 rounded-lg border-2 transition-colors",
                isAnswered && "cursor-not-allowed",
                !isAnswered && "cursor-pointer hover:border-primary/50",
                isSelected && !isAnswered && "border-primary bg-primary/10",
                showCorrect &&
                  "border-green-500 bg-green-500/10 dark:bg-green-500/20",
                showWrong &&
                  "border-destructive bg-destructive/10 dark:bg-destructive/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-4 sm:size-6 shrink-0 rounded-full border-2 flex items-center justify-center",
                    isSelected && !isAnswered && "border-primary bg-primary",
                    showCorrect && "border-green-500 bg-green-500",
                    showWrong && "border-destructive bg-destructive",
                    !isSelected &&
                      !showCorrect &&
                      !showWrong &&
                      "border-muted-foreground/40"
                  )}
                >
                  {(isSelected || showCorrect || showWrong) && (
                    <span className="text-white text-xs sm:text-sm">✓</span>
                  )}
                </div>
                <span className="text-foreground text-xs sm:text-base">
                  {choice.choice_text}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!isAnswered ? (
        <Button
          onClick={handleAnswer}
          disabled={selectedChoice === null}
          className="w-full"
          size="lg"
        >
          回答する
        </Button>
      ) : (
        <div className="space-y-4">
          <Alert
            variant={isCorrect ? "default" : "destructive"}
            className={cn(
              "mb-6",
              isCorrect &&
                "border-green-500 bg-green-500/10 text-green-800 dark:text-green-200 [&_div]:text-current"
            )}
          >
            <AlertTitle className="font-bold text-center">
              {isCorrect ? "正解です" : "不正解です"}
            </AlertTitle>
            {!isCorrect && correctChoice && (
              <AlertDescription>
                正解: {correctChoice.choice_text}
              </AlertDescription>
            )}
          </Alert>

          {quiz.explanation && (
            <div className="">
              <div className="font-bold text-center mb-2">解説</div>
              {hasBlockNoteExplanation ? (
                <ExplanationView explanation={quiz.explanation} />
              ) : (
                children
              )}
            </div>
          )}

          {/* ナビゲーション: ランダムモード or 通常モード */}
          {randomSession ? (
            <Button
              onClick={handleNextRandomQuiz}
              className="w-full"
              size="lg"
            >
              {isLastRandomQuiz ? (
                <>
                  結果を見る
                  <Trophy className="size-4 ml-2" />
                </>
              ) : (
                <>
                  次の問題へ
                  <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              asChild
              className="w-full"
              variant="secondary"
              size="lg"
            >
              <Link
                href={`/quiz/${categorySlug}`}
                className="inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft className="size-4 shrink-0" />
                問題一覧に戻る
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
