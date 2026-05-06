interface CalloutProps {
  type?: 'note' | 'warning' | 'column';
  title?: string;
  children: React.ReactNode;
}

const styles = {
  note: {
    defaultTitle: 'NOTE',
    labelBg: 'bg-blue-500',
    border: 'border-blue-300 dark:border-blue-700',
  },
  warning: {
    defaultTitle: 'WARNING',
    labelBg: 'bg-amber-500',
    border: 'border-amber-300 dark:border-amber-700',
  },
  column: {
    defaultTitle: 'COLUMN',
    labelBg: 'bg-slate-500',
    border: 'border-slate-300 dark:border-slate-700',
  },
};

export default function Callout({ type = 'note', title, children }: CalloutProps) {
  const s = styles[type];

  return (
    <aside className={`relative my-8 rounded border ${s.border} px-5 pb-4 pt-8`}>
      <span
        className={`absolute -top-3 left-4 rounded-sm ${s.labelBg} px-3 py-0.5 text-xs font-medium tracking-wide text-white`}
      >
        {title || s.defaultTitle}
      </span>
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  );
}
