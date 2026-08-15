import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface QuizLinkProps {
  href: string;
  title: string;
  description?: string;
  imageSrc?: string;
  /**
   * 章ページが注入する流入元（`book:<bookSlug>/<chapterSlug>`）。
   * クイズ側で「教科書に戻る」を出すために URL で引き継ぐ。MDX 側の記述は変更不要。
   */
  fromChapter?: string;
}

export default function QuizLink({
  href,
  title,
  description,
  imageSrc = '/images/card-backgrounds/random-practice-card-bg-person-right.webp',
  fromChapter,
}: QuizLinkProps) {
  const targetHref = fromChapter
    ? `${href}${href.includes('?') ? '&' : '?'}from=${encodeURIComponent(fromChapter)}`
    : href;

  return (
    <Link
      href={targetHref}
      className="group relative my-6 flex min-h-36 items-center gap-3 overflow-hidden rounded-lg border border-sky-300 bg-sky-700 px-4 py-5 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md sm:min-h-40 sm:px-6 sm:py-5"
    >
      <span
        className="pointer-events-none absolute inset-0 bg-no-repeat transition-transform duration-500 group-hover:scale-[1.015]"
        style={{
          backgroundImage: `url("${imageSrc}")`,
          backgroundPosition: 'calc(100% + 28px) center',
          backgroundSize: 'auto 100%',
        }}
        aria-hidden="true"
      />
      <span className="absolute inset-0 bg-gradient-to-r from-sky-800 from-0% via-sky-700/95 via-52% to-sky-600/15 to-86%" />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_54%_50%,rgba(255,255,255,0.18),transparent_42%)]" />
      <div className="relative min-w-0 max-w-[64%] flex-1 sm:max-w-[66%]">
        <span className="inline-block rounded-md bg-white px-2.5 py-1 text-sm font-extrabold leading-snug text-sky-700 shadow-sm sm:text-lg">
          {title}
        </span>
        {description && (
          <span className="mt-2.5 block text-xs font-bold leading-relaxed text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] sm:text-sm">
            {description}
          </span>
        )}
      </div>
      <ArrowRight className="absolute right-4 size-6 shrink-0 text-white drop-shadow transition-transform group-hover:translate-x-1 sm:right-5" />
    </Link>
  );
}
