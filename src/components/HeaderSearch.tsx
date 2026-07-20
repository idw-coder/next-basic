"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CornerDownLeft,
  FileText,
  Hash,
  Loader2,
  ListChecks,
  Search,
  Tags,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface HeaderSearchBook {
  bookSlug: string;
  title: string;
  description: string;
}

interface Category {
  id: number;
  slug: string;
  category_name: string;
  quiz_count?: number;
}

interface SearchBookHit {
  kind: "book";
  bookSlug: string;
  bookTitle: string;
  description: string;
}

interface SearchChapterHit {
  kind: "chapter";
  bookSlug: string;
  chapterSlug: string;
  bookTitle: string;
  title: string;
  description?: string;
}

type SearchBookResult = SearchBookHit | SearchChapterHit;

interface SearchQuizResult {
  id: number;
  question: string;
  categorySlug: string;
  categoryName: string;
  tags: { id: number; name: string; slug: string }[];
}

interface BootstrapResponse {
  categories: Category[];
  suggestedKeywords: string[];
  books?: HeaderSearchBook[];
}

interface SearchResponse {
  bookResults: SearchBookResult[];
  quizResults: SearchQuizResult[];
}

interface HeaderSearchProps {
  books: HeaderSearchBook[];
  className?: string;
}

const FALLBACK_KEYWORDS = [
  "JavaScript",
  "React",
  "CSS",
  "TypeScript",
  "Next.js",
  "SQL",
  "Git",
  "AWS",
];

const FALLBACK_CATEGORIES: Category[] = [
  { id: -1, slug: "javascript-basic", category_name: "JavaScript" },
  { id: -2, slug: "react-basic", category_name: "React" },
  { id: -3, slug: "css-basic", category_name: "CSS" },
  { id: -4, slug: "ts-general", category_name: "TypeScript" },
  { id: -5, slug: "nextjs", category_name: "Next.js" },
  { id: -6, slug: "sql-basic", category_name: "SQL" },
];

type SearchCandidate = {
  key: string;
  href: string;
  group: "book" | "quiz" | "all";
  typeLabel: string;
  title: string;
  subtext?: string;
  icon: "book" | "chapter" | "quiz" | "all";
};

function getBookHref(item: SearchBookResult): string {
  if (item.kind === "book") return `/books/${item.bookSlug}`;
  return `/books/${item.bookSlug}/${item.chapterSlug}`;
}

function getBookTitle(item: SearchBookResult): string {
  if (item.kind === "book") return item.bookTitle;
  return item.title;
}

function getBookSubtext(item: SearchBookResult): string {
  if (item.kind === "book") return item.description;
  return item.description ?? item.bookTitle;
}

function CandidateIcon({ type }: { type: SearchCandidate["icon"] }) {
  if (type === "quiz") return <Hash className="size-4" />;
  if (type === "chapter") return <FileText className="size-4" />;
  if (type === "all") return <ArrowRight className="size-4" />;
  return <BookOpen className="size-4" />;
}

export default function HeaderSearch({ books, className }: HeaderSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shortcutLabel, setShortcutLabel] = useState("⌘K");
  const [bootstrap, setBootstrap] = useState<BootstrapResponse | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse>({
    bookResults: [],
    quizResults: [],
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const displayBooks = bootstrap?.books?.length ? bootstrap.books : books;
  const displayKeywords = bootstrap?.suggestedKeywords?.length
    ? bootstrap.suggestedKeywords
    : FALLBACK_KEYWORDS;
  const displayCategories = bootstrap?.categories?.length
    ? bootstrap.categories
    : FALLBACK_CATEGORIES;

  const candidates = useMemo<SearchCandidate[]>(() => {
    if (!hasQuery) return [];

    const bookCandidates = searchResults.bookResults.slice(0, 6).map((item) => ({
      key:
        item.kind === "book"
          ? `book-${item.bookSlug}`
          : `chapter-${item.bookSlug}-${item.chapterSlug}`,
      href: getBookHref(item),
      group: "book" as const,
      typeLabel: item.kind === "book" ? "教科書" : "章",
      title: getBookTitle(item),
      subtext: getBookSubtext(item),
      icon: item.kind === "book" ? ("book" as const) : ("chapter" as const),
    }));

    const quizCandidates = searchResults.quizResults.slice(0, 6).map((quiz) => ({
      key: `quiz-${quiz.categorySlug}-${quiz.id}`,
      href: `/quiz/${quiz.categorySlug}/${quiz.id}`,
      group: "quiz" as const,
      typeLabel: quiz.categoryName || "クイズ",
      title: quiz.question,
      subtext:
        quiz.tags.length > 0
          ? quiz.tags.slice(0, 3).map((tag) => `#${tag.name}`).join(" ")
          : undefined,
      icon: "quiz" as const,
    }));

    return [
      ...bookCandidates,
      ...quizCandidates,
      {
        key: "search-all",
        href: `/search?q=${encodeURIComponent(trimmedQuery)}`,
        group: "all" as const,
        typeLabel: "検索ページ",
        title: `「${trimmedQuery}」の検索結果をすべて見る`,
        icon: "all" as const,
      },
    ];
  }, [hasQuery, searchResults, trimmedQuery]);

  const openSearch = useCallback(() => setOpen(true), []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSearchResults({ bookResults: [], quizResults: [] });
    setActiveIndex(0);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      router.push(href);
      closeSearch();
    },
    [router, closeSearch],
  );

  useEffect(() => {
    setMounted(true);
    if (!/Mac|iPhone|iPad/i.test(window.navigator.userAgent)) {
      setShortcutLabel("Ctrl K");
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || bootstrap) return;
    let cancelled = false;
    fetch("/next-api/site-search")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BootstrapResponse | null) => {
        if (data && !cancelled) setBootstrap(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bootstrap, open]);

  useEffect(() => {
    if (!open) return;
    if (!trimmedQuery) {
      setSearchResults({ bookResults: [], quizResults: [] });
      setSearching(false);
      setSearchError(false);
      setActiveIndex(0);
      return;
    }

    setSearching(true);
    setSearchError(false);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/next-api/site-search?q=${encodeURIComponent(trimmedQuery)}`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`site-search failed: ${res.status}`);
          return res.json();
        })
        .then((data: SearchResponse) => {
          setSearchResults({
            bookResults: data.bookResults ?? [],
            quizResults: data.quizResults ?? [],
          });
          setActiveIndex(0);
          setSearching(false);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setSearchResults({ bookResults: [], quizResults: [] });
          setSearchError(true);
          setSearching(false);
        });
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, trimmedQuery]);

  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, candidates]);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }
    if (event.key === "ArrowDown" && candidates.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % candidates.length);
      return;
    }
    if (event.key === "ArrowUp" && candidates.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + candidates.length) % candidates.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (!hasQuery) return;
      const target = candidates[activeIndex] ?? candidates[candidates.length - 1];
      if (target) navigateTo(target.href);
    }
  };

  const renderCandidate = (candidate: SearchCandidate, index: number) => {
    const active = index === activeIndex;
    return (
      <Link
        key={candidate.key}
        href={candidate.href}
        data-active={active}
        onClick={closeSearch}
        onMouseMove={() => setActiveIndex(index)}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
          candidate.group === "all"
            ? "font-bold text-brand-blue"
            : "text-ink-body",
          active ? "bg-brand-blue text-white" : "hover:bg-cream-deep",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg border",
            active
              ? "border-white/25 bg-white/15 text-white"
              : "border-ink/10 bg-white text-ink-muted",
          )}
        >
          <CandidateIcon type={candidate.icon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {candidate.title}
          </span>
          {candidate.subtext && (
            <span
              className={cn(
                "mt-0.5 block truncate text-xs font-medium",
                active ? "text-white/75" : "text-ink-muted",
              )}
            >
              {candidate.subtext}
            </span>
          )}
        </span>
        <span
          className={cn(
            "hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:block",
            active ? "bg-white/15 text-white/90" : "bg-cream-deep text-ink-muted",
          )}
        >
          {candidate.typeLabel}
        </span>
        {active && <CornerDownLeft className="size-3.5 shrink-0 text-white/80" />}
      </Link>
    );
  };

  const bookCandidates = candidates.filter((c) => c.group === "book");
  const quizCandidates = candidates.filter((c) => c.group === "quiz");
  const allCandidate = candidates.find((c) => c.group === "all");
  const hasResults = bookCandidates.length > 0 || quizCandidates.length > 0;

  return (
    <div className={cn("flex items-center", className)}>
      {/* デスクトップ: 検索ボックス風トリガー */}
      <button
        type="button"
        onClick={openSearch}
        className="hidden h-10 w-full max-w-xs items-center gap-2.5 rounded-lg border border-ink/10 bg-white/75 px-3 text-left text-sm font-medium text-ink-muted transition-colors hover:border-brand-blue/35 hover:bg-white hover:text-brand-blue md:flex lg:max-w-sm"
        aria-label="問題・教科書を検索"
      >
        <Search className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">問題・教科書を検索</span>
        <kbd className="shrink-0 rounded border border-ink/10 bg-cream-soft px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
          {shortcutLabel}
        </kbd>
      </button>

      {/* モバイル: アイコンのみのトリガー */}
      <button
        type="button"
        onClick={openSearch}
        className="flex size-10 items-center justify-center text-ink transition-colors hover:text-brand-blue md:hidden"
        aria-label="問題・教科書を検索"
      >
        <Search className="size-5" />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[100]">
            <div
              className="fixed inset-0 bg-ink/30 backdrop-blur-sm"
              aria-hidden="true"
              onClick={closeSearch}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="サイト内検索"
              className="fixed inset-x-0 top-0 mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-cream-soft sm:top-[8vh] sm:h-auto sm:max-h-[72vh] sm:w-[min(680px,calc(100vw-2rem))] sm:rounded-2xl sm:border sm:border-cream-line sm:shadow-[0_32px_80px_rgba(35,35,35,0.25)]"
            >
              {/* 入力行 */}
              <div className="flex shrink-0 items-center gap-3 border-b border-cream-line px-4 py-3">
                {searching ? (
                  <Loader2 className="size-5 shrink-0 animate-spin text-brand-blue" />
                ) : (
                  <Search className="size-5 shrink-0 text-ink-muted" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="問題・教科書を検索"
                  aria-label="問題・教科書を検索"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-9 min-w-0 flex-1 bg-transparent text-base font-medium text-ink outline-none placeholder:text-ink-muted"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="shrink-0 text-sm font-bold text-ink-muted transition-colors hover:text-brand-blue sm:hidden"
                >
                  キャンセル
                </button>
                <kbd className="hidden shrink-0 rounded border border-ink/10 bg-cream-deep px-1.5 py-0.5 text-[10px] font-bold text-ink-muted sm:block">
                  esc
                </kbd>
              </div>

              {/* 結果エリア */}
              <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                {hasQuery ? (
                  <>
                    {hasResults && (
                      <div className="space-y-4">
                        {bookCandidates.length > 0 && (
                          <div>
                            <p className="mb-1 flex items-center gap-1.5 px-3 text-xs font-black text-ink-muted">
                              <BookOpen className="size-3.5" />
                              教科書
                            </p>
                            {bookCandidates.map((candidate) =>
                              renderCandidate(candidate, candidates.indexOf(candidate)),
                            )}
                          </div>
                        )}
                        {quizCandidates.length > 0 && (
                          <div>
                            <p className="mb-1 flex items-center gap-1.5 px-3 text-xs font-black text-ink-muted">
                              <ListChecks className="size-3.5" />
                              クイズ
                            </p>
                            {quizCandidates.map((candidate) =>
                              renderCandidate(candidate, candidates.indexOf(candidate)),
                            )}
                          </div>
                        )}
                        {allCandidate &&
                          renderCandidate(allCandidate, candidates.indexOf(allCandidate))}
                      </div>
                    )}
                    {!hasResults && !searching && (
                      <div className="px-4 py-10 text-center">
                        <p className="text-sm font-bold text-ink">
                          {searchError
                            ? "検索に失敗しました"
                            : `「${trimmedQuery}」に一致するコンテンツが見つかりません`}
                        </p>
                        <p className="mt-1 text-xs font-medium text-ink-muted">
                          {searchError
                            ? "通信に問題があるようです。検索ページから試してみてください"
                            : "キーワードを変えるか、検索ページで絞り込んでみてください"}
                        </p>
                        {allCandidate && (
                          <div className="mt-4">
                            {renderCandidate(allCandidate, candidates.indexOf(allCandidate))}
                          </div>
                        )}
                      </div>
                    )}
                    {!hasResults && searching && (
                      <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm font-medium text-ink-muted">
                        <Loader2 className="size-4 animate-spin" />
                        検索中…
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-5 p-1">
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 px-2 text-xs font-black text-ink-muted">
                        <Tags className="size-3.5" />
                        人気のキーワード
                      </p>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {displayKeywords.slice(0, 10).map((keyword) => (
                          <button
                            key={keyword}
                            type="button"
                            onClick={() => setQuery(keyword)}
                            className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-bold text-ink-body transition-colors hover:border-brand-blue/35 hover:text-brand-blue"
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 flex items-center gap-1.5 px-2 text-xs font-black text-ink-muted">
                        <ListChecks className="size-3.5" />
                        クイズをカテゴリから探す
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {displayCategories.slice(0, 8).map((category) => (
                          <Link
                            key={category.slug}
                            href={`/quiz/${category.slug}`}
                            onClick={closeSearch}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink-body transition-colors hover:bg-cream-deep hover:text-brand-blue"
                          >
                            <Hash className="size-3.5 shrink-0 text-ink-muted" />
                            <span className="truncate">{category.category_name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 flex items-center gap-1.5 px-2 text-xs font-black text-ink-muted">
                        <BookOpen className="size-3.5" />
                        教科書から探す
                      </p>
                      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                        {displayBooks.slice(0, 8).map((book) => (
                          <Link
                            key={book.bookSlug}
                            href={`/books/${book.bookSlug}`}
                            onClick={closeSearch}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink-body transition-colors hover:bg-cream-deep hover:text-brand-blue"
                          >
                            <BookOpen className="size-3.5 shrink-0 text-ink-muted" />
                            <span className="truncate">{book.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* フッター（キー操作ヒント） */}
              <div className="hidden shrink-0 items-center gap-4 border-t border-cream-line bg-cream-deep/55 px-4 py-2.5 text-[11px] font-bold text-ink-muted sm:flex">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-ink/10 bg-white px-1 py-0.5">↑</kbd>
                  <kbd className="rounded border border-ink/10 bg-white px-1 py-0.5">↓</kbd>
                  移動
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-ink/10 bg-white px-1 py-0.5">↵</kbd>
                  開く
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-ink/10 bg-white px-1 py-0.5">esc</kbd>
                  閉じる
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
