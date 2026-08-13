'use client';

import ErrorState from '@/components/ErrorState';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[blog] Unhandled error boundary:', error);
  }, [error]);

  return (
    <ErrorState
      title="記事を読み込めませんでした"
      description="一時的な不具合の可能性があります。時間をおいてもう一度お試しください。"
      onRetry={reset}
    />
  );
}
