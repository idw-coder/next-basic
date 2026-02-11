"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function QuizClient({
  quiz,
  categorySlug,
}: {
  quiz: QuizDetail | null;
  categorySlug: string;
}) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = () => {
    if (selectedChoice !== null) setIsAnswered(true);
  };

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>問題が見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link href={`/quiz/${categorySlug}`} className="inline-flex items-center gap-2">
                <ArrowLeft className="size-4 shrink-0" />
                問題一覧に戻る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctChoice = quiz.choices.find((c) => c.is_correct);
  const isCorrect =
    selectedChoice !== null &&
    quiz.choices.find((c) => c.id === selectedChoice)?.is_correct;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Button asChild variant="link" className="px-0 -ml-2">
          <Link href={`/quiz/${categorySlug}`} className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4 shrink-0" />
            問題一覧に戻る
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">{quiz.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {quiz.choices.map((choice) => {
              const isSelected = selectedChoice === choice.id;
              const showCorrect = isAnswered && choice.is_correct;
              const showWrong =
                isAnswered && isSelected && !choice.is_correct;

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => !isAnswered && setSelectedChoice(choice.id)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-colors",
                    isAnswered && "cursor-not-allowed",
                    !isAnswered && "cursor-pointer hover:border-primary/50",
                    isSelected &&
                      !isAnswered &&
                      "border-primary bg-primary/10",
                    showCorrect &&
                      "border-green-500 bg-green-500/10 dark:bg-green-500/20",
                    showWrong &&
                      "border-destructive bg-destructive/10 dark:bg-destructive/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "size-6 shrink-0 rounded-full border-2 flex items-center justify-center",
                        isSelected &&
                          !isAnswered &&
                          "border-primary bg-primary",
                        showCorrect && "border-green-500 bg-green-500",
                        showWrong && "border-destructive bg-destructive",
                        !isSelected &&
                          !showCorrect &&
                          !showWrong &&
                          "border-muted-foreground/40"
                      )}
                    >
                      {(isSelected || showCorrect || showWrong) && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
                    <span className="text-foreground">
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
                <AlertTitle className="font-bold">
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
                  <div className="font-bold">解説</div>
                    <ExplanationView explanation={quiz.explanation} />
                  </div>
              )}

              <Button asChild className="w-full" variant="secondary" size="lg">
                <Link href={`/quiz/${categorySlug}`} className="inline-flex items-center justify-center gap-2">
                  <ArrowLeft className="size-4 shrink-0" />
                  問題一覧に戻る
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
