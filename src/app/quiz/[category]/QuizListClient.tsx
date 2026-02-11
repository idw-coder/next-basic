"use client";

import { useTransition, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Quiz, Tag } from "./page";

interface QuizListClientProps {
  initialQuizzes: Quiz[];
  tags: Tag[];
  categorySlug: string;
  currentQuery?: string;
  currentTagSlug?: string;
}

export default function QuizListClient({
  initialQuizzes,
  tags,
  categorySlug,
  currentQuery = "",
  currentTagSlug = "",
}: QuizListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ローカルの入力状態（タイピングのラグを防ぐため）
  const [inputValue, setInputValue] = useState(currentQuery);

  // URLを更新する共通関数
  const updateFilters = (q: string, tagSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (q) params.set("q", q);
    else params.delete("q");
    
    if (tagSlug) params.set("tagSlug", tagSlug);
    else params.delete("tagSlug");

    // URLを更新（サーバーコンポーネントが再実行される）
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // 検索入力のデバウンス処理
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== currentQuery) {
        updateFilters(inputValue, currentTagSlug);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className={cn("space-y-6", isPending && "opacity-60 pointer-events-none transition-opacity")}>
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
            variant={!currentTagSlug ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => updateFilters(inputValue, "")}
          >
            すべて
          </Badge>
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={currentTagSlug === tag.slug ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => updateFilters(inputValue, tag.slug)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* 結果表示 */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          {isPending ? (
            "読み込み中..."
          ) : (
            <>
              該当件数
              <Badge variant="secondary">{initialQuizzes.length}</Badge>
              件
            </>
          )}
        </p>
        
        {initialQuizzes.length > 0 ? (
          initialQuizzes.map((quiz, index) => (
            <Link key={quiz.id} href={`/quiz/${categorySlug}/${quiz.id}`} className="block">
              <Card className={"transition-colors hover:border-blue-500/40 hover:bg-blue-400/10 py-0"}>
                <CardContent className="flex items-center gap-4 p-2 sm:p-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "size-6 sm:size-8 shrink-0 rounded-md p-0 flex items-center justif-center sfont-bold border-0 text-white",
                      index % 2 === 0 ? "bg-blue-600" : "bg-blue-500"
                    )}
                  >
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium mb-1 line-clamp-2 text-sm sm:text-bases">{quiz.question}</p>
                    <div className="flex flex-wrap gap-1">
                      {quiz.tags.map((t) => (
                        <span key={t.id} className="text-xs text-blue-700/80 dark:text-blue-300/80">#{t.name}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">該当する問題がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}