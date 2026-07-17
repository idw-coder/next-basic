"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CornerDownLeft,
  FileText,
  Hash,
  Layers3,
  Loader2,
  Search,
  X,
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
  typeLabel: string;
  title: string;
  subtext?: string;
  icon: "book" | "chapter" | "quiz";
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

function candidateIcon(type: SearchCandidate["icon"]) {
  if (type === "quiz") return <Hash className="size-4" />;
  if (type === "chapter") return <FileText className="size-4" />;
  return <BookOpen className="size-4" />;
}

export default function HeaderSearch({ books }: HeaderSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bootstrap, setBootstrap] = useState<BootstrapResponse | null>(null);
  const [loadingBootstrap, setLoadingBootstrap] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse>({
    bookResults: [],
    quizResults: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayBooks = bootstrap?.books?.length ? bootstrap.books : books;
  const displayKeywords = bootstrap?.suggestedKeywords?.length
    ? bootstrap.suggestedKeywords
    : FALLBACK_KEYWORDS;
  const displayCategories = bootstrap?.categories?.length
    ? bootstrap.categories
    : FALLBACK_CATEGORIES;
  const shortcutLabel = "⌘K";

  const candidates = useMemo<SearchCandidate[]>(() => {
    const bookCandidates = searchResults.bookResults.slice(0, 5).map((item) => ({
      key:
        item.kind === "book"
          ? `book-${item.bookSlug}`
          : `chapter-${item.bookSlug}-${item.chapterSlug}`,
      href: getBookHref(item),
      typeLabel: item.kind === "book" ? "教科書" : "章",
      title: getBookTitle(item),
      subtext: getBookSubtext(item),
      icon: item.kind === "book" ? ("book" as const) : ("chapter" as const),
    }));

    const quizCandidates = searchResults.quizResults.slice(0, 5).map((quiz) => ({
      key: `quiz-${quiz.categorySlug}-${quiz.id}`,
      href: `/quiz/${quiz.categorySlug}/${quiz.id}`,
      typeLabel: quiz.categoryName || "クイズ",
      title: quiz.question,
      subtext: quiz.tags.length > 0 ? quiz.tags.slice(0, 3).map((tag) => `#${tag.name}`).join(" ") : "クイズ",
      icon: "quiz" as const,
    }));

    return [...bookCandidates, ...quizCandidates];
  }, [searchResults]);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const openSearch = () => {
    setOpen(true);
  };

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    setSearchResults({ bookResults: [], quizResults: [] });
    setActiveIndex(0);
  };

  const goToSearchPage = () => {
    if (!trimmedQuery) return;
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    closeSearch();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
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
    if (!open || bootstrap || loadingBootstrap) return;
    setLoadingBootstrap(true);
    fetch("/api/site-search")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BootstrapResponse | null) => {
        if (data) setBootstrap(data);
      })
      .finally(() => setLoadingBootstrap(false));
  }, [bootstrap, loadingBootstrap, open]);

  useEffect(() => {
    if (!open) return;
    if (!trimmedQuery) {
      setSearchResults({ bookResults: [], quizResults: [] });
      setIsSearching(false);
      setActiveIndex(0);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/site-search?q=${encodeURIComponent(trimmedQuery)}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: SearchResponse | null) => {
          if (data) {
            setSearchResults({
              bookResults: data.bookResults ?? [],
              quizResults: data.quizResults ?? [],
            });
            setActiveIndex(0);
          }
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setSearchResults({ bookResults: [], quizResults: [] });
        })
        .finally(() => setIsSearching(false));
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, trimmedQuery]);

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
      goToSearchPage();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className="flex w-full items-center gap-2 rounded-lg border border-cream-line bg-white/70 px-3 py-1.5 text-left text-sm text-ink-muted transition-colors hover:border-brand-blue/40 hover:bg-white hover:text-brand-blue"
        aria-label="問題・教科書を検索"
      >
        <Search className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate">問題・教科書を検索</span>
        <kbd className="hidden rounded border border-ink/10 bg-cream-soft px-1.5 py-0.5 text-[10px] font-bold text-ink-muted sm:inline-block">
          {shortcutLabel}
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-ink/35 px-3 py-16 backdrop-blur-sm sm:px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
        >
          <div className="mx-auto flex max-h-[min(720px,calc(100svh-7rem))] max-w-2xl flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_28px_90px_rgba(35,35,35,0.24)]">
            <div className="flex items-center gap-3 border-b border-cream-line px-4 py-3">
              <Search className="size-5 shrink-0 text-ink-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="問題・教科書を検索"
                className="h-10 min-w-0 flex-1 bg-transparent text-base font-medium text-ink outline-none placeholder:text-ink-muted"
              />
              {isSearching && <Loader2 className="size-4 animate-spin text-ink-muted" />}
              <button
                type="button"
                onClick={closeSearch}
                className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-cream-deep hover:text-ink"
                aria-label="検索を閉じる"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              {hasQuery ? (
                <div className="space-y-2">
                  {candidates.length > 0 ? (
                    <>
                      {candidates.map((candidate, index) => (
                        <Link
                          key={candidate.key}
                          href={candidate.href}
                          onClick={closeSearch}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-ink transition-colors",
                            activeIndex === index ? "bg-cream-deep" : "hover:bg-cream-soft",
                          )}
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-ink/10 bg-white text-brand-blue">
                            {candidateIcon(candidate.icon)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="mb-0.5 flex items-center gap-2">
                              <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                                {candidate.typeLabel}
                              </span>
                            </span>
                            <span className="block truncate text-sm font-bold">
                              {candidate.title}
                            </span>
                            {candidate.subtext && (
                              <span className="mt-0.5 block truncate text-xs text-ink-muted">
                                {candidate.subtext}
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={goToSearchPage}
                        className="mt-2 flex w-full items-center justify-between rounded-xl border border-cream-line bg-cream-soft px-3 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand-blue/25 hover:text-brand-blue"
                      >
                        <span>「{trimmedQuery}」のすべての結果を見る</span>
                        <CornerDownLeft className="size-4 text-ink-muted" />
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-10 text-center">
                      <p className="text-sm font-bold text-ink">候補が見つかりませんでした</p>
                      <button
                        type="button"
                        onClick={goToSearchPage}
                        className="mt-3 rounded-full border border-cream-line px-4 py-2 text-xs font-bold text-brand-blue transition-colors hover:bg-cream-soft"
                      >
                        検索結果ページで探す
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <section>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-ink-muted">
                      <Hash className="size-3.5" />
                      人気のタグ
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {displayKeywords.slice(0, 10).map((keyword) => (
                        <button
                          key={keyword}
                          type="button"
                          onClick={() => {
                            setQuery(keyword);
                            inputRef.current?.focus();
                          }}
                          className="rounded-full border border-cream-line bg-cream-soft px-3 py-1.5 text-xs font-bold text-ink-body transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
                        >
                          {keyword}
                        </button>
                      ))}
                      {loadingBootstrap && (
                        <span className="inline-flex items-center gap-2 text-xs text-ink-muted">
                          <Loader2 className="size-3.5 animate-spin" />
                          読み込み中
                        </span>
                      )}
                    </div>
                  </section>

                  <section>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-ink-muted">
                      <Layers3 className="size-3.5" />
                      主要カテゴリ
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {displayCategories.slice(0, 6).map((category) => (
                        <Link
                          key={category.id}
                          href={`/quiz/${category.slug}`}
                          onClick={closeSearch}
                          className="rounded-lg border border-cream-line px-3 py-2 text-sm font-bold text-ink transition-colors hover:border-brand-blue/25 hover:bg-cream-soft hover:text-brand-blue"
                        >
                          <span className="block truncate">{category.category_name}</span>
                          {category.quiz_count != null && (
                            <span className="mt-0.5 block text-xs font-medium text-ink-muted">
                              {category.quiz_count}問
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-ink-muted">
                      <BookOpen className="size-3.5" />
                      おすすめ教科書
                    </div>
                    <div className="space-y-1">
                      {displayBooks.slice(0, 5).map((book) => (
                        <Link
                          key={book.bookSlug}
                          href={`/books/${book.bookSlug}`}
                          onClick={closeSearch}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-ink transition-colors hover:bg-cream-soft hover:text-brand-blue"
                        >
                          <BookOpen className="size-4 shrink-0 text-brand-blue" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold">{book.title}</span>
                            <span className="block truncate text-xs text-ink-muted">
                              {book.description}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
