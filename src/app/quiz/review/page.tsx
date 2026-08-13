import { Metadata } from 'next';
import ReviewClient from './ReviewClient';

export const metadata: Metadata = {
  title: '復習 | ウェブエンジニア問題集',
  description: '間違えた問題だけを集めて解き直し。苦手を潰して正答率を上げよう。',
  robots: { index: false, follow: true },
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ completed?: string }>;
}) {
  const { completed } = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 md:py-4">
      <ReviewClient isCompleted={completed === '1'} />
    </div>
  );
}
