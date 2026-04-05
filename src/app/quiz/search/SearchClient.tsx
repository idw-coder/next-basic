"use client";

import { useTransition, useEffect, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  CircleCheck,
  CircleX,
  Loader2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuizHistory } from "@/hooks/useQuizHistory";
import type { SearchQuiz } from "./page";

interface Category {
  id: number;
  slug: string;
  category_name: string;
}

interface SearchClientProps {
  initialResults: SearchQuiz[];
  categories: Category[];
  currentQuery: string;
  suggestedKeywords: string[];
}

const CATEGORY_COLORS: Record<string, { badge: string; text: string }> = {
  "html-basic": {
    badge: "bg-orange-100 dark:bg-orange-500/20",
    text: "text-orange-700 dark:text-orange-300",
  },
  "css-basic": {
    badge: "bg-blue-100 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
  },
  "javascript-basic": {
    badge: "bg-amber-100 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
  },
  "react-basic": {
    badge: "bg-cyan-100 dark:bg-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  "vue-basic": {
    badge: "bg-emerald-100 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  "nodejs-basic": {
    badge: "bg-green-100 dark:bg-green-500/20",
    text: "text-green-700 dark:text-green-300",
  },
  "aws-basic": {
    badge: "bg-amber-100 dark:bg-amber-600/20",
    text: "text-amber-800 dark:text-amber-300",
  },
  "git-basic": {
    badge: "bg-rose-100 dark:bg-rose-600/20",
    text: "text-rose-700 dark:text-rose-300",
  },
  "nginx-basic": {
    badge: "bg-teal-100 dark:bg-teal-500/20",
    text: "text-teal-700 dark:text-teal-300",
  },
  "ts-general": {
    badge: "bg-indigo-100 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  "security-general": {
    badge: "bg-red-100 dark:bg-red-500/20",
    text: "text-red-700 dark:text-red-300",
  },
  "cs-basic": {
    badge: "bg-purple-100 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-300",
  },
  "nextjs": {
    badge: "bg-slate-100 dark:bg-slate-500/20",
    text: "text-slate-700 dark:text-slate-300",
  },
  "docker": {
    badge: "bg-sky-100 dark:bg-sky-500/20",
    text: "text-sky-700 dark:text-sky-300",
  },
  "linux": {
    badge: "bg-lime-100 dark:bg-lime-500/20",
    text: "text-lime-700 dark:text-lime-300",
  },
};

function getCategoryColor(slug: string) {
  return (
    CATEGORY_COLORS[slug] || {
      badge: "bg-gray-100 dark:bg-gray-500/20",
      text: "text-gray-700 dark:text-gray-300",
    }
  );
}

export default function SearchClient({
  initialResults,
  categories,
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

  const categoryCounts = initialResults.reduce<Record<string, number>>(
    (acc, quiz) => {
      acc[quiz.categorySlug] = (acc[quiz.categorySlug] || 0) + 1;
      return acc;
    },
    {}
  );

  const [filterCategory, setFilterCategory] = useState<string>("");
  const filteredResults = filterCategory
    ? initialResults.filter((q) => q.categorySlug === filterCategory)
    : initialResults;

  const updateSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== currentQuery) {
        setFilterCategory("");
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
    setFilterCategory("");
    updateSearch(keyword);
    inputRef.current?.focus();
  };

  const clearInput = () => {
    setInputValue("");
    setFilterCategory("");
    updateSearch("");
    inputRef.current?.focus();
  };

  const matchedCategories = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-8">
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="キーワードで検索（例：Promise, Flexbox, XSS）"
          className="pl-12 pr-20 h-12 text-base rounded-xl border-2 focus-visible:border-primary"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isPending && (
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          )}
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

      {/* おすすめキーワード */}
      {!hasSearched && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            おすすめキーワード
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => handleKeywordClick(keyword)}
                className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm text-foreground hover:bg-primary/5 hover:border-primary/40 transition-colors cursor-pointer"
              >
                <Search className="size-3 mr-1.5 text-muted-foreground" />
                {keyword}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 検索結果 */}
      {hasSearched && (
        <div
          className={cn(
            "space-y-6",
            isPending && "opacity-60 pointer-events-none transition-opacity"
          )}
        >
          {/* 結果サマリー + カテゴリフィルター */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                「<span className="font-medium text-foreground">{currentQuery}</span>
                」の検索結果{" "}
                <Badge variant="secondary" className="ml-1">
                  {initialResults.length}
                </Badge>{" "}
                件
              </p>
            </div>

            {matchedCategories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={!filterCategory ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilterCategory("")}
                >
                  すべて ({initialResults.length})
                </Badge>
                {matchedCategories.map(([slug, count]) => {
                  const cat = categories.find((c) => c.slug === slug);
                  if (!cat) return null;
                  const color = getCategoryColor(slug);
                  return (
                    <Badge
                      key={slug}
                      variant={filterCategory === slug ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer",
                        filterCategory !== slug && `${color.badge} ${color.text} border-0`
                      )}
                      onClick={() =>
                        setFilterCategory(filterCategory === slug ? "" : slug)
                      }
                    >
                      {cat.category_name} ({count})
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* 結果リスト */}
          <div className="space-y-3">
            {filteredResults.length > 0 ? (
              filteredResults.map((quiz, index) => {
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
                                "text-[10px] sm:text-xs font-semibold rounded-full px-2 py-0.5 shrink-0",
                                color.badge,
                                color.text
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
                                <span
                                  key={t.id}
                                  className="text-xs text-muted-foreground"
                                >
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
              })
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-xl">
                <Search className="size-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium mb-1">
                  該当する問題が見つかりませんでした
                </p>
                <p className="text-sm text-muted-foreground">
                  別のキーワードで検索してみてください
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 未検索時: カテゴリリンク */}
      {!hasSearched && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            カテゴリから探す
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {categories.map((cat) => {
              const color = getCategoryColor(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/quiz/${cat.slug}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50",
                    color.text
                  )}
                >
                  <span
                    className={cn("size-2 rounded-full shrink-0", color.badge)}
                  />
                  {cat.category_name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
