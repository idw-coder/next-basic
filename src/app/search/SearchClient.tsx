'use client';

import { useTransition, useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ChevronRight,
  CircleCheck,
  CircleX,
  Loader2,
  X,
  BookOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import type { SearchQuiz } from './page';
import type { SearchBookResult } from '@/lib/searchBooks';

interface Category {
  id: number;
  slug: string;
  category_name: string;
}

interface BookSummary {
  bookSlug: string;
  title: string;
}

interface SearchClientProps {
  initialQuizResults: SearchQuiz[];
  initialBookResults: SearchBookResult[];
  categories: Category[];
  books: BookSummary[];
  currentQuery: string;
  suggestedKeywords: string[];
}

type ContentFilter = 'all' | 'quiz' | 'book';

const CATEGORY_COLORS: Record<string, { badge: string; text: string }> = {
  'html-basic': {
    badge: 'bg-orange-100 dark:bg-orange-500/20',
    text: 'text-orange-700 dark:text-orange-300',
  },
  'css-basic': {
    badge: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  'javascript-basic': {
    badge: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
  },
  'react-basic': {
    badge: 'bg-cyan-100 dark:bg-cyan-500/20',
    text: 'text-cyan-700 dark:text-cyan-300',
  },
  'vue-basic': {
    badge: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  'nodejs-basic': {
    badge: 'bg-green-100 dark:bg-green-500/20',
    text: 'text-green-700 dark:text-green-300',
  },
  'aws-basic': {
    badge: 'bg-amber-100 dark:bg-amber-600/20',
    text: 'text-amber-800 dark:text-amber-300',
  },
  'git-basic': {
    badge: 'bg-rose-100 dark:bg-rose-600/20',
    text: 'text-rose-700 dark:text-rose-300',
  },
  'nginx-basic': {
    badge: 'bg-teal-100 dark:bg-teal-500/20',
    text: 'text-teal-700 dark:text-teal-300',
  },
  'ts-general': {
    badge: 'bg-indigo-100 dark:bg-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  'security-general': {
    badge: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-300',
  },
  'sql-basic': {
    badge: 'bg-fuchsia-100 dark:bg-fuchsia-500/20',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
  },
  'cs-basic': {
    badge: 'bg-purple-100 dark:bg-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
  },
  nextjs: {
    badge: 'bg-slate-100 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-300',
  },
  docker: {
    badge: 'bg-sky-100 dark:bg-sky-500/20',
    text: 'text-sky-700 dark:text-sky-300',
  },
  linux: {
    badge: 'bg-lime-100 dark:bg-lime-500/20',
    text: 'text-lime-700 dark:text-lime-300',
  },
};

function getCategoryColor(slug: string) {
  return (
    CATEGORY_COLORS[slug] || {
      badge: 'bg-gray-100 dark:bg-gray-500/20',
      text: 'text-gray-700 dark:text-gray-300',
    }
  );
}

function getBookHref(item: SearchBookResult): string {
  if (item.kind === 'book') return `/books/${item.bookSlug}`;
  return `/books/${item.bookSlug}/${item.chapterSlug}`;
}

function getBookLabel(item: SearchBookResult): string {
  if (item.kind === 'book') return item.bookTitle;
  return item.title;
}

function getBookSubtext(item: SearchBookResult): string | undefined {
  if (item.kind === 'book') return item.description;
  return item.description ?? item.bookTitle;
}

export default function SearchClient({
  initialQuizResults,
  initialBookResults,
  categories,
  books,
  currentQuery,
  suggestedKeywords,
}: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { getLatestAnswer } = useQuizHistory();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState(currentQuery);
  const hasSearched = !!currentQuery;

  const categoryCounts = initialQuizResults.reduce<Record<string, number>>((acc, quiz) => {
    acc[quiz.categorySlug] = (acc[quiz.categorySlug] || 0) + 1;
    return acc;
  }, {});

  const [filterCategory, setFilterCategory] = useState<string>('');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');

  const filteredQuizResults = filterCategory
    ? initialQuizResults.filter((q) => q.categorySlug === filterCategory)
    : initialQuizResults;

  const visibleBookResults =
    contentFilter === 'quiz' ? [] : initialBookResults;
  const visibleQuizResults =
    contentFilter === 'book' ? [] : filteredQuizResults;

  const totalCount = initialQuizResults.length + initialBookResults.length;
  const visibleCount = visibleBookResults.length + visibleQuizResults.length;

  const updateSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== currentQuery) {
        setFilterCategory('');
        setContentFilter('all');
        updateSearch(inputValue);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  const handleKeywordClick = (keyword: string) => {
    setInputValue(keyword);
    setFilterCategory('');
    setContentFilter('all');
    updateSearch(keyword);
    inputRef.current?.focus();
  };

  const clearInput = () => {
    setInputValue('');
    setFilterCategory('');
    setContentFilter('all');
    updateSearch('');
    inputRef.current?.focus();
  };

  const matchedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);
  const showContentTabs =
    initialQuizResults.length > 0 && initialBookResults.length > 0;

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="キーワードで検索（例：Promise, 型ガード, API設計）"
          className="pl-12 pr-20 h-12 text-base rounded-md border-2 focus-visible:border-primary"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isPending && <Loader2 className="size-4 text-muted-foreground animate-spin" />}
          {inputValue && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full"
              onClick={clearInput}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {!hasSearched && suggestedKeywords.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">人気のタグから探す</p>
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.map((keyword, i) => {
              const colors = [
                'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30 dark:hover:bg-violet-500/20',
                'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30 dark:hover:bg-sky-500/20',
                'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-amber-500/20',
                'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20',
                'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/20',
                'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30 dark:hover:bg-indigo-500/20',
                'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30 dark:hover:bg-teal-500/20',
                'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30 dark:hover:bg-orange-500/20',
              ];
              return (
                <button
                  key={keyword}
                  onClick={() => handleKeywordClick(keyword)}
                  className={cn(
                    'inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-sm active:scale-100',
                    colors[i % colors.length],
                  )}
                >
                  <Search className="size-3 mr-1.5 opacity-60" />
                  {keyword}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasSearched && (
        <div
          className={cn(
            'space-y-6',
            isPending && 'opacity-60 pointer-events-none transition-opacity',
          )}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                「<span className="font-medium text-foreground">{currentQuery}</span>
                」の検索結果{' '}
                <Badge variant="secondary" className="ml-1">
                  {visibleCount}
                </Badge>{' '}
                件
                {totalCount !== visibleCount && (
                  <span className="ml-1">/ 全{totalCount}件</span>
                )}
                {totalCount > 0 && (
                  <span className="ml-2 text-xs">
                    （教科書 {initialBookResults.length} / クイズ {initialQuizResults.length}）
                  </span>
                )}
              </p>
            </div>

            {showContentTabs && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={contentFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setContentFilter('all')}
                >
                  すべて ({totalCount})
                </Badge>
                <Badge
                  variant={contentFilter === 'book' ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer',
                    contentFilter !== 'book' &&
                      'bg-emerald-100 text-emerald-800 border-0 dark:bg-emerald-500/20 dark:text-emerald-300',
                  )}
                  onClick={() => setContentFilter('book')}
                >
                  教科書 ({initialBookResults.length})
                </Badge>
                <Badge
                  variant={contentFilter === 'quiz' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setContentFilter('quiz')}
                >
                  クイズ ({initialQuizResults.length})
                </Badge>
              </div>
            )}

            {contentFilter !== 'book' && matchedCategories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={!filterCategory ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterCategory('')}
                >
                  クイズすべて ({initialQuizResults.length})
                </Badge>
                {matchedCategories.map(([slug, count]) => {
                  const cat = categories.find((c) => c.slug === slug);
                  if (!cat) return null;
                  const color = getCategoryColor(slug);
                  return (
                    <Badge
                      key={slug}
                      variant={filterCategory === slug ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer',
                        filterCategory !== slug && `${color.badge} ${color.text} border-0`,
                      )}
                      onClick={() => setFilterCategory(filterCategory === slug ? '' : slug)}
                    >
                      {cat.category_name} ({count})
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {visibleBookResults.length > 0 && (
              <div className="space-y-3">
                {contentFilter === 'all' && (
                  <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="size-4" />
                    教科書
                  </h2>
                )}
                {visibleBookResults.map((item, index) => (
                  <Link
                    key={
                      item.kind === 'book'
                        ? `book-${item.bookSlug}`
                        : `chapter-${item.bookSlug}-${item.chapterSlug}`
                    }
                    href={getBookHref(item)}
                    className="block group"
                  >
                    <Card className="transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/5 py-0">
                      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                        <span className="text-xs font-bold text-muted-foreground tabular-nums w-6 text-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[10px] sm:text-xs font-semibold rounded-full px-2 py-0.5 shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                              {item.kind === 'chapter' ? item.bookTitle : '教科書'}
                            </span>
                            {item.kind === 'chapter' && (
                              <span className="text-[10px] text-muted-foreground">章</span>
                            )}
                          </div>
                          <p className="text-foreground font-medium line-clamp-2 text-sm sm:text-base leading-relaxed">
                            {getBookLabel(item)}
                          </p>
                          {getBookSubtext(item) && (
                            <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                              {getBookSubtext(item)}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {visibleQuizResults.length > 0 && (
              <div className="space-y-3">
                {contentFilter === 'all' && visibleBookResults.length > 0 && (
                  <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Search className="size-4" />
                    クイズ
                  </h2>
                )}
                {visibleQuizResults.map((quiz, index) => {
                  const latestAnswer = getLatestAnswer(quiz.id);
                  const color = getCategoryColor(quiz.categorySlug);
                  return (
                    <Link
                      key={`${quiz.categorySlug}-${quiz.id}`}
                      href={`/quiz/${quiz.categorySlug}/${quiz.id}`}
                      className="block group"
                    >
                      <Card className="transition-colors hover:border-primary/40 hover:bg-primary/5 py-0">
                        <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                          <span className="text-xs font-bold text-muted-foreground tabular-nums w-6 text-center shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span
                                className={cn(
                                  'text-[10px] sm:text-xs font-semibold rounded-full px-2 py-0.5 shrink-0',
                                  color.badge,
                                  color.text,
                                )}
                              >
                                {quiz.categoryName}
                              </span>
                            </div>
                            <p className="text-foreground font-medium line-clamp-2 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                              {quiz.question}
                            </p>
                            {quiz.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {quiz.tags.map((t) => (
                                  <span key={t.id} className="text-xs text-muted-foreground">
                                    #{t.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {latestAnswer ? (
                              latestAnswer.isCorrect ? (
                                <CircleCheck className="size-5 text-green-500" />
                              ) : (
                                <CircleX className="size-5 text-red-500" />
                              )
                            ) : null}
                            <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}

            {visibleCount === 0 && (
              <div className="text-center py-16 border-2 border-dashed rounded-md">
                <Search className="size-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium mb-1">
                  該当するコンテンツが見つかりませんでした
                </p>
                <p className="text-sm text-muted-foreground">
                  別のキーワードで検索してみてください
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasSearched && (
        <div className="space-y-8">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">カテゴリから探す</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const color = getCategoryColor(cat.slug);
                return (
                  <Link
                    key={cat.id}
                    href={`/quiz/${cat.slug}`}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50',
                      color.text,
                    )}
                  >
                    <span className={cn('size-2 rounded-full shrink-0', color.badge)} />
                    {cat.category_name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">教科書から探す</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {books.map((book) => (
                <Link
                  key={book.bookSlug}
                  href={`/books/${book.bookSlug}`}
                  className="flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-emerald-500/5 hover:border-emerald-400/30 text-emerald-800 dark:text-emerald-300"
                >
                  <BookOpen className="size-4 shrink-0 opacity-70" />
                  <span className="line-clamp-1">{book.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
