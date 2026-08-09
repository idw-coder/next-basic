'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  ChevronRight,
  CircleCheck,
  CircleX,
  Loader2,
  Play,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuizHistory, type QuizAnswer } from '@/hooks/useQuizHistory';
import {
  clearRandomSession,
  getRandomSession,
  saveRandomSession,
  type RandomQuizSession,
} from '@/lib/randomQuizSession';

interface ReviewQuiz {
  id: number;
  categorySlug: string;
  categoryName: string;
  question: string;
  lastWrongAt: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ReviewClient({ isCompleted }: { isCompleted: boolean }) {
  const { answers } = useQuizHistory();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<ReviewQuiz[] | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [completedResult, setCompletedResult] = useState<{
    total: number;
    correct: number;
  } | null>(null);

  // 解き直しセッション完了時: 結果を拾ってセッションを破棄
  useEffect(() => {
    if (!isCompleted) return;
    const session = getRandomSession();
    if (session && session.mode === 'review') {
      setCompletedResult({
        total: session.answers.length,
        correct: session.answers.filter((a) => a.isCorrect).length,
      });
      clearRandomSession();
    }
    router.replace('/quiz/review', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  // 各クイズの最新回答を取り、最新が不正解のものだけを復習対象にする
  const latestWrong = useMemo(() => {
    const latestByQuiz = new Map<number, QuizAnswer>();
    answers.forEach((a) => latestByQuiz.set(a.quizId, a));
    return Array.from(latestByQuiz.values()).filter((a) => !a.isCorrect);
  }, [answers]);

  const hasHistory = answers.length > 0;
  const wrongIdsKey = useMemo(
    () =>
      latestWrong
        .map((a) => a.quizId)
        .sort((a, b) => a - b)
        .join(','),
    [latestWrong],
  );

  // 履歴には quizId しかないため、問題文とカテゴリは検索APIから取得する
  useEffect(() => {
    if (!wrongIdsKey) {
      setQuizzes([]);
      return;
    }
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`/next-api/quiz/search?ids=${wrongIdsKey}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const list: {
          id: number;
          question: string;
          category_slug: string | null;
          category_name: string | null;
        }[] = await res.json();
        if (aborted) return;

        const wrongAtById = new Map(latestWrong.map((a) => [a.quizId, a.answeredAt]));
        // 削除済みなどAPIに存在しない問題はここで自然に除外される
        setQuizzes(
          list
            .filter((q) => q.category_slug)
            .map((q) => ({
              id: q.id,
              categorySlug: q.category_slug as string,
              categoryName: q.category_name ?? q.category_slug ?? '',
              question: q.question,
              lastWrongAt: wrongAtById.get(q.id) ?? '',
            })),
        );
        setFetchError(false);
      } catch {
        if (!aborted) setFetchError(true);
      }
    })();
    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrongIdsKey]);

  const grouped = useMemo(() => {
    const map = new Map<string, { categoryName: string; quizzes: ReviewQuiz[] }>();
    (quizzes ?? []).forEach((q) => {
      const entry = map.get(q.categorySlug) ?? { categoryName: q.categoryName, quizzes: [] };
      entry.quizzes.push(q);
      map.set(q.categorySlug, entry);
    });
    return Array.from(map.entries());
  }, [quizzes]);

  const startRedoSession = (target: ReviewQuiz[]) => {
    if (target.length === 0) return;
    const picked = shuffleArray(target);
    const session: RandomQuizSession = {
      quizzes: picked.map((q) => ({
        id: q.id,
        categorySlug: q.categorySlug,
        question: q.question,
      })),
      currentIndex: 0,
      answers: [],
      settings: { categoryId: 'all', count: picked.length },
      mode: 'review',
    };
    saveRandomSession(session);
    router.push(`/quiz/${picked[0].categorySlug}/${picked[0].id}`);
  };

  const totalWrong = quizzes?.length ?? 0;

  return (
    <>
      {/* パンくず */}
      <nav aria-label="パンくずリスト" className="mb-4 text-sm sm:mb-6">
        <ol className="flex items-center gap-1 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="text-foreground font-medium">復習</li>
        </ol>
      </nav>

      {/* ヘッダー */}
      <section className="relative mb-6 overflow-hidden sm:mb-8">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          aria-hidden="true"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M -10 285 C 120 278 280 180 410 15 L 410 55 C 280 220 120 295 -10 300 Z"
            fill="#f43f5e"
            opacity="0.07"
          />
        </svg>
        <div
          className="absolute top-2 right-8 w-6 h-6 rounded-full bg-rose-300/20 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-4 right-1/4 w-5 h-5 rounded-full bg-rose-200/30 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3 sm:gap-6">
          <div className="relative z-10 min-w-0 flex-1">
            <h1 className="mb-2 flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl md:text-3xl">
              <RotateCcw className="size-6 shrink-0 text-rose-500" />
              復習
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              間違えた問題だけを集めました。解き直して正解するとリストから消えます
            </p>
          </div>
          <div className="relative z-10 flex w-[58px] shrink-0 justify-end sm:w-auto sm:justify-start">
            <Image
              src="/images/toppa_suit_woman_color.png"
              alt=""
              width={588}
              height={761}
              className="h-auto w-[58px] sm:w-full sm:max-w-[100px] md:max-w-[130px]"
            />
          </div>
        </div>
      </section>

      {/* 解き直し完了バナー */}
      {completedResult && (
        <div className="mb-6 rounded-lg border border-green-200/70 bg-green-50/70 dark:bg-green-500/10 dark:border-green-500/30 px-4 py-3 flex items-center gap-3">
          <Trophy className="size-5 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-200">
            解き直しおつかれさまでした！ {completedResult.total}問中{' '}
            <span className="font-bold">{completedResult.correct}問</span> を克服しました
            {completedResult.correct === completedResult.total && ' 🎉'}
          </p>
        </div>
      )}

      {/* ローディング / エラー / 空状態 / 一覧 */}
      {quizzes === null && !fetchError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">復習リストを準備中...</p>
        </div>
      ) : fetchError ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-rose-300/50">
          <p className="text-sm text-muted-foreground">
            復習リストの取得に失敗しました。時間をおいて再読み込みしてください
          </p>
        </div>
      ) : totalWrong === 0 ? (
        <div className="relative text-center py-16 rounded-2xl border border-dashed border-rose-300/50 bg-gradient-to-br from-rose-50/30 to-transparent dark:from-rose-500/5">
          <div
            className="absolute top-6 left-1/4 w-3 h-3 rounded-full bg-rose-200/40 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-8 right-1/3 w-4 h-4 rounded-full bg-rose-200/30 pointer-events-none"
            aria-hidden="true"
          />
          {hasHistory ? (
            <>
              <CircleCheck className="size-12 text-green-400/70 mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground mb-1">苦手な問題はありません 🎉</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                回答した問題はすべて正解済みです。新しい問題に挑戦してみましょう
              </p>
            </>
          ) : (
            <>
              <RotateCcw className="size-12 text-rose-300/50 mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground mb-1">まだ回答履歴がありません</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                クイズに挑戦して間違えた問題が、ここに自動で集まります
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Button asChild className="bg-rose-500 hover:bg-rose-600 text-white">
              <Link href="/#categories" className="inline-flex items-center gap-2">
                <BookOpen className="size-4" />
                クイズを解く
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 統計カード */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-lg border border-rose-200/60 bg-rose-50/50 dark:bg-rose-500/5 dark:border-rose-500/20 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totalWrong}</p>
              <p className="text-xs text-muted-foreground mt-0.5">苦手な問題</p>
            </div>
            <div className="rounded-lg border border-blue-200/60 bg-blue-50/50 dark:bg-blue-500/5 dark:border-blue-500/20 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {grouped.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">カテゴリ</p>
            </div>
            <div className="rounded-lg border border-gray-200/60 bg-gray-50/50 dark:bg-gray-500/5 dark:border-gray-500/20 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-foreground">
                {new Map(answers.map((a) => [a.quizId, a])).size}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">挑戦した問題</p>
            </div>
          </div>

          {/* 全部まとめて解き直す */}
          {totalWrong >= 2 && (
            <div className="mb-6">
              <Button
                size="lg"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                onClick={() => startRedoSession(quizzes ?? [])}
              >
                <Play className="size-4 mr-2" />
                {totalWrong}問すべてまとめて解き直す
              </Button>
            </div>
          )}

          {/* カテゴリ別リスト */}
          <div className="space-y-6">
            {grouped.map(([slug, group]) => (
              <div
                key={slug}
                className="rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-50/80 to-transparent dark:from-rose-500/5 border-b border-gray-100 dark:border-gray-800">
                  <CircleX className="size-3.5 text-rose-500" />
                  <h2 className="text-sm font-bold text-foreground">{group.categoryName}</h2>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-4">
                    {group.quizzes.length}問
                  </Badge>
                  <div className="ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => startRedoSession(group.quizzes)}
                    >
                      <Play className="size-3 mr-1" />
                      まとめて解き直す
                    </Button>
                  </div>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {group.quizzes.map((quiz, i) => (
                    <Link
                      key={quiz.id}
                      href={`/quiz/${quiz.categorySlug}/${quiz.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-rose-50/50 dark:hover:bg-rose-500/5"
                    >
                      <span
                        className={cn(
                          'size-5 shrink-0 rounded flex items-center justify-center text-[10px] font-bold text-white',
                          i % 2 === 0 ? 'bg-rose-500' : 'bg-rose-400',
                        )}
                      >
                        {i + 1}
                      </span>
                      <p className="text-foreground text-sm leading-snug line-clamp-2 whitespace-pre-line min-w-0 flex-1">
                        {quiz.question}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {quiz.lastWrongAt && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 leading-4 text-muted-foreground"
                          >
                            {formatDate(quiz.lastWrongAt)} に不正解
                          </Badge>
                        )}
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
