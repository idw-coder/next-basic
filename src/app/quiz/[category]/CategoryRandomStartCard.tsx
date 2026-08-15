'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Play, X } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { saveRandomSession, type RandomQuizSession } from '@/lib/randomQuizSession';

const QUIZ_COUNTS = [5, 10, 15, 20] as const;

const QUIZ_COUNT_STYLES: Record<
  number,
  { bg: string; border: string; text: string; label: string }
> = {
  5: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    label: 'text-emerald-500/70',
  },
  10: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    label: 'text-blue-500/70',
  },
  15: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-600',
    label: 'text-violet-500/70',
  },
  20: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    label: 'text-amber-500/70',
  },
};

interface CategoryRandomStartCardProps {
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  tags: { slug: string; name: string }[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function CategoryRandomStartCard({
  categoryId,
  categorySlug,
  categoryName,
  tags,
}: CategoryRandomStartCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quizCount, setQuizCount] = useState<number>(10);
  const [selectedTagSlug, setSelectedTagSlug] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedTagSlug !== 'all') params.set('tagSlug', selectedTagSlug);

      const res = await fetch(
        `/next-api/quiz/category/${categoryId}/quizzes${params.size ? `?${params.toString()}` : ''}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = (await res.json()) as { id: number; question: string }[];
      const allQuizzes = data.map((quiz) => ({
        id: quiz.id,
        categorySlug,
        question: quiz.question,
      }));

      if (allQuizzes.length === 0) {
        setError('この条件の問題が見つかりませんでした');
        setIsLoading(false);
        return;
      }

      const picked = shuffleArray(allQuizzes).slice(0, Math.min(quizCount, allQuizzes.length));
      const session: RandomQuizSession = {
        quizzes: picked,
        currentIndex: 0,
        answers: [],
        settings: { categoryId, count: quizCount },
      };

      saveRandomSession(session);
      router.push(`/quiz/${categorySlug}/${picked[0].id}`);
    } catch {
      setError('問題の取得に失敗しました。もう一度お試しください。');
      setIsLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="group block h-full min-w-0 text-left">
        <div className="relative flex h-full overflow-hidden rounded-lg border border-primary/15 bg-blue-50 px-2.5 py-2 transition-colors hover:bg-white sm:px-3 sm:py-2.5">
          <Image
            src="/images/card-backgrounds/random-practice-card-bg-person-right.webp"
            alt=""
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="pointer-events-none object-contain object-right opacity-75 transition-[transform,opacity] duration-500 group-hover:scale-[1.015] group-hover:opacity-90"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/70 via-white/45 to-white/20"
            aria-hidden="true"
          />
          <div className="relative z-10 w-[72%] min-w-0">
            <div className="mb-0.5 flex items-center">
              <span className="rounded-full bg-white/80 px-1.5 py-px text-[9px] font-bold leading-none text-primary sm:text-[10px]">
                連続演習
              </span>
            </div>
            <p className="line-clamp-1 text-[11px] font-bold leading-snug text-foreground sm:text-[13px]">
              ランダムに解く
            </p>
            <p className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
              問題を選ばず続けて練習
            </p>
          </div>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-random-title"
        >
          <div className="w-full max-w-md rounded-md border bg-background p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  ランダムクイズ
                </p>
                <h2 id="category-random-title" className="mt-1 text-xl font-extrabold">
                  {categoryName}を始める
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="閉じる"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <div className="mb-2 text-sm font-bold">問題数</div>
                <div className="grid grid-cols-4 gap-2">
                  {QUIZ_COUNTS.map((count) => {
                    const style = QUIZ_COUNT_STYLES[count];
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuizCount(count)}
                        className={cn(
                          'rounded-md border-2 p-3 text-center transition-all',
                          style.bg,
                          quizCount === count
                            ? `${style.border} shadow-sm`
                            : 'border-transparent opacity-70 hover:opacity-100',
                        )}
                      >
                        <div className={cn('text-xl font-extrabold tabular-nums', style.text)}>
                          {count}
                        </div>
                        <div className={cn('text-xs font-medium', style.label)}>問</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {tags.length > 0 && (
                <div>
                  <div className="mb-2 text-sm font-bold">タグ</div>
                  <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-md border bg-muted/20 p-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTagSlug('all')}
                      className={cn(
                        'rounded-md border px-2 py-1 text-xs font-semibold transition-colors',
                        selectedTagSlug === 'all'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-muted',
                      )}
                    >
                      すべて
                    </button>
                    {tags.map((tag) => (
                      <button
                        key={tag.slug}
                        type="button"
                        onClick={() => setSelectedTagSlug(tag.slug)}
                        className={cn(
                          'rounded-md border px-2 py-1 text-xs font-semibold transition-colors',
                          selectedTagSlug === tag.slug
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:bg-muted',
                        )}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleStart} disabled={isLoading} size="lg" className="w-full">
                {isLoading ? (
                  <Loader2 className="size-5 mr-2 animate-spin" />
                ) : (
                  <Play className="size-5 mr-2" />
                )}
                {quizCount}問 スタート
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
