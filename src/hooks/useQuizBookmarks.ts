// TODO: ログインユーザー向けサーバー同期を追加する
// - useQuizHistory と同様に api.post/get でDB保存・取得
// - syncLocalBookmarksToServer() でログイン時にlocalStorage→DB一括同期
// - toggleBookmark / removeBookmark 時に isLoggedIn() なら api.post で即時同期
// - API: POST /api/quiz/bookmarks, GET /api/quiz/bookmarks, DELETE /api/quiz/bookmarks/:quizId

"use client";

import { useState, useCallback, useEffect } from "react";

export interface QuizBookmark {
  quizId: number;
  categoryId: number;
  categorySlug: string;
  question: string;
  bookmarkedAt: string;
}

const STORAGE_KEY = "quiz_bookmarks";

function loadFromStorage(): QuizBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as QuizBookmark[];
  } catch {
    return [];
  }
}

function saveToStorage(bookmarks: QuizBookmark[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // ignore
  }
}

export function useQuizBookmarks() {
  const [bookmarks, setBookmarks] = useState<QuizBookmark[]>([]);

  useEffect(() => {
    setBookmarks(loadFromStorage());
  }, []);

  const isBookmarked = useCallback(
    (quizId: number): boolean => bookmarks.some((b) => b.quizId === quizId),
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (quizId: number, categoryId: number, categorySlug: string, question: string): void => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.quizId === quizId);
        const updated = exists
          ? prev.filter((b) => b.quizId !== quizId)
          : [
              ...prev,
              {
                quizId,
                categoryId,
                categorySlug,
                question,
                bookmarkedAt: new Date().toISOString(),
              },
            ];
        saveToStorage(updated);
        return updated;
      });
    },
    [],
  );

  const removeBookmark = useCallback((quizId: number): void => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.quizId !== quizId);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearBookmarks = useCallback((): void => {
    setBookmarks([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearBookmarks,
  };
}
