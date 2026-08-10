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
import api from '@/lib/api';
import { fetchNextApiJson } from '@/lib/nextApiClient';
import {
  clearRandomSession,
  getRandomSession,
  saveRandomSession,
  type RandomQuizSession,
} from '@/lib/randomQuizSession';
import { cn } from '@/lib/utils';
import type { RelatedChapterLink } from '@/lib/quiz-book-links';
import { ArrowLeft, ArrowRight, Bookmark, Check, Pencil, Plus, Tags, Trophy, X } from 'lucide-react';
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

interface QuizInteractionProps {
  quiz: QuizDetail;
  categorySlug: string;
  /** 解説内の教科書リンクをカード化したもの（Server Component側で解決済み） */
  relatedChapters?: (Omit<RelatedChapterLink, 'matched'> & { matched: string[] })[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizInteraction({
  quiz,
  categorySlug,
  relatedChapters = [],
}: QuizInteractionProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [randomSession, setRandomSession] = useState<RandomQuizSession | null>(null);
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
  const { addAnswer } = useQuizHistory();
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
      const res = await api.put(`/api/quiz/${quiz.id}`, { tags: selectedTagSlugs });
      const tags = (res.data.tags ?? []) as QuizTag[];
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

  const renderAnsweredNavigation = (position: 'top' | 'bottom') =>
    randomSession ? (
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
    ) : (
      <Button asChild className="w-full" variant="secondary" size="lg">
        <Link
          href={`/quiz/${categorySlug}`}
          className="inline-flex items-center justify-center gap-2"
        >
          <ArrowLeft className="size-4 shrink-0" />
          問題一覧に戻る
        </Link>
      </Button>
    );

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
                'group w-full text-left px-2.5 py-3 sm:p-4 rounded-md border-2 transition-all duration-150',
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
              {relatedChapters.map((chapter) => (
                <BookChapterCard key={chapter.href} link={chapter} />
              ))}
            </div>
          )}

          {/* ナビゲーション: ランダムモード or 通常モード */}
          {renderAnsweredNavigation('bottom')}
        </div>
      )}

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
