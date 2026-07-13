'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, Menu, Search, X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState, useRef, useTransition, useCallback, useEffect } from 'react';
import { searchInBook, type InBookSearchResult } from '../_actions/searchInBook';
import { BOOK_SEARCH_SUGGESTIONS } from '../_constants/searchSuggestions';

interface Chapter {
  title: string;
  order: number;
  bookSlug: string;
  chapterSlug: string;
  draft?: boolean;
}

interface BookSidebarProps {
  bookTitle: string;
  bookSlug: string;
  chapters: Chapter[];
}

function SidebarSearch({
  bookSlug,
  searchPosition,
  onResults,
}: {
  bookSlug: string;
  searchPosition: { index: number; total: number } | null;
  onResults: (results: InBookSearchResult[] | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [matchInfo, setMatchInfo] = useState<{ count: number; index: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const suggestions = BOOK_SEARCH_SUGGESTIONS[bookSlug] ?? [];
  const showSuggestions = isFocused && query.trim().length === 0 && suggestions.length > 0;

  const clearAll = useCallback(() => {
    setQuery('');
    setMatchInfo(null);
    onResults(null);
    document.dispatchEvent(new CustomEvent('book-search-query', { detail: { query: '' } }));
  }, [onResults]);

  const doSearch = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (value.trim().length < 2) {
        setMatchInfo(null);
        onResults(null);
        document.dispatchEvent(new CustomEvent('book-search-query', { detail: { query: '' } }));
        return;
      }
      timerRef.current = setTimeout(() => {
        document.dispatchEvent(
          new CustomEvent('book-search-query', { detail: { query: value.trim() } }),
        );
        startTransition(async () => {
          const results = await searchInBook(bookSlug, value);
          onResults(results);
        });
      }, 300);
    },
    [bookSlug, onResults],
  );

  const selectSuggestion = useCallback(
    (value: string) => {
      setQuery(value);
      setIsFocused(false);
      doSearch(value);
    },
    [doSearch],
  );

  useEffect(() => {
    const clearHandler = () => {
      setQuery('');
      setMatchInfo(null);
      onResults(null);
    };
    const matchHandler = (e: Event) => {
      const { count, index } = (e as CustomEvent<{ count: number; index: number }>).detail;
      setMatchInfo(count > 0 ? { count, index } : null);
    };
    document.addEventListener('book-search-clear', clearHandler);
    document.addEventListener('book-search-matches', matchHandler);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('book-search-clear', clearHandler);
      document.removeEventListener('book-search-matches', matchHandler);
    };
  }, [onResults]);

  return (
    <div className="mb-3">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={query}
          autoFocus={false}
          tabIndex={-1}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setQuery(e.target.value);
            doSearch(e.target.value);
          }}
          placeholder="この本の中を検索…"
          className={cn(
            'w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-7 pr-7 text-xs',
            'placeholder:text-gray-400 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20',
            isPending && 'opacity-70',
          )}
        />
        {query && (
          <button
            onClick={clearAll}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {showSuggestions && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((term) => (
            <button
              key={term}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectSuggestion(term)}
              className={cn(
                'rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600 transition-colors',
                'hover:border-primary/30 hover:bg-primary/5 hover:text-primary',
              )}
            >
              {term}
            </button>
          ))}
        </div>
      )}
      {matchInfo && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
          <span>
            ページ内{' '}
            <span className="tabular-nums">
              {matchInfo.index + 1}/{matchInfo.count}
            </span>
          </span>
          {searchPosition && searchPosition.total > 1 && (
            <span>
              ・一致章{' '}
              <span className="tabular-nums">
                {searchPosition.index + 1}/{searchPosition.total}
              </span>
            </span>
          )}
          <button
            onClick={() =>
              document.dispatchEvent(
                new CustomEvent('book-search-nav', { detail: { direction: 'prev' } }),
              )
            }
            className="rounded p-0.5 hover:bg-gray-100"
            aria-label="前の一致箇所。ページ先頭では前の一致章へ移動"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() =>
              document.dispatchEvent(
                new CustomEvent('book-search-nav', { detail: { direction: 'next' } }),
              )
            }
            className="rounded p-0.5 hover:bg-gray-100"
            aria-label="次の一致箇所。ページ末尾では次の一致章へ移動"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  bookTitle,
  bookSlug,
  chapters,
  onNavigate,
}: BookSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<InBookSearchResult[] | null>(null);

  const isSearching = searchResults !== null;
  const matchedSlugs = isSearching ? new Set(searchResults.map((r) => r.chapterSlug)) : null;
  const snippetMap = isSearching
    ? new Map(searchResults.filter((r) => r.snippet).map((r) => [r.chapterSlug, r.snippet]))
    : null;
  const currentChapterSlug = pathname.split('/').pop();
  const currentSearchResultIndex =
    searchResults?.findIndex((result) => result.chapterSlug === currentChapterSlug) ?? -1;
  const searchPosition =
    searchResults && currentSearchResultIndex >= 0
      ? { index: currentSearchResultIndex, total: searchResults.length }
      : null;

  useEffect(() => {
    const handleBoundary = (e: Event) => {
      if (!searchResults || searchResults.length === 0) return;

      const { direction } = (e as CustomEvent<{ direction: 'next' | 'prev' }>).detail;
      const currentIndex = searchResults.findIndex(
        (result) => result.chapterSlug === currentChapterSlug,
      );
      const baseIndex = currentIndex === -1 ? (direction === 'next' ? -1 : 0) : currentIndex;
      const targetIndex =
        direction === 'next'
          ? (baseIndex + 1) % searchResults.length
          : (baseIndex - 1 + searchResults.length) % searchResults.length;
      const target = searchResults[targetIndex];

      if (!target || target.chapterSlug === currentChapterSlug) return;

      sessionStorage.setItem(
        'book-search-target-position',
        direction === 'next' ? 'first' : 'last',
      );
      router.push(`/books/${bookSlug}/${target.chapterSlug}`);
    };

    document.addEventListener('book-search-boundary', handleBoundary);
    return () => document.removeEventListener('book-search-boundary', handleBoundary);
  }, [bookSlug, currentChapterSlug, pathname, router, searchResults]);

  return (
    <nav className="flex flex-col">
      <Link
        href={`/books/${bookSlug}`}
        className="mb-4 text-sm font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2"
        onClick={onNavigate}
      >
        {bookTitle}
      </Link>
      <SidebarSearch
        bookSlug={bookSlug}
        searchPosition={searchPosition}
        onResults={setSearchResults}
      />
      {isSearching && searchResults.length === 0 && (
        <p className="px-2.5 py-2 text-xs text-gray-400">一致する章が見つかりませんでした</p>
      )}
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-400">
        <BookOpen className="h-3.5 w-3.5" />
        本の目次（全{chapters.length}章）
      </p>
      <ol className="flex flex-col gap-0.5">
        {chapters.map((chapter) => {
          if (matchedSlugs && !matchedSlugs.has(chapter.chapterSlug)) return null;
          const href = `/books/${bookSlug}/${chapter.chapterSlug}`;
          const isActive = pathname === href;
          const snippet = snippetMap?.get(chapter.chapterSlug);
          return (
            <li key={chapter.chapterSlug}>
              <Link
                href={href}
                onClick={onNavigate}
                className={cn(
                  'flex flex-col gap-0.5 rounded-xs px-2.5 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <span className="flex items-start gap-2.5">
                  <span className="shrink-0 text-xs font-mono mt-0.5 text-gray-400 w-4 text-right">
                    {chapter.order}
                  </span>
                  <span className="line-clamp-2">
                    {chapter.title}
                    {chapter.draft && (
                      <span className="ml-1.5 inline-block rounded-full bg-gray-200 px-1.5 py-px align-middle text-[10px] font-medium text-gray-500">
                        執筆中
                      </span>
                    )}
                  </span>
                </span>
                {snippet && (
                  <span className="ml-6.5 w-fit rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    {snippet}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BookSidebarDesktop(props: BookSidebarProps) {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-[7.5rem] max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 pb-8">
        <SidebarContent {...props} />
      </div>
    </aside>
  );
}

export function BookSidebarMobile(props: BookSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors">
            <Menu className="h-5 w-5" />
            <span className="sr-only">本の目次を開く</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b">
            <SheetTitle className="text-sm">本の目次</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto p-4">
            <SidebarContent {...props} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
