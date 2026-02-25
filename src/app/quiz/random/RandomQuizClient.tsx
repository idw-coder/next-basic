"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shuffle,
  Play,
  RotateCcw,
  Home,
  Trophy,
  CircleCheck,
  CircleX,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import {
  getRandomSession,
  saveRandomSession,
  clearRandomSession,
  type RandomQuizSession,
} from "@/lib/randomQuizSession";

interface Category {
  id: number;
  slug: string;
  category_name: string;
}

const QUIZ_COUNTS = [5, 10, 15, 20] as const;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface RandomQuizClientProps {
  categories: Category[];
  initialCategoryId?: number;
  isCompleted?: boolean;
}

export default function RandomQuizClient({
  categories,
  initialCategoryId,
  isCompleted,
}: RandomQuizClientProps) {
  const router = useRouter();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    initialCategoryId ?? "all",
  );
  const [quizCount, setQuizCount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [completedSession, setCompletedSession] =
    useState<RandomQuizSession | null>(null);

  useEffect(() => {
    if (isCompleted) {
      const s = getRandomSession();
      if (s) {
        setCompletedSession(s);
        setSelectedCategoryId(s.settings.categoryId);
        setQuizCount(s.settings.count);
        clearRandomSession();
      }
    }
  }, [isCompleted]);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let allQuizzes: {
        id: number;
        categorySlug: string;
        question: string;
      }[] = [];

      if (selectedCategoryId === "all") {
        const results = await Promise.all(
          categories.map(async (cat) => {
            const res = await api.get(
              `/api/quiz/category/${cat.id}/quizzes`,
            );
            return (
              res.data as { id: number; question: string }[]
            ).map((q) => ({
              id: q.id,
              categorySlug: cat.slug,
              question: q.question,
            }));
          }),
        );
        allQuizzes = results.flat();
      } else {
        const cat = categories.find((c) => c.id === selectedCategoryId);
        if (!cat) {
          setError("カテゴリが見つかりません");
          setIsLoading(false);
          return;
        }
        const res = await api.get(
          `/api/quiz/category/${selectedCategoryId}/quizzes`,
        );
        allQuizzes = (
          res.data as { id: number; question: string }[]
        ).map((q) => ({
          id: q.id,
          categorySlug: cat.slug,
          question: q.question,
        }));
      }

      if (allQuizzes.length === 0) {
        setError("問題が見つかりませんでした");
        setIsLoading(false);
        return;
      }

      const shuffled = shuffleArray(allQuizzes);
      const picked = shuffled.slice(
        0,
        Math.min(quizCount, shuffled.length),
      );

      const session: RandomQuizSession = {
        quizzes: picked,
        currentIndex: 0,
        answers: [],
        settings: { categoryId: selectedCategoryId, count: quizCount },
      };

      saveRandomSession(session);

      const first = picked[0];
      router.push(`/quiz/${first.categorySlug}/${first.id}`);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setError("問題の取得に失敗しました。もう一度お試しください。");
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    setCompletedSession(null);
    await handleStart();
  };

  const handleChangeSettings = () => {
    clearRandomSession();
    setCompletedSession(null);
    router.replace("/quiz/random");
  };

  if (isCompleted && completedSession) {
    return (
      <ResultView
        session={completedSession}
        categories={categories}
        onRetry={handleRetry}
        onChangeSettings={handleChangeSettings}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground">問題を準備中...</p>
      </div>
    );
  }

  const selectedCategoryName =
    selectedCategoryId === "all"
      ? "すべてのカテゴリ"
      : (categories.find((c) => c.id === selectedCategoryId)
          ?.category_name ?? "");

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-2">
          <Shuffle className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          ランダムクイズ
        </h1>
        <p className="text-muted-foreground">
          カテゴリと問題数を選んでチャレンジ！
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">カテゴリを選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategoryId("all")}
              className={cn(
                "rounded-lg border-2 p-3 text-sm font-medium transition-colors text-center",
                selectedCategoryId === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50",
              )}
            >
              すべて
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "rounded-lg border-2 p-3 text-sm font-medium transition-colors text-center",
                  selectedCategoryId === cat.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">問題数を選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {QUIZ_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuizCount(count)}
                className={cn(
                  "flex-1 min-w-[80px] rounded-lg border-2 p-4 text-center transition-colors",
                  quizCount === count
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50",
                )}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">問</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleStart}
        size="lg"
        className="w-full text-lg py-6"
      >
        <Play className="size-5 mr-2" />
        {selectedCategoryName} {quizCount}問 スタート！
      </Button>
    </div>
  );
}

/* ─── Result View ─── */

function ResultView({
  session,
  categories,
  onRetry,
  onChangeSettings,
}: {
  session: RandomQuizSession;
  categories: Category[];
  onRetry: () => Promise<void>;
  onChangeSettings: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const correctCount = session.answers.filter((a) => a.isCorrect).length;
  const totalCount = session.answers.length;
  const scorePercent =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const categorySlugMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c) => map.set(c.id, c.slug));
    return map;
  }, [categories]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await onRetry();
  };

  if (isRetrying) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground">問題を準備中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4">
            <Trophy
              className={cn(
                "size-12",
                scorePercent >= 80
                  ? "text-yellow-500"
                  : scorePercent >= 60
                    ? "text-blue-500"
                    : "text-muted-foreground",
              )}
            />
          </div>
          <CardTitle className="text-2xl">結果発表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-extrabold text-primary">
              {scorePercent}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              正答率
            </div>
          </div>

          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <CircleCheck className="size-5 text-green-500" />
              <span className="text-lg font-bold">{correctCount}</span>
              <span className="text-sm text-muted-foreground">正解</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleX className="size-5 text-red-500" />
              <span className="text-lg font-bold">
                {totalCount - correctCount}
              </span>
              <span className="text-sm text-muted-foreground">
                不正解
              </span>
            </div>
          </div>

          <p className="text-muted-foreground">
            {scorePercent === 100
              ? "パーフェクト！素晴らしいです！"
              : scorePercent >= 80
                ? "素晴らしい結果です！"
                : scorePercent >= 60
                  ? "良い調子です！復習して更に伸ばしましょう。"
                  : "復習して理解を深めましょう！"}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRetry}
              size="lg"
              className="w-full"
            >
              <RotateCcw className="size-4 mr-2" />
              同じ設定でもう一度
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={onChangeSettings}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Shuffle className="size-4 mr-2" />
                設定を変更
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <Home className="size-4" />
                  トップへ
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Review */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">回答一覧</h3>
        {session.quizzes.map((quiz, index) => {
          const record = session.answers[index];
          if (!record) return null;
          return (
            <Link
              key={quiz.id}
              href={`/quiz/${quiz.categorySlug}/${quiz.id}`}
            >
              <Card className="transition-colors hover:border-blue-500/40 hover:bg-blue-400/10 py-0 mb-2">
                <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                  <div className="shrink-0">
                    {record.isCorrect ? (
                      <CircleCheck className="size-5 text-green-500" />
                    ) : (
                      <CircleX className="size-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">
                      {quiz.question}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      Q{index + 1}
                    </Badge>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
