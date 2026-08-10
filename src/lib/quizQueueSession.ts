import { clearRandomSession } from './randomQuizSession';

export type QuizQueueSource = 'category' | 'search' | 'review' | 'bookmarks';

export interface QuizQueueItem {
  id: number;
  categorySlug: string;
  question: string;
}

export interface QuizQueueSession {
  source: QuizQueueSource;
  label: string;
  returnHref: string;
  items: QuizQueueItem[];
  answeredIds: number[];
  createdAt: number;
}

const SESSION_KEY = 'quiz_queue_session';
const SESSION_TTL_MS = 30 * 60 * 1000;

export function getQuizQueueSession(): QuizQueueSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored) as QuizQueueSession;
    if (!session.createdAt || Date.now() - session.createdAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    if (!Array.isArray(session.items) || session.items.length === 0) return null;
    return {
      ...session,
      answeredIds: Array.isArray(session.answeredIds) ? session.answeredIds : [],
    };
  } catch {
    return null;
  }
}

export function saveQuizQueueSession(
  session: Omit<QuizQueueSession, 'createdAt' | 'answeredIds'> & {
    answeredIds?: number[];
    createdAt?: number;
  },
): void {
  if (typeof window === 'undefined') return;

  clearRandomSession();
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      ...session,
      answeredIds: session.answeredIds ?? [],
      createdAt: Date.now(),
    }),
  );
}

export function clearQuizQueueSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}
