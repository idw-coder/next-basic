import { AlertTriangle, Info, Lightbulb, MessageSquare } from 'lucide-react';

interface CalloutProps {
  type?: 'note' | 'info' | 'warning' | 'column';
  title?: string;
  children: React.ReactNode;
}

const styles = {
  note: {
    defaultTitle: 'NOTE',
    labelBg: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-700',
    bg: 'bg-blue-50/50 dark:bg-blue-500/5',
    icon: Lightbulb,
    iconColor: 'text-blue-500',
  },
  info: {
    defaultTitle: 'INFO',
    labelBg: 'bg-sky-500',
    border: 'border-sky-200 dark:border-sky-700',
    bg: 'bg-sky-50/50 dark:bg-sky-500/5',
    icon: Info,
    iconColor: 'text-sky-500',
  },
  warning: {
    defaultTitle: 'WARNING',
    labelBg: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-700',
    bg: 'bg-amber-50/50 dark:bg-amber-500/5',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  column: {
    defaultTitle: 'COLUMN',
    labelBg: 'bg-slate-500',
    border: 'border-slate-200 dark:border-slate-700',
    bg: 'bg-slate-50/50 dark:bg-slate-500/5',
    icon: MessageSquare,
    iconColor: 'text-slate-500',
  },
};

export default function Callout({ type = 'note', title, children }: CalloutProps) {
  const s = styles[type];
  const Icon = s.icon;

  return (
    <aside className={`relative my-8 rounded-lg border ${s.border} ${s.bg} px-5 pb-4 pt-9`}>
      <span
        className={`absolute -top-3 left-4 inline-flex items-center gap-1.5 rounded-md ${s.labelBg} px-3 py-1 text-xs font-bold tracking-wide text-white shadow-sm`}
      >
        <Icon className="size-3" />
        {title || s.defaultTitle}
      </span>
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  );
}
