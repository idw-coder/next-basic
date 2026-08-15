'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuizBookmarks } from '@/hooks/useQuizBookmarks';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import { saveQuizQueueSession, type QuizQueueItem } from '@/lib/quizQueueSession';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Bookmark,
  ChevronRight,
  CircleCheck,
  CircleX,
  Search,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import type { Quiz, Tag } from './page';
import type { SectionBookLink, SectionTagConfig } from './sectionTagMap';

interface QuizListClientProps {
  initialQuizzes: Quiz[];
  tags: Tag[];
  categoryId: number;
  categorySlug: string;
  currentQuery?: string;
  currentTagSlug?: string;
  sectionTags?: SectionTagConfig[];
  /** 教科書などの流入元。各問題のリンクに引き継いで解答後の戻り導線に使う */
  originParam?: string;
  /** 取得に失敗したのか、条件に合う問題が無いだけなのかを空表示で区別するため */
  loadError?: boolean;
}

interface QuizSection {
  slug: string;
  label: string;
  quizzes: Quiz[];
  tagSlugs: Set<string>;
  bookLinks?: SectionBookLink[];
}

const EMPTY_TAG_SLUGS = new Set<string>();

function buildSections(quizzes: Quiz[], sectionTags: SectionTagConfig[]): QuizSection[] {
  const sections: QuizSection[] = sectionTags.map((st) => ({
    slug: st.slug,
    label: st.label,
    quizzes: [],
    tagSlugs: new Set([st.slug, ...(st.aliases ?? [])]),
    bookLinks: st.bookLinks,
  }));

  const sectionSlugGroups = sections.map((section) => section.tagSlugs);
  const sectionSlugs = new Set(sectionSlugGroups.flatMap((slugs) => [...slugs]));
  const uncategorized: Quiz[] = [];

  for (const quiz of quizzes) {
    const matchedAnySectionTag = quiz.tags.some((t) => sectionSlugs.has(t.slug));
    if (!matchedAnySectionTag) {
      uncategorized.push(quiz);
    } else {
      sections.forEach((section, index) => {
        const sectionSlugGroup = sectionSlugGroups[index];
        if (quiz.tags.some((t) => sectionSlugGroup.has(t.slug))) {
          if (!section.quizzes.some((q) => q.id === quiz.id)) {
            section.quizzes.push(quiz);
          }
        }
      });
    }
  }

  const result = sections.filter((s) => s.quizzes.length > 0);

  if (uncategorized.length > 0) {
    result.push({
      slug: '_other',
      label: 'その他',
      quizzes: uncategorized,
      tagSlugs: new Set(),
    });
  }

  return result;
}

function QuizCard({
  quiz,
  index,
  categorySlug,
  getLatestAnswer,
  isBookmarked,
  hiddenTagSlugs = EMPTY_TAG_SLUGS,
  onOpen,
  originParam,
}: {
  quiz: Quiz;
  index: number;
  categorySlug: string;
  getLatestAnswer: (quizId: number) => { isCorrect: boolean } | null;
  isBookmarked?: boolean;
  hiddenTagSlugs?: Set<string>;
  onOpen?: () => void;
  originParam?: string;
}) {
  const latestAnswer = getLatestAnswer(quiz.id);
  const visibleTags = quiz.tags.filter((tag) => !hiddenTagSlugs.has(tag.slug));
  const isNew =
    quiz.createdAt && Date.now() - new Date(quiz.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
  return (
    <Link
      href={`/quiz/${categorySlug}/${quiz.id}${originParam ? `?from=${encodeURIComponent(originParam)}` : ''}`}
      onClick={onOpen}
      className="flex min-h-11 items-start gap-2 border-b border-solid border-ink/20 px-0.5 py-2.5 last:border-b-0 active:bg-muted/50 sm:gap-3 sm:px-2 sm:py-2 sm:hover:bg-blue-400/5"
    >
      <span
        className={cn(
          'mt-0.5 size-5 sm:size-6 shrink-0 rounded p-0 flex items-center justify-center text-xs font-bold text-white',
          index % 2 === 0 ? 'bg-blue-600' : 'bg-blue-500',
        )}
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-[13px] leading-snug line-clamp-2 whitespace-pre-line sm:text-[12px]">
          {quiz.question}
        </p>
        {visibleTags.length > 0 && (
          <div className="mt-1 flex min-w-0 flex-wrap gap-1">
            {visibleTags.slice(0, 4).map((tag) => (
              <Badge
                key={tag.slug}
                variant="secondary"
                className="max-w-28 truncate px-1.5 py-0 text-[10px] leading-4"
                title={tag.name}
              >
                {tag.name}
              </Badge>
            ))}
            {visibleTags.length > 4 && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] leading-4">
                +{visibleTags.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="mt-0.5 flex items-center gap-1.5 shrink-0">
        {isBookmarked && <Bookmark className="size-3.5 text-amber-500 fill-amber-500" />}
        {isNew && (
          <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] px-1.5 py-0 leading-4">
            NEW
          </Badge>
        )}
        {latestAnswer ? (
          latestAnswer.isCorrect ? (
            <CircleCheck className="size-4 text-green-500" />
          ) : (
            <CircleX className="size-4 text-red-500" />
          )
        ) : null}
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function SectionGroup({
  section,
  categorySlug,
  getLatestAnswer,
  isBookmarked,
  onOpen,
  originParam,
}: {
  section: QuizSection;
  categorySlug: string;
  getLatestAnswer: (quizId: number) => { isCorrect: boolean } | null;
  isBookmarked: (quizId: number) => boolean;
  onOpen: (items: Quiz[], sectionLabel?: string) => void;
  originParam?: string;
}) {
  // 「その他」はタグでまとまっていないので、カテゴリ既定のラベルに任せる
  const queueLabel = section.slug === '_other' ? undefined : `${section.label}の問題`;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 border-b-2 border-blue-500 pb-1 sm:mb-3 sm:pb-1.5">
        <h3 className="text-sm font-bold text-foreground sm:text-[15px]">{section.label}</h3>
        <span className="text-[11px] font-medium text-muted-foreground sm:text-xs">
          {section.quizzes.length}問
        </span>
      </div>
      <div>
        {section.quizzes.map((quiz, i) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            index={i}
            categorySlug={categorySlug}
            getLatestAnswer={getLatestAnswer}
            isBookmarked={isBookmarked(quiz.id)}
            hiddenTagSlugs={section.tagSlugs}
            onOpen={() => onOpen(section.quizzes, queueLabel)}
            originParam={originParam}
          />
        ))}
      </div>
      {section.bookLinks && section.bookLinks.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2 sm:gap-2">
          {section.bookLinks.map((link) => (
            <Link
              key={`${link.bookSlug}/${link.chapterSlug}`}
              href={`/books/${link.bookSlug}/${link.chapterSlug}`}
              className="inline-flex min-h-8 items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-900 transition-colors hover:bg-amber-100 sm:min-h-9 sm:px-2.5 sm:py-1.5 sm:text-xs"
            >
              <BookOpen className="size-3 shrink-0" />
              <span className="line-clamp-1">{link.title}</span>
            </Link>
          ))}
        </div>
      )}
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
  originParam,
  loadError = false,
}: QuizListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { getLatestAnswer, getCategoryStats, clearHistory } = useQuizHistory();
  const { isBookmarked } = useQuizBookmarks();

  const [inputValue, setInputValue] = useState(currentQuery);

  const selectedTagName = tags.find((tag) => tag.slug === currentTagSlug)?.name;
  const queueLabel = selectedTagName
    ? `${selectedTagName}の問題`
    : currentQuery
      ? `「${currentQuery}」の検索結果`
      : 'このカテゴリの問題';
  const returnParams = new URLSearchParams();
  if (currentQuery) returnParams.set('q', currentQuery);
  if (currentTagSlug) returnParams.set('tagSlug', currentTagSlug);
  const returnHref = `/quiz/${categorySlug}${returnParams.size ? `?${returnParams.toString()}` : ''}`;
  /**
   * 開いた問題と同じ並びをキューとして保存する。
   *
   * セクション表示ではその見出し（タグ）の問題だけが渡されるので、
   * ラベルもセクション名にする。カテゴリ名のままだと
   * 解答後に「このカテゴリの問題 残りN問」と出て実際の範囲と食い違う。
   */
  const saveCategoryQueue = (quizzes: Quiz[], sectionLabel?: string) => {
    const items: QuizQueueItem[] = quizzes.map((quiz) => ({
      id: quiz.id,
      categorySlug,
      question: quiz.question,
      tagSlugs: quiz.tags.map((tag) => tag.slug),
    }));
    saveQuizQueueSession({
      source: 'category',
      label: sectionLabel ?? queueLabel,
      returnHref,
      items,
    });
  };

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
      className={cn(
        'space-y-4 sm:space-y-6',
        isPending && 'opacity-60 pointer-events-none transition-opacity',
      )}
    >
      {/* 検索・フィルターUI */}
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground sm:left-3 sm:size-4" />
          <Input
            aria-label="問題をキーワードで絞り込む"
            placeholder="問題を検索..."
            className="h-8 pl-9 sm:h-9 sm:pl-10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2" role="group" aria-label="タグで絞り込む">
          <Badge asChild variant={!currentTagSlug ? 'default' : 'outline'}>
            <button
              type="button"
              aria-pressed={!currentTagSlug}
              className="min-h-7 cursor-pointer px-2 text-[11px] sm:min-h-9 sm:px-3 sm:text-xs"
              onClick={() => updateFilters(inputValue, '')}
            >
              すべて
            </button>
          </Badge>
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              asChild
              variant={currentTagSlug === tag.slug ? 'default' : 'outline'}
            >
              <button
                type="button"
                aria-pressed={currentTagSlug === tag.slug}
                className="min-h-7 cursor-pointer px-2 text-[11px] sm:min-h-9 sm:px-3 sm:text-xs"
                onClick={() => updateFilters(inputValue, tag.slug)}
              >
                {tag.name}
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* 解答履歴サマリー */}
      {stats.total > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2.5 text-xs sm:gap-4 sm:text-sm">
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
            className="min-h-8 px-1.5 text-xs text-muted-foreground hover:text-destructive sm:min-h-9 sm:px-2 sm:text-sm"
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
      <div className="space-y-3 sm:space-y-4">
        <p
          aria-live="polite"
          className="flex min-h-5 items-center gap-1.5 text-xs text-muted-foreground sm:min-h-6 sm:gap-2 sm:text-sm"
        >
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
            <div className="space-y-5 sm:space-y-8">
              {sections.map((section) => (
                <SectionGroup
                  key={section.slug}
                  section={section}
                  categorySlug={categorySlug}
                  getLatestAnswer={getLatestAnswer}
                  isBookmarked={isBookmarked}
                  onOpen={saveCategoryQueue}
                  originParam={originParam}
                />
              ))}
            </div>
          ) : (
            <div>
              {initialQuizzes.map((quiz, index) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  index={index}
                  categorySlug={categorySlug}
                  getLatestAnswer={getLatestAnswer}
                  isBookmarked={isBookmarked(quiz.id)}
                  onOpen={() => saveCategoryQueue(initialQuizzes)}
                  originParam={originParam}
                />
              ))}
            </div>
          )
        ) : loadError ? (
          <div className="rounded-md border-2 border-dashed border-destructive/40 py-8 text-center sm:py-12">
            <p className="text-sm font-semibold text-foreground sm:text-base">
              問題を読み込めませんでした
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              一時的な不具合の可能性があります。時間をおいて試してください
            </p>
            <Button variant="outline" className="mt-3 sm:mt-4" onClick={() => router.refresh()}>
              再読み込み
            </Button>
          </div>
        ) : (
          <div className="rounded-md border-2 border-dashed py-8 text-center sm:py-12">
            <p className="text-sm text-muted-foreground sm:text-base">該当する問題がありません</p>
            {(currentQuery || currentTagSlug) && (
              <Button
                variant="outline"
                className="mt-3 sm:mt-4"
                onClick={() => {
                  setInputValue('');
                  updateFilters('', '');
                }}
              >
                絞り込みを解除する
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
