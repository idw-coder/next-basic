interface TailwindPreviewProps {
  title?: string;
  children: React.ReactNode;
}

export default function TailwindPreview({ title = 'Preview', children }: TailwindPreviewProps) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/60" />
          <span className="size-2.5 rounded-full bg-amber-400/60" />
          <span className="size-2.5 rounded-full bg-green-400/60" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {title}
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
