import { redirect } from 'next/navigation';

/** 旧 URL /quiz/search から /search へリダイレクト */
export default async function LegacyQuizSearchRedirect({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  redirect(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
}
