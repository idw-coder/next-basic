import { clearRandomSession } from './randomQuizSession';

export type QuizQueueSource = 'category' | 'search' | 'review' | 'bookmarks';

export interface QuizQueueItem {
  id: number;
  categorySlug: string;
  question: string;
  /** カテゴリ一覧から作ったキューのみ持つ。同じタグの問題を優先して続けるために使う */
  tagSlugs?: string[];
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

/** 一覧に戻る導線のラベル。source ごとに文言だけを出し分ける（挙動は共通） */
const RETURN_LABELS: Record<QuizQueueSource, string> = {
  category: '問題一覧に戻る',
  search: '検索結果に戻る',
  review: '復習リストに戻る',
  bookmarks: 'ブックマークに戻る',
};

export function getReturnLabel(source: QuizQueueSource): string {
  return RETURN_LABELS[source] ?? '一覧に戻る';
}

/**
 * 「解き直し」が目的の一覧かどうか。
 *
 * 復習リストとブックマークは過去に解いた問題を意図して集めたものなので、
 * 残り数の判定に過去の回答履歴を使うと開いた瞬間に残り0になってしまう。
 * この2つだけは「今のセッションで解いたか」だけを見る。
 */
const REPLAY_SOURCES: ReadonlySet<QuizQueueSource> = new Set<QuizQueueSource>([
  'review',
  'bookmarks',
]);

export function isReplayQueue(source: QuizQueueSource): boolean {
  return REPLAY_SOURCES.has(source);
}

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

export interface QuizQueueProgress {
  /** 次に解く1問。未回答が無ければ null */
  next: QuizQueueItem | null;
  /** 未回答の残り問題数（表示中の問題は除く） */
  remaining: number;
  /** 一覧の総問題数 */
  total: number;
  /** 同じタグで絞って続けている場合、そのタグ。カテゴリ全体で続ける場合は null */
  matchedTagSlug: string | null;
}

/**
 * 一覧の中から「次に解く1問」と残り数を求める。
 *
 * 配列の次の要素（index + 1）ではなく未回答の中から選ぶ。
 * 一覧の最後の問題を直接開いた場合でも次の1問が自然に出るようにするためで、
 * 「最後の問題です」「完了しました」といった位置由来の状態表示を不要にする。
 *
 * 並び順の体感を保つため現在位置より後ろを優先し、
 * 見つからなければ先頭に折り返して探す。
 * 現在の問題が一覧に含まれない場合（関連問題への寄り道など）は先頭から探す。
 */
export function getQuizQueueProgress(
  session: QuizQueueSession,
  currentQuizId: number,
  answeredIds: ReadonlySet<number>,
  /** 今解いた問題のタグ。同じタグの問題が残っていればそちらを優先して続ける */
  currentTagSlugs: readonly string[] = [],
): QuizQueueProgress {
  const { items } = session;
  const isUnanswered = (item: QuizQueueItem) =>
    item.id !== currentQuizId && !answeredIds.has(item.id);

  const currentIndex = items.findIndex((item) => item.id === currentQuizId);
  const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
  // 現在位置より後ろを優先し、無ければ先頭に折り返す（一覧の並び順の体感を保つ）
  const ordered = [...items.slice(startIndex), ...items.slice(0, startIndex)];
  const unanswered = ordered.filter(isUnanswered);

  // カテゴリ全体より「同じタグで続ける」ほうが学習の流れが途切れにくいので先に探す。
  // 同じタグの問題が残っていなければカテゴリ全体の並びにそのまま落ちる。
  const tagCounts = new Map<string, QuizQueueItem[]>();
  for (const slug of currentTagSlugs) {
    const matches = unanswered.filter((item) => item.tagSlugs?.includes(slug));
    if (matches.length > 0) tagCounts.set(slug, matches);
  }
  // 複数タグを持つ場合は、残りが最も多いタグを選んで長く続けられるようにする
  const bestTag = [...tagCounts.entries()].sort((a, b) => b[1].length - a[1].length)[0];

  if (bestTag) {
    const [slug, matches] = bestTag;
    return { next: matches[0], remaining: matches.length, total: items.length, matchedTagSlug: slug };
  }

  return {
    next: unanswered[0] ?? null,
    remaining: unanswered.length,
    total: items.length,
    matchedTagSlug: null,
  };
}
