import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * /quiz/[category] 以下で notFound() が呼ばれたときの表示。
 * 存在しないカテゴリと、存在しない問題（[quizId]）の両方で使われる。
 */
export default function QuizNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-2 md:py-4">
      <Card>
        <CardHeader>
          <CardTitle>クイズが見つかりません</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="link" className="px-0">
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4 shrink-0" />
              トップページに戻る
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
