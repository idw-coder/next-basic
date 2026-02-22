"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";

export interface QuizAnswer {
  quizId: number;
  categoryId: number;
  isCorrect: boolean;
  answeredAt: string;
}

interface QuizHistoryData {
  answers: QuizAnswer[];
}

const STORAGE_KEY = "quiz_history";

function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

/**
 * localStorageから履歴を読み込み、QuizAnswer[]を返す
 */
function loadFromStorage(): QuizAnswer[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data: QuizHistoryData = JSON.parse(stored);
    return data.answers || [];
  } catch (error) {
    console.error("Failed to load quiz history:", error);
    return [];
  }
}

/**
 * localStorageに履歴を保存する
 */
function saveToStorage(answers: QuizAnswer[]): void {
  if (typeof window === "undefined") return;
  try {
    const data: QuizHistoryData = { answers };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save quiz history:", error);
  }
}

/** 
 * ログイン直後にlocalStorageの履歴をDBへ一括同期し、成功したらlocalStorageをクリア 
 */
export async function syncLocalHistoryToServer(): Promise<void> {
  const local = loadFromStorage();
  if (local.length === 0) return;

  try {
    await api.post("/api/quiz/history/sync", { answers: local });
    // 同期が成功したらlocalStorageをクリア
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to sync quiz history:", error);
  }
}

/**
 * @returns 
 * answers: QuizAnswer[]: クイズ回答履歴, 
 * addAnswer: (quizId: number, categoryId: number, isCorrect: boolean) => void: クイズ回答を追加, 
 * getLatestAnswer: (quizId: number) => QuizAnswer | null: 特定クイズの最新回答を取得, 
 * getAnswerHistory: (quizId: number) => QuizAnswer[]: 特定クイズの全回答履歴を取得, 
 * getCategoryStats: (categoryId: number) => { total: number, correct: number, incorrect: number }: 特定カテゴリの統計情報を取得, 
 * clearHistory: () => void: ローカルストレージのクイズ回答履歴をすべてクリア
 */
export function useQuizHistory() {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  /**
   * クライアントマウント時に localStorage から読み込む
   */
  useEffect(() => {
    setAnswers(loadFromStorage());
  }, []);

  const addAnswer = useCallback(
    (quizId: number, categoryId: number, isCorrect: boolean): void => {
      const newAnswer: QuizAnswer = {
        quizId,
        categoryId,
        isCorrect,
        answeredAt: new Date().toISOString(),
      };

      setAnswers((prev) => {
        const updated = [...prev, newAnswer];
        saveToStorage(updated);
        return updated;
      });

      if (isLoggedIn()) {
        api
          .post("/api/quiz/history", newAnswer)
          .catch((err) => console.error("Failed to save answer to server:", err));
      }
    },
    []
  );

  /** 特定クイズの最新回答を取得 */
  const getLatestAnswer = useCallback(
    (quizId: number): QuizAnswer | null => {
      const filtered = answers.filter((a) => a.quizId === quizId);
      return filtered.length > 0 ? filtered[filtered.length - 1] : null;
    },
    [answers]
  );

  /** 特定クイズの全回答履歴を取得 */
  const getAnswerHistory = useCallback(
    (quizId: number): QuizAnswer[] => {
      return answers.filter((a) => a.quizId === quizId);
    },
    [answers]
  );

  /** 特定カテゴリの統計情報 */
  const getCategoryStats = useCallback(
    (categoryId: number) => {
      const categoryAnswers = answers.filter(
        (a) => a.categoryId === categoryId
      );
      const latestByQuiz = new Map<number, QuizAnswer>();
      categoryAnswers.forEach((a) => latestByQuiz.set(a.quizId, a));

      const total = latestByQuiz.size;
      const correct = Array.from(latestByQuiz.values()).filter(
        (a) => a.isCorrect
      ).length;

      return { total, correct, incorrect: total - correct };
    },
    [answers]
  );

  /** ローカルストレージのクイズ回答履歴をすべてクリア */
  const clearHistory = useCallback((): void => {
    setAnswers([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    answers,
    addAnswer,
    getLatestAnswer,
    getAnswerHistory,
    getCategoryStats,
    clearHistory,
  };
}
