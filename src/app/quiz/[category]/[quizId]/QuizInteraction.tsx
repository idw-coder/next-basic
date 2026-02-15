"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  children?: React.ReactNode; // SSRで渡されたプレーンテキスト解説
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

/**
 * 配列をシャッフル（Fisher-Yatesアルゴリズム）
 */
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

  // 選択肢をシャッフル（コンポーネントマウント時に1回だけ）
  const shuffledChoices = useMemo(() => shuffleArray(quiz.choices), [quiz.choices]);

  const handleAnswer = () => {
    if (selectedChoice !== null) setIsAnswered(true);
  };

  const correctChoice = quiz.choices.find((c) => c.is_correct);
  const isCorrect =
    selectedChoice !== null &&
    quiz.choices.find((c) => c.id === selectedChoice)?.is_correct;

  // BlockNote形式かどうか判定
  const hasBlockNoteExplanation =
    quiz.explanation && isBlockNoteFormat(quiz.explanation);

  return (
    <div className="space-y-6">
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

          {/* 解説表示 */}
          {quiz.explanation && (
            <div className="">
              <div className="font-bold text-center mb-2">解説</div>
              {hasBlockNoteExplanation ? (
                // BlockNote形式 → ExplanationViewを使用（装飾保持）
                <ExplanationView explanation={quiz.explanation} />
              ) : (
                // プレーンテキスト → SSRで渡されたchildrenを表示
                children
              )}
            </div>
          )}

          <Button asChild className="w-full" variant="secondary" size="lg">
            <Link
              href={`/quiz/${categorySlug}`}
              className="inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="size-4 shrink-0" />
              問題一覧に戻る
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}