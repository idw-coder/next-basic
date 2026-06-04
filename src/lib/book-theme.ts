// 書籍ごとのテーマ（カードのポップ感のための色セット）。
// /books 一覧ページとトップページの教科書セクションで共有する。

export interface BookTheme {
  cardBg: string;
  iconBg: string;
  iconText: string;
  accent: string;
  accentHover: string;
  badgeBg: string;
  badgeText: string;
}

export const DEFAULT_THEME: BookTheme = {
  cardBg: 'bg-amber-50',
  iconBg: 'bg-amber-200',
  iconText: 'text-amber-700',
  accent: 'text-amber-700',
  accentHover: 'group-hover:text-amber-700',
  badgeBg: 'bg-white',
  badgeText: 'text-amber-700',
};

const bookThemeMap: Record<string, BookTheme> = {
  'system-design': {
    cardBg: 'bg-emerald-100',
    iconBg: 'bg-emerald-200',
    iconText: 'text-emerald-800',
    accent: 'text-emerald-800',
    accentHover: 'group-hover:text-emerald-800',
    badgeBg: 'bg-white',
    badgeText: 'text-emerald-800',
  },
  javascript: {
    cardBg: 'bg-amber-100',
    iconBg: 'bg-amber-200',
    iconText: 'text-amber-800',
    accent: 'text-amber-800',
    accentHover: 'group-hover:text-amber-800',
    badgeBg: 'bg-white',
    badgeText: 'text-amber-800',
  },
  typescript: {
    cardBg: 'bg-indigo-100',
    iconBg: 'bg-indigo-200',
    iconText: 'text-indigo-700',
    accent: 'text-indigo-700',
    accentHover: 'group-hover:text-indigo-700',
    badgeBg: 'bg-white',
    badgeText: 'text-indigo-700',
  },
  'react-learning': {
    cardBg: 'bg-cyan-100',
    iconBg: 'bg-cyan-200',
    iconText: 'text-cyan-700',
    accent: 'text-cyan-700',
    accentHover: 'group-hover:text-cyan-700',
    badgeBg: 'bg-white',
    badgeText: 'text-cyan-700',
  },
  'css-basics': {
    cardBg: 'bg-blue-100',
    iconBg: 'bg-blue-200',
    iconText: 'text-blue-700',
    accent: 'text-blue-700',
    accentHover: 'group-hover:text-blue-700',
    badgeBg: 'bg-white',
    badgeText: 'text-blue-700',
  },
  'tailwind-css': {
    cardBg: 'bg-violet-100',
    iconBg: 'bg-violet-200',
    iconText: 'text-violet-700',
    accent: 'text-violet-700',
    accentHover: 'group-hover:text-violet-700',
    badgeBg: 'bg-white',
    badgeText: 'text-violet-700',
  },
  'cs-basics': {
    cardBg: 'bg-purple-100',
    iconBg: 'bg-purple-200',
    iconText: 'text-purple-700',
    accent: 'text-purple-700',
    accentHover: 'group-hover:text-purple-700',
    badgeBg: 'bg-white',
    badgeText: 'text-purple-700',
  },
  'next-js': {
    cardBg: 'bg-zinc-100',
    iconBg: 'bg-zinc-200',
    iconText: 'text-zinc-800',
    accent: 'text-zinc-800',
    accentHover: 'group-hover:text-zinc-900',
    badgeBg: 'bg-white',
    badgeText: 'text-zinc-800',
  },
  'git-basic': {
    cardBg: 'bg-rose-100',
    iconBg: 'bg-rose-200',
    iconText: 'text-rose-700',
    accent: 'text-rose-700',
    accentHover: 'group-hover:text-rose-700',
    badgeBg: 'bg-white',
    badgeText: 'text-rose-700',
  },
  'unit-testing': {
    cardBg: 'bg-slate-100',
    iconBg: 'bg-slate-200',
    iconText: 'text-slate-700',
    accent: 'text-slate-700',
    accentHover: 'group-hover:text-slate-700',
    badgeBg: 'bg-white',
    badgeText: 'text-slate-700',
  },
  'http-and-web-api': {
    cardBg: 'bg-orange-100',
    iconBg: 'bg-orange-200',
    iconText: 'text-orange-700',
    accent: 'text-orange-700',
    accentHover: 'group-hover:text-orange-700',
    badgeBg: 'bg-white',
    badgeText: 'text-orange-700',
  },
  'integration-and-e2e-testing': {
    cardBg: 'bg-teal-100',
    iconBg: 'bg-teal-200',
    iconText: 'text-teal-700',
    accent: 'text-teal-700',
    accentHover: 'group-hover:text-teal-700',
    badgeBg: 'bg-white',
    badgeText: 'text-teal-700',
  },
};

/** bookSlug に対応するテーマを返す。未登録の本は DEFAULT_THEME（amber）。 */
export function getBookTheme(bookSlug: string): BookTheme {
  return bookThemeMap[bookSlug] ?? DEFAULT_THEME;
}
