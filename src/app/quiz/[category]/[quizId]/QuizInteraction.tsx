'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import { fetchNextApiJson } from '@/lib/nextApiClient';
import {
  clearRandomSession,
  getRandomSession,
  saveRandomSession,
  type RandomQuizSession,
} from '@/lib/randomQuizSession';
import {
  getQuizQueueProgress,
  getQuizQueueSession,
  getReturnLabel,
  isReplayQueue,
  saveQuizQueueSession,
  type QuizQueueSession,
} from '@/lib/quizQueueSession';
import type { QuizOrigin } from '@/lib/quizOrigin';
import { cn } from '@/lib/utils';
import type { RelatedChapterLink } from '@/lib/quiz-book-links';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Layers3,
  Lightbulb,
  Loader2,
  Pencil,
  Plus,
  Shuffle,
  Tags,
  Trophy,
  X,
} from 'lucide-react';
import { useQuizBookmarks } from '@/hooks/useQuizBookmarks';
import BookChapterCard from './BookChapterCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ExplanationView from './ExplanationView';

interface Choice {
  id: number;
  choice_text: string;
  is_correct: boolean;
  display_order?: number;
}

interface QuizTag {
  id: number;
  slug: string;
  name: string;
}

interface QuizDetail {
  id: number;
  slug: string;
  category_id: number;
  question: string;
  explanation?: string;
  choices: Choice[];
  tags?: QuizTag[];
}

interface RelatedQuizSummary {
  id: number;
  question: string;
  tags: QuizTag[];
}

interface RelatedTagQuizGroup {
  tag: QuizTag;
  quizzes: RelatedQuizSummary[];
}

interface RelatedCategoryLink {
  slug: string;
  name: string;
}

interface RelatedBookSummary {
  href: string;
  title: string;
  chapterCount: number;
}

/**
 * 「学習を広げる」のグリッド。
 *
 * グリッド項目は min-width:auto が既定のため、長い問題文や教科書名がトラックを
 * コンテナ幅より広げてしまう。祖先の overflow-x-hidden により横スクロールにはならず
 * 黙って右端が見切れるので、項目に min-w-0 を明示する。
 */
const EXPLORE_GRID_CLASS = 'mt-3 grid gap-5 [&>*]:min-w-0 lg:grid-cols-2';

/** 解答後の導線ボタン。リンク遷移か、その場でランダムセッションを開始するかの2種類 */
type FollowupAction =
  | { type: 'link'; href: string; label: string }
  | { type: 'random'; label: string };

interface QuizInteractionProps {
  quiz: QuizDetail;
  categorySlug: string;
  /** 解説内の教科書リンクをカード化したもの（Server Component側で解決済み） */
  relatedChapters?: (Omit<RelatedChapterLink, 'matched'> & { matched: string[] })[];
  relatedTagGroups?: RelatedTagQuizGroup[];
  sameCategoryQuizzes?: RelatedQuizSummary[];
  relatedCategories?: RelatedCategoryLink[];
  relatedBook?: RelatedBookSummary | null;
  /** 教科書など、問題の集合ではない流入元（URLの ?from= 由来） */
  origin?: QuizOrigin | null;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 関連問題への「寄り道」リンク。
 * 元の一覧セッションは消さない（乗り換えではなく寄り道なので、戻り導線を残す）。
 */
function FollowupQuizLink({
  href,
  quiz,
}: {
  href: string;
  quiz: RelatedQuizSummary;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-md border border-gray-100 bg-white px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.04] dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-primary/10"
    >
      {/*
        タグは truncate されて意味を成さないうえ、有無でカードの高さが揃わなくなるので出さない。
        問題文も1行と2行が混ざると同じ理由で不揃いになるため、常に2行分（1.625em × 2）を確保する。
      */}
      <span className="line-clamp-2 min-h-[3.25em] min-w-0 flex-1 text-xs font-semibold leading-relaxed text-foreground sm:text-sm">
        {quiz.question}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

export default function QuizInteraction({
  quiz,
  categorySlug,
  relatedChapters = [],
  relatedTagGroups = [],
  sameCategoryQuizzes = [],
  relatedCategories = [],
  relatedBook = null,
  origin = null,
}: QuizInteractionProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [randomSession, setRandomSession] = useState<RandomQuizSession | null>(null);
  const [quizQueue, setQuizQueue] = useState<QuizQueueSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTags, setCurrentTags] = useState<QuizTag[]>(quiz.tags ?? []);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [allTags, setAllTags] = useState<QuizTag[]>([]);
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>(
    () => quiz.tags?.map((tag) => tag.slug) ?? [],
  );
  const [tagLoading, setTagLoading] = useState(false);
  const [tagSaving, setTagSaving] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [newTagSlug, setNewTagSlug] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [quickStartLoading, setQuickStartLoading] = useState<'category' | string | null>(null);
  const [quickStartError, setQuickStartError] = useState<string | null>(null);
  // null のあいだは正誤で決める（不正解なら開いた状態から始める）
  const [exploreOpen, setExploreOpen] = useState<boolean | null>(null);
  const { addAnswer, answers } = useQuizHistory();
  const { isBookmarked, toggleBookmark } = useQuizBookmarks();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return;
    try {
      setIsAdmin(JSON.parse(stored)?.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const session = getRandomSession();
    if (session) {
      const current = session.quizzes[session.currentIndex];
      if (current && current.id === quiz.id) {
        setRandomSession(session);
      }
    }
  }, [quiz.id]);

  // 現在の問題が一覧に含まれるかは問わずに読み込む。
  // 関連問題へ寄り道した先でも「元の一覧に戻る／続ける」を出せるようにするため。
  useEffect(() => {
    setQuizQueue(getQuizQueueSession());
  }, [quiz.id]);

  useEffect(() => {
    if (!tagSheetOpen || !isAdmin || allTags.length > 0) return;
    (async () => {
      setTagLoading(true);
      setTagError(null);
      try {
        const tags = await fetchNextApiJson<QuizTag[]>('/next-api/quiz/tags');
        tags.sort((a, b) => a.slug.localeCompare(b.slug, 'ja'));
        setAllTags(tags);
      } catch {
        setTagError('タグ一覧の取得に失敗しました');
      } finally {
        setTagLoading(false);
      }
    })();
  }, [allTags.length, isAdmin, tagSheetOpen]);

  const shuffledChoices = useMemo(() => shuffleArray(quiz.choices), [quiz.choices]);

  /**
   * 一覧の中で「もう解いた」とみなす問題のID。
   *
   * 通常の一覧は過去の回答履歴も含めて未回答の問題を出したいが、
   * 復習リストとブックマークは解き直しが目的なので今のセッション内の回答だけを見る。
   */
  const answeredIds = useMemo(() => {
    const ids = new Set<number>(quizQueue?.answeredIds ?? []);
    if (quizQueue && !isReplayQueue(quizQueue.source)) {
      answers.forEach((answer) => ids.add(answer.quizId));
    }
    return ids;
  }, [answers, quizQueue]);

  /** 教科書などの流入元を次の問題にも引き継ぐ */
  const withOrigin = (href: string) =>
    origin ? `${href}?from=${encodeURIComponent(origin.param)}` : href;

  const correctChoice = quiz.choices.find((c) => c.is_correct);
  const isCorrect =
    selectedChoice !== null && quiz.choices.find((c) => c.id === selectedChoice)?.is_correct;

  const handleAnswer = () => {
    if (selectedChoice === null) return;
    setIsAnswered(true);
    const correct = quiz.choices.find((c) => c.id === selectedChoice)?.is_correct ?? false;
    addAnswer(quiz.id, quiz.category_id, correct);

    if (randomSession) {
      const updated: RandomQuizSession = {
        ...randomSession,
        answers: [...randomSession.answers, { quizId: quiz.id, isCorrect: correct }],
      };
      saveRandomSession(updated);
      setRandomSession(updated);
    } else if (quizQueue) {
      const updated: QuizQueueSession = {
        ...quizQueue,
        answeredIds: Array.from(new Set([...quizQueue.answeredIds, quiz.id])),
      };
      saveQuizQueueSession(updated);
      setQuizQueue(updated);
    }
  };

  const handleNextRandomQuiz = () => {
    if (!randomSession) return;
    const nextIndex = randomSession.currentIndex + 1;

    if (nextIndex >= randomSession.quizzes.length) {
      router.push(
        randomSession.mode === 'review' ? '/quiz/review?completed=1' : '/quiz/random?completed=1',
      );
    } else {
      const updated = { ...randomSession, currentIndex: nextIndex };
      saveRandomSession(updated);
      const next = updated.quizzes[nextIndex];
      router.push(`/quiz/${next.categorySlug}/${next.id}`);
    }
  };

  const handleExitRandom = () => {
    clearRandomSession();
    setRandomSession(null);
  };

  const handleQuickRandomStart = async (tagSlug?: string) => {
    const loadingKey = tagSlug ?? 'category';
    setQuickStartLoading(loadingKey);
    setQuickStartError(null);

    try {
      const params = new URLSearchParams();
      if (tagSlug) params.set('tagSlug', tagSlug);

      const res = await fetch(
        `/next-api/quiz/category/${quiz.category_id}/quizzes${params.size ? `?${params.toString()}` : ''}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = (await res.json()) as { id: number; question: string }[];
      const candidates = data
        .map((item) => ({
          id: item.id,
          categorySlug,
          question: item.question,
        }))
        .filter((item) => item.id !== quiz.id);

      const playable = candidates.length > 0
        ? candidates
        : data.map((item) => ({
            id: item.id,
            categorySlug,
            question: item.question,
          }));

      if (playable.length === 0) {
        setQuickStartError('次に出せる問題が見つかりませんでした');
        return;
      }

      const picked = shuffleArray(playable).slice(0, Math.min(5, playable.length));
      const session: RandomQuizSession = {
        quizzes: picked,
        currentIndex: 0,
        answers: [],
        settings: { categoryId: quiz.category_id, count: picked.length },
      };

      saveRandomSession(session);
      router.push(`/quiz/${categorySlug}/${picked[0].id}`);
    } catch {
      setQuickStartError('問題の準備に失敗しました。もう一度お試しください。');
    } finally {
      setQuickStartLoading(null);
    }
  };

  const toggleTag = (tagSlug: string) => {
    setSelectedTagSlugs((prev) =>
      prev.includes(tagSlug) ? prev.filter((slug) => slug !== tagSlug) : [...prev, tagSlug],
    );
  };

  const handleCreateTag = async () => {
    const slug = newTagSlug.trim();
    const name = newTagName.trim();
    if (!slug || !name) return;
    setCreatingTag(true);
    setTagError(null);
    try {
      const created = await fetchNextApiJson<QuizTag>('/next-api/quiz/tags', {
        auth: true,
        method: 'POST',
        body: { slug, name },
      });
      setAllTags((prev) => [...prev, created].sort((a, b) => a.slug.localeCompare(b.slug, 'ja')));
      setSelectedTagSlugs((prev) => (prev.includes(created.slug) ? prev : [...prev, created.slug]));
      setNewTagSlug('');
      setNewTagName('');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setTagError(msg ?? 'タグの作成に失敗しました');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSaveTags = async () => {
    setTagSaving(true);
    setTagError(null);
    try {
      const res = await fetchNextApiJson<QuizDetail>(`/next-api/quiz/${quiz.id}`, {
        auth: true,
        method: 'PUT',
        body: { tags: selectedTagSlugs },
      });
      const tags = res.tags ?? [];
      setCurrentTags(tags);
      setSelectedTagSlugs(tags.map((tag) => tag.slug));
      setTagSheetOpen(false);
      router.refresh();
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      setTagError(status === 403 ? 'タグを更新する権限がありません' : 'タグの更新に失敗しました');
    } finally {
      setTagSaving(false);
    }
  };

  const isLastRandomQuiz = randomSession
    ? randomSession.currentIndex + 1 >= randomSession.quizzes.length
    : false;

  const randomProgress = randomSession
    ? ((randomSession.currentIndex + (isAnswered ? 1 : 0)) / randomSession.quizzes.length) * 100
    : 0;

  const renderAnsweredNavigation = (position: 'top' | 'bottom') => {
    if (!randomSession) return null;
    // 不正解のときは解説を読み飛ばさせないよう、解説の下にだけ進行ボタンを出す
    if (position === 'top' && !isCorrect) return null;

    return (
      <Button
        onClick={handleNextRandomQuiz}
        className={cn('w-full', position === 'top' && 'shadow-md')}
        size="lg"
      >
        {isLastRandomQuiz ? (
          <>
            結果を見る
            <Trophy className="size-4 ml-2" />
          </>
        ) : (
          <>
            次の問題へ
            <ArrowRight className="size-4 ml-2" />
          </>
        )}
      </Button>
    );
  };

  const hasLearningLinks = relatedChapters.length > 0 || Boolean(relatedBook);

  const renderLearningLinks = () => (
    <div className="space-y-2">
      {relatedChapters.map((chapter) => (
        <BookChapterCard key={chapter.href} link={chapter} className="mt-0" />
      ))}
      {relatedBook && (
        <Link
          href={relatedBook.href}
          className="group flex items-center gap-3 rounded-lg border border-amber-200 bg-white p-3.5 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <BookOpen className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold text-muted-foreground">教科書トップ</span>
            <span className="block truncate text-sm font-bold text-gray-900">
              {relatedBook.title}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              全{relatedBook.chapterCount}章
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-700" />
        </Link>
      )}
    </div>
  );

  /** 解説から特定の章が引けるか。教科書トップへのリンクしか無い場合は含めない */
  const hasSpecificChapter = relatedChapters.length > 0;

  /**
   * 間違えた問題の手当てを、次に進む導線のすぐ下に添える。
   *
   * 主目的はクイズを解くことなので主導線より前には置かない。
   * また教科書トップへのリンクしか無いときは手当てとして弱いため出さず、
   * 解説から特定の章が引けた場合だけ表示する。
   */
  const showDeepenBlock = !isCorrect && hasSpecificChapter;

  const renderDeepenBlock = () => {
    if (!showDeepenBlock) return null;

    return (
      <div className="space-y-2 rounded-lg bg-amber-50/70 p-3 dark:bg-amber-500/10">
        <p className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
          <Lightbulb className="size-3.5 shrink-0" />
          教科書で確認する
        </p>
        {renderLearningLinks()}
      </div>
    );
  };

  /**
   * 解答後の主導線。
   *
   * 「一覧の何番目か」ではなく「一覧にまだ解いていない問題が残っているか」で組み立てる。
   * 一覧の最後の問題を直接開いた場合でも普通に次の1問が出るため、
   * 「最後の問題です」のような位置由来の例外表示が要らない。
   */
  const renderNormalFollowupNavigation = () => {
    // 復習リストやブックマークは集めた意図が既にあるので、タグでさらに絞らない
    const tagPreference =
      quizQueue?.source === 'category' ? currentTags.map((tag) => tag.slug) : [];
    const progress = quizQueue
      ? getQuizQueueProgress(quizQueue, quiz.id, answeredIds, tagPreference)
      : null;
    const nextItem = progress?.next ?? null;
    const matchedTagName = progress?.matchedTagSlug
      ? currentTags.find((tag) => tag.slug === progress.matchedTagSlug)?.name
      : undefined;
    // 検索は探し物が見つかった時点で終わることが多いので、続けるより戻るを主導線にする
    const preferReturn = quizQueue?.source === 'search';

    let heading: string;
    let subline: string | null = null;
    let primary: FollowupAction | null = null;
    let secondary: FollowupAction | null = null;

    if (quizQueue && progress && nextItem) {
      const continueAction: FollowupAction = {
        type: 'link',
        href: withOrigin(`/quiz/${nextItem.categorySlug}/${nextItem.id}`),
        label: 'もう1問',
      };
      const returnAction: FollowupAction = {
        type: 'link',
        href: quizQueue.returnHref,
        label: getReturnLabel(quizQueue.source),
      };

      // 見出しは「どこから何問残っているか」だけ。動詞はボタン側が持つので繰り返さない
      heading = `${matchedTagName ? `${matchedTagName}の問題` : quizQueue.label}　残り${progress.remaining}問`;
      subline = `次: ${nextItem.question}`;
      primary = preferReturn ? returnAction : continueAction;
      // 一覧への戻りはページ上部に常設されているので、
      // 教科書から来ている場合は副導線を章へ戻る側に譲る
      secondary = preferReturn
        ? { ...continueAction, label: 'もう1問解く' }
        : origin
          ? { type: 'link', href: origin.href, label: origin.actionLabel }
          : returnAction;
    } else if (quizQueue && progress) {
      // 一覧に未回答が残っていない状態。区切りではあるが「完了」とは呼ばない
      heading = `${quizQueue.label}　全${progress.total}問クリア`;
      primary = origin
        ? { type: 'link', href: origin.href, label: origin.actionLabel }
        : { type: 'link', href: quizQueue.returnHref, label: getReturnLabel(quizQueue.source) };
      secondary = origin
        ? { type: 'link', href: quizQueue.returnHref, label: getReturnLabel(quizQueue.source) }
        : { type: 'random', label: 'ランダムで5問復習する' };
    } else if (origin) {
      heading = origin.title;
      primary = { type: 'link', href: origin.href, label: origin.actionLabel };
      secondary = { type: 'link', href: `/quiz/${categorySlug}`, label: '問題一覧を見る' };
    } else {
      // 関連問題や検索エンジンからの単発アクセス。ここから始める提案をする
      heading = 'このカテゴリの問題';
      primary = { type: 'random', label: 'ランダムに5問解く' };
      secondary = { type: 'link', href: `/quiz/${categorySlug}`, label: '問題一覧を見る' };
    }

    const renderAction = (action: FollowupAction, level: 'primary' | 'secondary') => {
      const isPrimary = level === 'primary';
      const className = isPrimary
        ? 'h-11 w-full text-sm font-bold'
        : 'h-9 w-full text-muted-foreground';

      if (action.type === 'random') {
        return (
          <Button
            type="button"
            size={isPrimary ? 'lg' : 'sm'}
            // ランダムは「他に出せるものが無いとき」の受け皿なので、
            // 主導線の位置に来ても塗りつぶしにはせず outline に留める
            variant={isPrimary ? 'outline' : 'ghost'}
            className={className}
            disabled={quickStartLoading !== null}
            onClick={() => handleQuickRandomStart()}
          >
            {quickStartLoading === 'category' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Shuffle className="size-4" />
            )}
            {action.label}
          </Button>
        );
      }

      return (
        <Button
          asChild
          size={isPrimary ? 'lg' : 'sm'}
          variant={isPrimary ? 'default' : 'ghost'}
          className={className}
        >
          <Link href={action.href}>
            {action.label}
            {isPrimary && <ArrowRight className="size-3.5" />}
          </Link>
        </Button>
      );
    };

    const hasTagQuizzes = relatedTagGroups.some((group) => group.quizzes.length > 0);
    // 主導線の下の復習ブロックで既に出しているなら、ここでは重複させない
    const showLearningLinksHere = hasLearningLinks && !showDeepenBlock;
    // ランダムは1画面に1つだけ。主導線・副導線で既に出しているならここには出さない
    const showRandomInExplore = primary?.type !== 'random' && secondary?.type !== 'random';
    const hasExploreSections =
      hasTagQuizzes ||
      sameCategoryQuizzes.length > 0 ||
      showLearningLinksHere ||
      showRandomInExplore ||
      relatedCategories.length > 0;
    const isExploreOpen = exploreOpen ?? !isCorrect;

    return (
      // 選択肢カードと同じ白面に載せる。テーマ色の上に直接置くと本文の可読性が落ちるため
      <div className="min-w-0 space-y-4 rounded-xl border border-black/10 bg-white/95 p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-white/[0.96]">
        <div className="min-w-0">
          <h2 className="break-words text-base font-extrabold leading-snug text-foreground sm:text-lg">
            {heading}
          </h2>
          {subline && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{subline}</p>
          )}
        </div>

        <div className="space-y-2">
          {primary && renderAction(primary, 'primary')}
          {secondary && renderAction(secondary, 'secondary')}
        </div>

        {renderDeepenBlock()}

        {quickStartError && (
          <Alert variant="destructive">
            <AlertDescription>{quickStartError}</AlertDescription>
          </Alert>
        )}

        {hasExploreSections && (
          <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setExploreOpen(!isExploreOpen)}
              aria-expanded={isExploreOpen}
              className="flex w-full items-center justify-between gap-2 py-1 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              学習を広げる
              <ChevronDown
                className={cn('size-4 transition-transform', isExploreOpen && 'rotate-180')}
              />
            </button>

            {isExploreOpen && (
              <div className={EXPLORE_GRID_CLASS}>
                {showRandomInExplore && (
                  <section className="lg:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full"
                      disabled={quickStartLoading !== null}
                      onClick={() => handleQuickRandomStart()}
                    >
                      {quickStartLoading === 'category' ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Shuffle className="size-4" />
                      )}
                      このカテゴリから5問ランダム
                    </Button>
                  </section>
                )}

                {hasTagQuizzes && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Tags className="size-4 text-primary" />
                      関連タグの問題
                    </div>
                    <div className="space-y-3">
                      {relatedTagGroups.map((group) => (
                        <div key={group.tag.slug} className="space-y-2">
                          <Link
                            href={`/quiz/${categorySlug}?tagSlug=${group.tag.slug}`}
                            className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary shadow-sm hover:bg-primary hover:text-primary-foreground"
                          >
                            <span className="truncate">{group.tag.name}</span>
                            <ChevronRight className="size-3 shrink-0" />
                          </Link>
                          <div className="space-y-1.5">
                            {group.quizzes.map((relatedQuiz) => (
                              <FollowupQuizLink
                                key={`${group.tag.slug}-${relatedQuiz.id}`}
                                href={withOrigin(`/quiz/${categorySlug}/${relatedQuiz.id}`)}
                                quiz={relatedQuiz}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {sameCategoryQuizzes.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Layers3 className="size-4 text-primary" />
                      同じカテゴリの問題
                    </div>
                    <div className="space-y-1.5">
                      {sameCategoryQuizzes.map((relatedQuiz) => (
                        <FollowupQuizLink
                          key={relatedQuiz.id}
                          href={withOrigin(`/quiz/${categorySlug}/${relatedQuiz.id}`)}
                          quiz={relatedQuiz}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {showLearningLinksHere && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <BookOpen className="size-4 text-amber-700 dark:text-amber-300" />
                      関連の教科書
                    </div>
                    {renderLearningLinks()}
                  </section>
                )}

                {relatedCategories.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <BookOpen className="size-4 text-blue-700 dark:text-blue-300" />
                      関連カテゴリ
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {relatedCategories.map((relatedCategory) => (
                        <Link
                          key={relatedCategory.slug}
                          href={`/quiz/${relatedCategory.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-white px-2.5 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                        >
                          {relatedCategory.name}
                          <ChevronRight className="size-3.5 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="rounded-md border border-dashed border-primary/40 bg-white/70 p-3 shadow-sm dark:bg-gray-900/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                管理者メニュー
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {currentTags.length > 0 ? (
                  currentTags.map((tag) => (
                    <Badge key={tag.slug} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">タグ未設定</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                  <Pencil className="size-3.5" />
                  編集ページへ
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTagSheetOpen(true)}>
                <Tags className="size-3.5" />
                タグ編集
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ランダムクイズ進捗バー */}
      {randomSession && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {randomSession.mode === 'review' ? '解き直し' : 'ランダムクイズ'}{' '}
              <span className="font-bold text-foreground text-lg">
                {randomSession.currentIndex + 1}
              </span>
              <span className="mx-1">/</span>
              <span>{randomSession.quizzes.length}</span>
            </span>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{Math.round(randomProgress)}%</Badge>
              <button
                type="button"
                onClick={handleExitRandom}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                終了する
              </button>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${randomProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="min-w-0 space-y-4 rounded-xl border border-black/10 bg-white/95 p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-white/[0.96]">
      {/* ブックマークボタン */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => toggleBookmark(quiz.id, quiz.category_id, categorySlug, quiz.question)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
            isBookmarked(quiz.id)
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
          )}
        >
          <Bookmark
            className={cn('size-3.5', isBookmarked(quiz.id) && 'fill-current')}
          />
          {isBookmarked(quiz.id) ? 'ブックマーク済み' : 'ブックマーク'}
        </button>
      </div>

      {/* 選択肢 */}
      <div className="space-y-2.5 sm:space-y-3">
        {shuffledChoices.map((choice, index) => {
          const isSelected = selectedChoice === choice.id;
          const showCorrect = isAnswered && choice.is_correct;
          const showWrong = isAnswered && isSelected && !choice.is_correct;
          const letter = String.fromCharCode(65 + index); // A, B, C, D

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => !isAnswered && setSelectedChoice(choice.id)}
              disabled={isAnswered}
              className={cn(
                'group w-full text-left px-3 py-3 sm:p-4 rounded-md border-2 transition-all duration-150',
                'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
                isAnswered && 'cursor-not-allowed',
                !isAnswered &&
                  'cursor-pointer hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5',
                isSelected && !isAnswered && 'border-primary bg-primary/5 shadow-md',
                showCorrect && 'border-green-500 bg-green-50 dark:bg-green-500/10 shadow-md',
                showWrong && 'border-destructive bg-red-50 dark:bg-destructive/10 shadow-md',
              )}
            >
              <div className="flex items-center gap-2.5 sm:gap-4">
                <div
                  className={cn(
                    'size-9 sm:size-10 shrink-0 rounded-md flex items-center justify-center text-base sm:text-lg font-black transition-colors',
                    'bg-foreground text-background',
                    !isAnswered &&
                      !isSelected &&
                      'group-hover:bg-primary group-hover:text-primary-foreground',
                    isSelected && !isAnswered && 'bg-primary text-primary-foreground',
                    showCorrect && 'bg-green-600 text-white',
                    showWrong && 'bg-destructive text-white',
                  )}
                >
                  {letter}
                </div>
                <span className="flex-1 text-foreground text-sm sm:text-xl font-medium sm:font-semibold leading-snug">
                  {choice.choice_text}
                </span>
                {showCorrect && (
                  <Check className="size-5 sm:size-6 shrink-0 text-green-600" aria-label="正解" />
                )}
                {showWrong && (
                  <X className="size-5 sm:size-6 shrink-0 text-destructive" aria-label="不正解" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!isAnswered ? (
        <Button
          onClick={handleAnswer}
          disabled={selectedChoice === null}
          className="w-full h-12 text-base font-black tracking-wide shadow-md bg-foreground text-background hover:bg-foreground/90"
          size="lg"
        >
          回答する
        </Button>
      ) : (
        // 回答した後のフォームは回答前段階ではDOMに含まれないため、sr-onlyで解説テキストを常にDOMに常駐させるよう修正。
        <div className="space-y-4">
          <Alert
            variant={isCorrect ? 'default' : 'destructive'}
            className={cn(
              'mb-6',
              isCorrect
                ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 [&_div]:text-current'
                : 'bg-red-50 dark:bg-red-950',
            )}
          >
            <AlertTitle className="font-bold text-center">
              {isCorrect ? '正解です' : '不正解です'}
            </AlertTitle>
            {!isCorrect && correctChoice && (
              <AlertDescription>正解: {correctChoice.choice_text}</AlertDescription>
            )}
            {!isCorrect && randomSession?.mode !== 'review' && (
              <AlertDescription className="mt-1">
                この問題は
                <Link href="/quiz/review" className="font-bold underline underline-offset-2 mx-0.5">
                  復習リスト
                </Link>
                に入りました。正解するまでいつでも解き直せます
              </AlertDescription>
            )}
          </Alert>

          {renderAnsweredNavigation('top')}

          {quiz.explanation && (
            <div className="rounded-md border border-black/5 bg-white dark:bg-gray-900 shadow-sm p-3 sm:p-5">
              <div className="font-bold text-center mb-3 text-foreground">解説</div>
              <ExplanationView
                explanation={quiz.explanation}
                stripUrls={relatedChapters.flatMap((c) => c.matched)}
              />
              {randomSession &&
                relatedChapters.map((chapter) => (
                  <BookChapterCard key={chapter.href} link={chapter} />
                ))}
            </div>
          )}

          {/* ランダムモードの進行ボタン */}
          {randomSession ? renderAnsweredNavigation('bottom') : null}
        </div>
      )}
      </div>

      {!randomSession && isAnswered && renderNormalFollowupNavigation()}

      <Sheet open={tagSheetOpen} onOpenChange={setTagSheetOpen}>
        <SheetContent className="w-[92vw] sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetHeader>
            <SheetTitle>クイズのタグを編集</SheetTitle>
            <SheetDescription>この問題に紐づけるタグを選択できます。</SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4">
            {tagError && (
              <Alert variant="destructive">
                <AlertDescription>{tagError}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-md border p-3">
              <div className="mb-2 text-sm font-bold">新規タグ</div>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  placeholder="slug"
                  value={newTagSlug}
                  onChange={(e) => setNewTagSlug(e.target.value)}
                />
                <Input
                  placeholder="表示名"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!newTagSlug.trim() || !newTagName.trim() || creatingTag}
                  onClick={handleCreateTag}
                >
                  <Plus className="size-3.5" />
                  {creatingTag ? '追加中' : '追加'}
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="text-sm font-bold">既存タグ</div>
                <Badge variant="secondary">{selectedTagSlugs.length} 選択中</Badge>
              </div>
              {tagLoading ? (
                <div className="text-sm text-muted-foreground">読み込み中...</div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {allTags.map((tag) => {
                    const selected = selectedTagSlugs.includes(tag.slug);
                    return (
                      <button
                        key={tag.slug}
                        type="button"
                        onClick={() => toggleTag(tag.slug)}
                        className={cn(
                          'rounded-md border px-2 py-0.5 text-xs transition-colors',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:bg-muted',
                        )}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                  {allTags.length === 0 && !tagLoading && (
                    <div className="text-sm text-muted-foreground">タグがまだありません</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="border-t">
            <Button type="button" variant="outline" onClick={() => setTagSheetOpen(false)}>
              キャンセル
            </Button>
            <Button type="button" disabled={tagSaving} onClick={handleSaveTags}>
              {tagSaving ? '保存中...' : '保存'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
