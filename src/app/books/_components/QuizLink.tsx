import Link from 'next/link';

interface QuizLinkProps {
  href: string;
  title: string;
  description?: string;
}

export default function QuizLink({ href, title, description }: QuizLinkProps) {
  return (
    <Link
      href={href}
      className="group my-6 flex items-center gap-4 rounded-lg border border-border bg-card p-4 no-underline transition-colors hover:bg-accent"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
        📝
      </span>
      <div className="min-w-0">
        <span className="block text-sm font-semibold text-foreground group-hover:text-primary">
          {title}
        </span>
        {description && (
          <span className="block text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <span className="ml-auto shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
