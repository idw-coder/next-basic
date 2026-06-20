'use client';

import { useTransition, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronRight, CircleCheck, CircleX, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import type { Quiz, Tag } from './page';
import type { SectionTagConfig } from './sectionTagMap';

interface QuizListClientProps {
  initialQuizzes: Quiz[];
  tags: Tag[];
  categoryId: number;
  categorySlug: string;
  currentQuery?: string;
  currentTagSlug?: string;
  sectionTags?: SectionTagConfig[];
}

interface QuizSection {
  slug: string;
  label: string;
  quizzes: Quiz[];
}

function buildSections(quizzes: Quiz[], sectionTags: SectionTagConfig[]): QuizSection[] {
  const sections: QuizSection[] = sectionTags.map((st) => ({
    slug: st.slug,
    label: st.label,
    quizzes: [],
  }));

  const sectionSlugs = new Set(sectionTags.map((st) => st.slug));
  const uncategorized: Quiz[] = [];

  for (const quiz of quizzes) {
    const matchedAnySectionTag = quiz.tags.some((t) => sectionSlugs.has(t.slug));
    if (!matchedAnySectionTag) {
      uncategorized.push(quiz);
    } else {
      for (const section of sections) {
        if (quiz.tags.some((t) => t.slug === section.slug)) {
          section.quizzes.push(quiz);
        }
      }
    }
  }

  const result = sections.filter((s) => s.quizzes.length > 0);

  if (uncategorized.length > 0) {
    result.push({ slug: '_other', label: 'その他', quizzes: uncategorized });
  }

  return result;
}

function QuizCard({
  quiz,
  index,
  categorySlug,
  getLatestAnswer,
}: {
  quiz: Quiz;
  index: number;
  categorySlug: string;
  getLatestAnswer: (quizId: number) => { isCorrect: boolean } | null;
}) {
  const latestAnswer = getLatestAnswer(quiz.id);
  const isNew =
    quiz.createdAt &&
    Date.now() - new Date(quiz.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
  return (
    <Link href={`/quiz/${categorySlug}/${quiz.id}`} className="block">
      <Card className="transition-colors hover:border-blue-500/40 hover:bg-blue-400/10 py-0">
        <CardContent className="flex items-center gap-4 p-2 sm:p-4">
          <Badge
            variant="outline"
            className={cn(
              'size-6 sm:size-8 shrink-0 rounded-md p-0 flex items-center justify-center font-bold border-0 text-white',
              index % 2 === 0 ? 'bg-blue-600' : 'bg-blue-500',
            )}
          >
            {index + 1}
          </Badge>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-foreground font-medium line-clamp-2 text-sm sm:text-base whitespace-pre-line">
                {quiz.question}
              </p>
              {isNew && (
                <Badge className="shrink-0 bg-red-500 hover:bg-red-500 text-white text-[10px] px-1.5 py-0 leading-4">
                  NEW
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {quiz.tags.map((t) => (
                <span key={t.id} className="text-xs text-blue-700/80 dark:text-blue-300/80">
                  #{t.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {latestAnswer ? (
              latestAnswer.isCorrect ? (
                <CircleCheck className="size-5 text-green-500" />
              ) : (
                <CircleX className="size-5 text-red-500" />
              )
            ) : null}
            <ChevronRight className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SectionGroup({
  section,
  categorySlug,
  getLatestAnswer,
}: {
  section: QuizSection;
  categorySlug: string;
  getLatestAnswer: (quizId: number) => { isCorrect: boolean } | null;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold text-foreground">{section.label}</h3>
        <Badge variant="secondary" className="text-xs">
          {section.quizzes.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {section.quizzes.map((quiz, i) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            index={i}
            categorySlug={categorySlug}
            getLatestAnswer={getLatestAnswer}
          />
        ))}
      </div>
    </div>
  );
}

export default function QuizListClient({
  initialQuizzes,
  tags,
  categoryId,
  categorySlug,
  currentQuery = '',
  currentTagSlug = '',
  sectionTags = [],
}: QuizListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { getLatestAnswer, getCategoryStats, clearHistory } = useQuizHistory();

  const [inputValue, setInputValue] = useState(currentQuery);

  const stats = getCategoryStats(categoryId);

  const sections = useMemo(
    () => (sectionTags.length > 0 ? buildSections(initialQuizzes, sectionTags) : []),
    [initialQuizzes, sectionTags],
  );
  const useSectionView =
    sections.length > 0 && !(sections.length === 1 && sections[0].slug === '_other');

  const updateFilters = (q: string, tagSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (q) params.set('q', q);
    else params.delete('q');

    if (tagSlug) params.set('tagSlug', tagSlug);
    else params.delete('tagSlug');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== currentQuery) {
        updateFilters(inputValue, currentTagSlug);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div
      className={cn('space-y-6', isPending && 'opacity-60 pointer-events-none transition-opacity')}
    >
      {/* 検索・フィルターUI */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="問題を検索..."
            className="pl-10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!currentTagSlug ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => updateFilters(inputValue, '')}
          >
            すべて
          </Badge>
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={currentTagSlug === tag.slug ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => updateFilters(inputValue, tag.slug)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* 解答履歴サマリー */}
      {stats.total > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">解答済み</span>
            <span className="font-semibold">{stats.total}問</span>
            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
              <CircleCheck className="size-3.5" />
              {stats.correct}
            </span>
            <span className="inline-flex items-center gap-1 text-red-500 dark:text-red-400">
              <CircleX className="size-3.5" />
              {stats.incorrect}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-8 px-2"
            onClick={() => {
              if (window.confirm('解答履歴をすべてクリアしますか？')) {
                clearHistory();
              }
            }}
          >
            <Trash2 className="size-3.5 mr-1" />
            クリア
          </Button>
        </div>
      )}

      {/* 結果表示 */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          {isPending ? (
            '読み込み中...'
          ) : (
            <>
              該当件数
              <Badge variant="secondary">{initialQuizzes.length}</Badge>件
            </>
          )}
        </p>

        {initialQuizzes.length > 0 ? (
          useSectionView ? (
            <div className="space-y-8">
              {sections.map((section) => (
                <SectionGroup
                  key={section.slug}
                  section={section}
                  categorySlug={categorySlug}
                  getLatestAnswer={getLatestAnswer}
                />
              ))}
            </div>
          ) : (
            initialQuizzes.map((quiz, index) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                index={index}
                categorySlug={categorySlug}
                getLatestAnswer={getLatestAnswer}
              />
            ))
          )
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">該当する問題がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
