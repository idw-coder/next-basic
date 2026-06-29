import Link from 'next/link';
import { ArrowRight, HelpCircle } from 'lucide-react';

interface QuizLinkProps {
  href: string;
  title: string;
  description?: string;
}

export default function QuizLink({ href, title, description }: QuizLinkProps) {
  return (
    <Link
      href={href}
      className="group my-6 flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 no-underline transition-all hover:border-primary/40 hover:bg-primary/10 hover:shadow-sm"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <HelpCircle className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </span>
        {description && (
          <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>
        )}
      </div>
      <ArrowRight className="size-4 shrink-0 text-primary/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
