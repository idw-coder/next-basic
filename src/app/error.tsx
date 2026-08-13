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
    console.error('[app] Unhandled error boundary:', error);
  }, [error]);

  return <ErrorState onRetry={reset} />;
}
