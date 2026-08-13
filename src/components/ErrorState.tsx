'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Next.jsのerror.tsxから渡すreset。無い場合は再読み込みボタンを出さない */
  onRetry?: () => void;
}

/**
 * 取得失敗をユーザーに伝えるための共通表示。
 * 空配列を返して「0件」と見せてしまうと、障害なのか内容が無いのか区別できない。
 */
export default function ErrorState({
  title = '読み込めませんでした',
  description = '一時的な不具合の可能性があります。時間をおいてもう一度お試しください。',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-red-tint text-brand-red-deep">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-lg font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="min-h-11 rounded-full px-6 font-bold">
            <RotateCcw className="size-4" aria-hidden="true" />
            再読み込み
          </Button>
        )}
        <Button asChild variant="outline" className="min-h-11 rounded-full px-6 font-bold">
          <Link href="/">トップページに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
