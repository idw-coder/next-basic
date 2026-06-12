interface TailwindPreviewProps {
  title?: string;
  children: React.ReactNode;
}

export default function TailwindPreview({ title = 'Preview', children }: TailwindPreviewProps) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        {title}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
