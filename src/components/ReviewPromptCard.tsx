'use client';

import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { useQuizHistory } from '@/hooks/useQuizHistory';

/**
 * 最新回答が不正解の問題が1問以上あるときだけ表示する復習への導線カード。
 * 履歴はlocalStorage由来のためクライアントでのみ判定できる。
 */
export default function ReviewPromptCard() {
  const { answers } = useQuizHistory();

  const wrongCount = (() => {
    const latest = new Map<number, boolean>();
    answers.forEach((a) => latest.set(a.quizId, a.isCorrect));
    return Array.from(latest.values()).filter((isCorrect) => !isCorrect).length;
  })();

  if (wrongCount === 0) return null;

  return (
    <div className="mb-8 md:mb-16">
      <Link
        href="/quiz/review"
        className="group flex items-center gap-3 rounded-[1.25rem] border border-rose-200/70 bg-rose-50/70 px-4 py-3.5 shadow-[0_10px_28px_rgba(244,63,94,0.08)] transition hover:-translate-y-0.5 hover:shadow-md sm:gap-4 sm:px-6 sm:py-4 dark:border-rose-500/20 dark:bg-rose-500/5"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100 sm:size-11 dark:bg-rose-500/15">
          <RotateCcw className="size-5 text-rose-500" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink sm:text-base">
            苦手な問題が {wrongCount}問 あります
          </span>
          <span className="mt-0.5 block text-xs text-ink-muted sm:text-sm">
            間違えた問題だけを集めて解き直せます。正解すればリストから消えます
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-rose-600 sm:text-sm dark:text-rose-400">
          復習する
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
