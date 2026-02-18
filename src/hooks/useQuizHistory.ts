"use client";

import { useState, useCallback, useEffect } from "react";

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

function saveToStorage(answers: QuizAnswer[]): void {
  if (typeof window === "undefined") return;
  try {
    const data: QuizHistoryData = { answers };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save quiz history:", error);
  }
}

export function useQuizHistory() {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  // クライアントマウント時に localStorage から読み込む
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
      // クイズごとに最新の回答だけを取る
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

  /** 履歴をすべてクリア */
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
