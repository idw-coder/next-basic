import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCategoryTheme } from '@/lib/categoryTheme';
import {
  getQuizDetail,
  QuizDetailNotFoundError,
  QuizDetailParamsError,
} from '@/lib/server/quizDetail';
import { getQuizCategoryQuizzes, type QuizCategoryQuiz } from '@/lib/server/quizCategoryQuizzes';
import { extractBookChapterLinks } from '@/lib/quiz-book-links';
import { toPlainText } from '@/lib/quizContent';
import { getBookForCategory, getChaptersByBook } from '@/lib/books';
import { getCategorySeoContent } from '../categoryContent';
import { resolveQuizOrigin } from '@/lib/quizOrigin';
import QuizInteraction from './QuizInteraction';

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

interface RelatedBookSummary {
  href: string;
  title: string;
  chapterCount: number;
}

function shuffleChoices(choices: readonly Choice[]): Choice[] {
  const shuffled = [...choices];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function getQuiz(quizId: string): Promise<QuizDetail> {
  try {
    const { quiz } = await getQuizDetail(quizId);
    return quiz;
  } catch (error) {
    if (error instanceof QuizDetailNotFoundError || error instanceof QuizDetailParamsError) {
      notFound();
    }

    throw error;
  }
}

async function getCategoryQuizzes(categoryId: number): Promise<QuizCategoryQuiz[]> {
  try {
    const { quizzes } = await getQuizCategoryQuizzes(categoryId);
    return quizzes;
  } catch (error) {
    console.error('Failed to fetch category quizzes:', error);
    return [];
  }
}

function toRelatedQuizSummary(quiz: QuizCategoryQuiz): RelatedQuizSummary {
  return {
    id: quiz.id,
    question: quiz.question,
    tags: quiz.tags,
  };
}

function buildFollowupData(quiz: QuizDetail, categoryQuizzes: QuizCategoryQuiz[]) {
  const otherQuizzes = categoryQuizzes.filter((q) => q.id !== quiz.id);
  const usedQuizIds = new Set<number>();

  const relatedTagGroups: RelatedTagQuizGroup[] = [];
  for (const tag of quiz.tags ?? []) {
    const quizzes = otherQuizzes
      .filter((candidate) => candidate.tags.some((candidateTag) => candidateTag.slug === tag.slug))
      .filter((candidate) => !usedQuizIds.has(candidate.id))
      .slice(0, 2);

    if (quizzes.length === 0) continue;
    quizzes.forEach((candidate) => usedQuizIds.add(candidate.id));
    relatedTagGroups.push({
      tag,
      quizzes: quizzes.map(toRelatedQuizSummary),
    });

    if (relatedTagGroups.length >= 3) break;
  }

  const sameCategoryQuizzes = otherQuizzes
    .filter((candidate) => !usedQuizIds.has(candidate.id))
    .slice(0, 3)
    .map(toRelatedQuizSummary);

  return {
    relatedTagGroups,
    sameCategoryQuizzes,
  };
}

// Googleの「教育系Q&A（練習問題）」リッチリザルト向けのQuizスキーマ
// https://developers.google.com/search/docs/appearance/structured-data/practice-problems
function buildQuizJsonLd(quiz: QuizDetail, categoryLabel: string): Record<string, unknown> | null {
  const correct = quiz.choices.find((c) => c.is_correct);
  if (!correct) return null;

  const explanationText = toPlainText(quiz.explanation);
  return {
    '@context': 'https://schema.org/',
    '@type': 'Quiz',
    about: { '@type': 'Thing', name: categoryLabel },
    hasPart: [
      {
        '@type': 'Question',
        eduQuestionType: 'Multiple choice',
        learningResourceType: 'Practice problem',
        text: quiz.question,
        suggestedAnswer: quiz.choices
          .filter((c) => !c.is_correct)
          .map((c) => ({ '@type': 'Answer', text: c.choice_text })),
        acceptedAnswer: {
          '@type': 'Answer',
          text: correct.choice_text,
          ...(explanationText
            ? { answerExplanation: { '@type': 'Comment', text: explanationText } }
            : {}),
        },
      },
    ],
  };
}

export default async function QuizDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; quizId: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { category, quizId } = await params;
  const { from } = await searchParams;
  const quiz = await getQuiz(quizId);
  const theme = getCategoryTheme(category);
  const origin = resolveQuizOrigin(from);

  const [categoryQuizzes] = await Promise.all([getCategoryQuizzes(quiz.category_id)]);
  const quizForRender = {
    ...quiz,
    choices: shuffleChoices(quiz.choices),
  };
  const followupData = buildFollowupData(quiz, categoryQuizzes);
  const seoContent = getCategorySeoContent(category);
  const relatedBook = getBookForCategory(category);
  const relatedBookSummary: RelatedBookSummary | null = relatedBook
    ? {
        href: `/books/${relatedBook.bookSlug}`,
        title: relatedBook.title,
        chapterCount: getChaptersByBook(relatedBook.bookSlug).length,
      }
    : null;
  const quizJsonLd = buildQuizJsonLd(quizForRender, theme.label);

  return (
    // スマホでは外側の余白を持たず、テーマ色のカードを画面全幅に伸ばして内容の幅を稼ぐ
    <div className="max-w-4xl mx-auto px-0 sm:px-4 py-2 md:py-4">
      {quizJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd) }}
        />
      )}
      <div className="mb-4 px-3 sm:mb-6 sm:px-0">
        <Button asChild variant="link" className="px-0 -ml-2">
          <Link href={`/quiz/${category}`} className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4 shrink-0" />
            問題一覧に戻る
          </Link>
        </Button>
      </div>

      <Card
        // 全幅・角丸なしのスマホでは影が横一本の帯に見えてしまうので、影は画面幅が広いときだけ
        className={`relative overflow-hidden border-0 rounded-none shadow-none sm:rounded-xl sm:shadow-lg py-4 sm:py-6 ${theme.cardBgClass}`}
      >
        {/* 装飾: 右上のドット */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-4 right-4 flex gap-1.5"
        >
          <span className="size-2 rounded-full bg-white/70" />
          <span className="size-2 rounded-full bg-white/70" />
          <span className="size-2 rounded-full bg-white/70" />
        </span>

        {/* 問題文は白地を敷かずテーマ色の上に置く（白カードは選択肢・解説・次の学習だけに使う） */}
        <CardHeader className="gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-6">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${theme.badgeClass}`}
            >
              <HelpCircle className="size-3.5" aria-hidden="true" />
              {theme.label}クイズ
            </span>
          </div>
          <h1 className="font-black text-lg sm:text-2xl leading-snug tracking-tight whitespace-pre-wrap text-foreground">
            {quiz.question}
          </h1>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {/* インタラクション部分をClient Componentに委譲 */}
          <QuizInteraction
            quiz={quizForRender}
            categorySlug={category}
            relatedChapters={
              quiz.explanation ? extractBookChapterLinks(quiz.explanation) : []
            }
            relatedTagGroups={followupData.relatedTagGroups}
            sameCategoryQuizzes={followupData.sameCategoryQuizzes}
            relatedCategories={seoContent?.relatedCategories.slice(0, 3) ?? []}
            relatedBook={relatedBookSummary}
            origin={origin}
          />

          {/*
          クローラー対策

          以前はQuizInteractionのchildren経由で渡していた
          Client Component内のisAnswered: falseでは初期SSRのDOMに含まれず、RSCペイロード(scriptタグ)にのみあるだけ
          存在していたため、クローラーがコンテンツとして認識できなかったかも
          ↓
          sr-onlyで解説テキストを常にDOMに常駐させるよう修正。

          hidden(display:none)ではなくsr-onlyを採用する理由
          display:noneはGoogleが「ユーザーに見えない隠しコンテンツ」として
          評価を下げる可能性がある。sr-onlyはアクセシビリティ用途で広く使われる手法であり、
          スクリーンリーダーやクローラーからアクセス可能なまま視覚的に非表示にできる。
          */}
          {quiz.explanation && (
            <div className="sr-only" aria-hidden="true">
              <h2>解説</h2>
              <p>{toPlainText(quiz.explanation)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; quizId: string }>;
}) {
  const { category, quizId } = await params;
  const quiz = await getQuiz(quizId);

  return {
    title: `${quiz.question} | ウェブエンジニア問題集`,
    description: quiz.question,
    // 流入元を ?from= で受け取るため、パラメータ付きURLを重複ページにしない
    alternates: {
      canonical: `/quiz/${category}/${quizId}`,
    },
  };
}
