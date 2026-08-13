'use client';

import { useQuizBookmarks } from '@/hooks/useQuizBookmarks';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { saveQuizQueueSession } from '@/lib/quizQueueSession';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  CircleCheck,
  CircleX,
  Trash2,
} from 'lucide-react';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, clearBookmarks } = useQuizBookmarks();
  const { getLatestAnswer } = useQuizHistory();

  const grouped = bookmarks.reduce<
    Record<string, { categorySlug: string; quizzes: typeof bookmarks }>
  >((acc, bm) => {
    if (!acc[bm.categorySlug]) {
      acc[bm.categorySlug] = { categorySlug: bm.categorySlug, quizzes: [] };
    }
    acc[bm.categorySlug].quizzes.push(bm);
    return acc;
  }, {});

  const totalBookmarks = bookmarks.length;
  const answeredCount = bookmarks.filter((bm) => getLatestAnswer(bm.quizId)).length;
  const correctCount = bookmarks.filter(
    (bm) => getLatestAnswer(bm.quizId)?.isCorrect,
  ).length;
  const saveBookmarkQueue = (items: typeof bookmarks) => {
    saveQuizQueueSession({
      source: 'bookmarks',
      label: 'ブックマーク',
      returnHref: '/quiz/bookmarks',
      items: items.map((bm) => ({
        id: bm.quizId,
        categorySlug: bm.categorySlug,
        question: bm.question,
      })),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 md:py-4">
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
          <li className="text-foreground font-medium">ブックマーク</li>
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
            fill="#fbbf24"
            opacity="0.08"
          />
        </svg>
        <div
          className="absolute top-2 right-8 w-6 h-6 rounded-full bg-amber-300/20 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-4 right-1/4 w-5 h-5 rounded-full bg-amber-200/30 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3 sm:gap-6">
          <div className="relative z-10 min-w-0 flex-1">
            <h1 className="mb-2 flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl md:text-3xl">
              <Bookmark className="size-6 shrink-0 text-amber-500 fill-amber-500" />
              ブックマーク
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              気になる問題を保存して、あとでまとめて復習できます
            </p>
          </div>
          <div className="relative z-10 flex w-[58px] shrink-0 justify-end sm:w-auto sm:justify-start">
            <Image
              src="/inpiration_man_color.png"
              alt=""
              width={588}
              height={761}
              className="h-auto w-[58px] sm:w-full sm:max-w-[100px] md:max-w-[130px]"
            />
          </div>
        </div>
      </section>

      {/* 統計カード */}
      {totalBookmarks > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 dark:bg-amber-500/5 dark:border-amber-500/20 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalBookmarks}</p>
            <p className="text-xs text-muted-foreground mt-0.5">保存済み</p>
          </div>
          <div className="rounded-lg border border-green-200/60 bg-green-50/50 dark:bg-green-500/5 dark:border-green-500/20 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">正解済み</p>
          </div>
          <div className="rounded-lg border border-gray-200/60 bg-gray-50/50 dark:bg-gray-500/5 dark:border-gray-500/20 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {totalBookmarks - answeredCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">未回答</p>
          </div>
        </div>
      )}

      {/* クリアボタン */}
      {totalBookmarks > 0 && (
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-8 px-2"
            onClick={() => {
              if (window.confirm('ブックマークをすべてクリアしますか？')) {
                clearBookmarks();
              }
            }}
          >
            <Trash2 className="size-3.5 mr-1" />
            すべてクリア
          </Button>
        </div>
      )}

      {/* メインコンテンツ */}
      {totalBookmarks === 0 ? (
        <div className="relative text-center py-16 rounded-2xl border border-dashed border-amber-300/50 bg-gradient-to-br from-amber-50/30 to-transparent dark:from-amber-500/5">
          <div className="absolute top-6 left-1/4 w-3 h-3 rounded-full bg-amber-200/40 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-8 right-1/3 w-4 h-4 rounded-full bg-amber-200/30 pointer-events-none" aria-hidden="true" />
          <Bookmark className="size-12 text-amber-300/50 mx-auto mb-4" />
          <p className="text-lg font-bold text-foreground mb-1">
            ブックマークした問題はまだありません
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            問題ページの右上にあるブックマークボタンを押すと、ここに保存されます
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
              <Link href="/#categories" className="inline-flex items-center gap-2">
                <BookOpen className="size-4" />
                クイズを解く
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([slug, group]) => (
            <div
              key={slug}
              className="rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-500/5 border-b border-gray-100 dark:border-gray-800">
                <Bookmark className="size-3.5 text-amber-500 fill-amber-500" />
                <h2 className="text-sm font-bold text-foreground">{slug}</h2>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-4">
                  {group.quizzes.length}問
                </Badge>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {group.quizzes.map((bm, i) => {
                  const latestAnswer = getLatestAnswer(bm.quizId);
                  return (
                    <div
                      key={bm.quizId}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-amber-50/50 dark:hover:bg-amber-500/5 group"
                    >
                      <span
                        className={cn(
                          'size-5 shrink-0 rounded flex items-center justify-center text-[10px] font-bold text-white',
                          i % 2 === 0 ? 'bg-amber-500' : 'bg-amber-400',
                        )}
                      >
                        {i + 1}
                      </span>
                      <Link
                        href={`/quiz/${bm.categorySlug}/${bm.quizId}`}
                        onClick={() => saveBookmarkQueue(group.quizzes)}
                        className="flex items-center gap-3 min-w-0 flex-1"
                      >
                        <p className="text-foreground text-sm leading-snug line-clamp-2 whitespace-pre-line min-w-0 flex-1">
                          {bm.question}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {latestAnswer ? (
                            latestAnswer.isCorrect ? (
                              <CircleCheck className="size-4 text-green-500" />
                            ) : (
                              <CircleX className="size-4 text-red-500" />
                            )
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-4 text-muted-foreground">
                              未回答
                            </Badge>
                          )}
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </div>
                      </Link>
                      {/*
                        以前はデスクトップでホバー時のみ表示していたが、
                        キーボード操作では見えないまま到達してしまうためフォーカスでも出す。
                      */}
                      <button
                        type="button"
                        onClick={() => removeBookmark(bm.quizId)}
                        className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 transition-opacity hover:bg-red-50 hover:text-destructive focus-visible:opacity-100 dark:hover:bg-red-500/10 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label={`「${bm.question}」のブックマークを解除`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
