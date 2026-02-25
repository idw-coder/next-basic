export interface RandomQuizSession {
  quizzes: { id: number; categorySlug: string; question: string }[];
  currentIndex: number;
  answers: { quizId: number; isCorrect: boolean }[];
  settings: {
    categoryId: number | "all";
    count: number;
  };
}

const SESSION_KEY = "random_quiz_session";

export function getRandomSession(): RandomQuizSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveRandomSession(session: RandomQuizSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearRandomSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
