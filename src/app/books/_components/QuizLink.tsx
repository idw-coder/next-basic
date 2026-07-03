import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface QuizLinkProps {
  href: string;
  title: string;
  description?: string;
  imageSrc?: string;
}

export default function QuizLink({
  href,
  title,
  description,
  imageSrc = '/images/phone_check.png',
}: QuizLinkProps) {
  return (
    <Link
      href={href}
      className="group relative my-6 flex items-center gap-3 overflow-hidden rounded-lg border border-sky-300 bg-sky-600 px-4 py-4 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md sm:px-5 sm:py-4"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-sky-700/95 via-cyan-600/88 to-blue-500/74" />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_56%_48%,rgba(255,255,255,0.22),transparent_42%)]" />
      <span className="absolute inset-0 bg-gradient-to-r from-slate-950/18 via-transparent to-transparent" />
      <div className="pointer-events-none absolute right-16 top-1/2 h-44 w-36 -translate-y-1/2 rotate-[15deg] opacity-35 mix-blend-multiply blur-[1px] transition-transform duration-300 group-hover:scale-105 sm:h-56 sm:w-44">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="176px"
          aria-hidden="true"
          className="object-contain saturate-125"
        />
      </div>
      <div className="relative min-w-0 flex-1">
        <span className="inline-block rounded-md bg-white px-2.5 py-1 text-base font-extrabold leading-snug text-sky-700 shadow-sm sm:text-lg">
          {title}
        </span>
        {description && (
          <span className="mt-2 block text-sm font-bold leading-relaxed text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
            {description}
          </span>
        )}
      </div>
      <ArrowRight className="relative size-6 shrink-0 text-white transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
