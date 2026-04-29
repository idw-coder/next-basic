"use client";

import { useState, useEffect } from "react";
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

const QUIZ_COUNT_STYLES: Record<number, { bg: string; border: string; text: string; label: string }> = {
  5:  { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-700", text: "text-emerald-600 dark:text-emerald-400", label: "text-emerald-500/70 dark:text-emerald-400/60" },
  10: { bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-700", text: "text-blue-600 dark:text-blue-400", label: "text-blue-500/70 dark:text-blue-400/60" },
  15: { bg: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-700", text: "text-violet-600 dark:text-violet-400", label: "text-violet-500/70 dark:text-violet-400/60" },
  20: { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-700", text: "text-amber-600 dark:text-amber-400", label: "text-amber-500/70 dark:text-amber-400/60" },
};

const CATEGORY_COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  "html-basic":        { bg: "bg-orange-50 dark:bg-orange-500/10",  border: "border-orange-200 dark:border-orange-700",  text: "text-orange-600 dark:text-orange-400" },
  "css-basic":         { bg: "bg-blue-50 dark:bg-blue-500/10",      border: "border-blue-200 dark:border-blue-700",      text: "text-blue-600 dark:text-blue-400" },
  "javascript-basic":  { bg: "bg-amber-50 dark:bg-amber-500/10",    border: "border-amber-200 dark:border-amber-700",    text: "text-amber-600 dark:text-amber-400" },
  "react-basic":       { bg: "bg-cyan-50 dark:bg-cyan-500/10",      border: "border-cyan-200 dark:border-cyan-700",      text: "text-cyan-600 dark:text-cyan-400" },
  "vue-basic":         { bg: "bg-emerald-50 dark:bg-emerald-500/10",border: "border-emerald-200 dark:border-emerald-700",text: "text-emerald-600 dark:text-emerald-400" },
  "nodejs-basic":      { bg: "bg-green-50 dark:bg-green-500/10",    border: "border-green-200 dark:border-green-700",    text: "text-green-600 dark:text-green-400" },
  "aws-basic":         { bg: "bg-amber-50 dark:bg-amber-600/10",    border: "border-amber-200 dark:border-amber-700",    text: "text-amber-700 dark:text-amber-400" },
  "git-basic":         { bg: "bg-rose-50 dark:bg-rose-600/10",      border: "border-rose-200 dark:border-rose-700",      text: "text-rose-600 dark:text-rose-400" },
  "nginx-basic":       { bg: "bg-teal-50 dark:bg-teal-500/10",      border: "border-teal-200 dark:border-teal-700",      text: "text-teal-600 dark:text-teal-400" },
  "ts-general":        { bg: "bg-indigo-50 dark:bg-indigo-500/10",  border: "border-indigo-200 dark:border-indigo-700",  text: "text-indigo-600 dark:text-indigo-400" },
  "security-general":  { bg: "bg-red-50 dark:bg-red-500/10",        border: "border-red-200 dark:border-red-700",        text: "text-red-600 dark:text-red-400" },
  "sql-basic":         { bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10", border: "border-fuchsia-200 dark:border-fuchsia-700", text: "text-fuchsia-600 dark:text-fuchsia-400" },
  "cs-basic":          { bg: "bg-purple-50 dark:bg-purple-500/10",  border: "border-purple-200 dark:border-purple-700",  text: "text-purple-600 dark:text-purple-400" },
  "nextjs":            { bg: "bg-slate-50 dark:bg-slate-500/10",    border: "border-slate-200 dark:border-slate-700",    text: "text-slate-700 dark:text-slate-300" },
  "docker":            { bg: "bg-sky-50 dark:bg-sky-500/10",      border: "border-sky-200 dark:border-sky-700",      text: "text-sky-600 dark:text-sky-400" },
  "linux":             { bg: "bg-lime-50 dark:bg-lime-500/10",    border: "border-lime-200 dark:border-lime-700",    text: "text-lime-600 dark:text-lime-400" },
};

const DEFAULT_CAT_COLOR = { bg: "bg-gray-50 dark:bg-gray-500/10", border: "border-gray-200 dark:border-gray-700", text: "text-gray-600 dark:text-gray-400" };

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
  initialCategorySlug?: string;
  isCompleted?: boolean;
}

export default function RandomQuizClient({
  categories,
  initialCategorySlug,
  isCompleted,
}: RandomQuizClientProps) {
  const router = useRouter();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(() => {
    if (initialCategorySlug) {
      const found = categories.find((c) => c.slug === initialCategorySlug);
      if (found) return found.id;
    }
    return "all";
  });
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
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategoryId("all")}
              className={cn(
                "rounded-xl border-2 px-2 py-2.5 text-xs sm:text-sm font-semibold transition-all text-center",
                selectedCategoryId === "all"
                  ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20 scale-[1.02]"
                  : "border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10",
              )}
            >
              すべて
            </button>
            {categories.map((cat) => {
              const color = CATEGORY_COLOR_MAP[cat.slug] || DEFAULT_CAT_COLOR;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    "rounded-xl border-2 px-2 py-2.5 text-xs sm:text-sm font-semibold transition-all text-center",
                    selectedCategoryId === cat.id
                      ? `${color.border} ${color.bg} ${color.text} shadow-sm scale-[1.02]`
                      : `border-transparent ${color.bg} ${color.text} opacity-70 hover:opacity-100`,
                  )}
                >
                  {cat.category_name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">問題数を選択</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {QUIZ_COUNTS.map((count) => {
              const style = QUIZ_COUNT_STYLES[count];
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuizCount(count)}
                  className={cn(
                    "relative rounded-xl border-2 p-2.5 sm:p-4 text-center transition-all",
                    style.bg,
                    quizCount === count
                      ? `${style.border} shadow-sm scale-[1.02]`
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <div
                    className={cn(
                      "text-xl sm:text-2xl font-extrabold tabular-nums",
                      style.text,
                    )}
                  >
                    {count}
                  </div>
                  <div
                    className={cn(
                      "text-[10px] sm:text-xs font-medium",
                      style.label,
                    )}
                  >
                    問
                  </div>
                </button>
              );
            })}
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
  onRetry,
  onChangeSettings,
}: {
  session: RandomQuizSession;
  onRetry: () => Promise<void>;
  onChangeSettings: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const correctCount = session.answers.filter((a) => a.isCorrect).length;
  const totalCount = session.answers.length;
  const scorePercent =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

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
