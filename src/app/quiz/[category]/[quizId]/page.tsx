import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCategoryTheme } from '@/lib/categoryTheme';
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

const API_BASE_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

interface QuizDetail {
  id: number;
  slug: string;
  category_id: number;
  question: string;
  explanation?: string;
  choices: Choice[];
  tags?: QuizTag[];
}

async function getQuiz(quizId: string): Promise<QuizDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/${quizId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return null;
  }
}

// Vue管理画面 リッチテキストエディタ
function isTiptapFormat(explanation: string): boolean {
  const trimmed = explanation.trim();
  if (!trimmed.startsWith('{')) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed?.type === 'doc' && Array.isArray(parsed?.content);
  } catch {
    return false;
  }
}

// React管理画面 リッチテキストエディタ（現在使用していない）
function isBlockNoteFormat(explanation: string): boolean {
  const trimmed = explanation.trim();
  if (!trimmed.startsWith('[')) return false;
  try {
    const parsed = JSON.parse(explanation);
    if (!Array.isArray(parsed)) return false;
    return parsed.every(
      (b: Record<string, unknown>) =>
        b !== null && typeof b === 'object' && 'type' in b && typeof b.type === 'string',
    );
  } catch {
    return false;
  }
}

function isStructuredExplanation(explanation: string): boolean {
  return isTiptapFormat(explanation) || isBlockNoteFormat(explanation);
}

// TipTapのノード配列の中のテキストだけを抽出
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTextFromNodes(nodes: any[]): string {
  const texts: string[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'text' && typeof node.text === 'string') {
      texts.push(node.text);
    }
    if (Array.isArray(node.content)) {
      texts.push(extractTextFromNodes(node.content));
    }
  }
  return texts.join('');
}

function extractPlainText(explanation: string): string {
  try {
    const parsed = JSON.parse(explanation);
    // TipTap のドキュメント形式
    if (parsed?.type === 'doc' && Array.isArray(parsed?.content)) {
      return extractTextFromNodes(parsed.content);
    }
    if (Array.isArray(parsed)) {
      return extractTextFromNodes(parsed);
    }
    return '';
  } catch {
    return '';
  }
}

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ category: string; quizId: string }>;
}) {
  const { category, quizId } = await params;
  const quiz = await getQuiz(quizId);
  const theme = getCategoryTheme(category);

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>問題が見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link href={`/quiz/${category}`} className="inline-flex items-center gap-2">
                <ArrowLeft className="size-4 shrink-0" />
                問題一覧に戻る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 md:py-12">
      <div className="mb-4 sm:mb-6">
        <Button asChild variant="link" className="px-0 -ml-2">
          <Link href={`/quiz/${category}`} className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4 shrink-0" />
            問題一覧に戻る
          </Link>
        </Button>
      </div>

      <Card
        className={`relative overflow-hidden border-0 shadow-lg py-4 sm:py-6 ${theme.cardBgClass}`}
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

        <CardHeader className="gap-3 sm:gap-4 px-3 sm:px-6">
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
        <CardContent className="px-3 sm:px-6">
          {/* インタラクション部分をClient Componentに委譲 */}
          <QuizInteraction quiz={quiz} categorySlug={category} />

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
              <p>
                {isStructuredExplanation(quiz.explanation)
                  ? extractPlainText(quiz.explanation)
                  : quiz.explanation}
              </p>
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
  const { quizId } = await params;
  const quiz = await getQuiz(quizId);

  if (!quiz) {
    return {
      title: '問題が見つかりません | ウェブエンジニア問題集',
    };
  }

  return {
    title: `${quiz.question} | ウェブエンジニア問題集`,
    description: quiz.question,
  };
}
