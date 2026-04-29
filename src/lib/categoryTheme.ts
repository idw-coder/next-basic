export interface CategoryTheme {
  slug: string;
  label: string;
  badgeClass: string;
  accentClass: string;
  ringClass: string;
  /** クイズカード全体の背景色 (X投稿用に視認性を高める) */
  cardBgClass: string;
  /** カード上の装飾アクセント色 (▶▶▶ などのデコ用) */
  decoTextClass: string;
}

const DEFAULT_THEME: CategoryTheme = {
  slug: "default",
  label: "クイズ",
  badgeClass: "bg-white text-foreground border border-black/10",
  accentClass: "text-primary",
  ringClass: "ring-primary/20",
  cardBgClass: "bg-amber-200",
  decoTextClass: "text-amber-700/70",
};

const WHITE_BADGE = "bg-white text-foreground border border-black/10 shadow-sm";

const categoryThemeMap: Record<string, CategoryTheme> = {
  "javascript-basic": {
    slug: "javascript-basic",
    label: "JavaScript",
    badgeClass: WHITE_BADGE,
    accentClass: "text-amber-700",
    ringClass: "ring-amber-300",
    cardBgClass: "bg-amber-200",
    decoTextClass: "text-amber-700/70",
  },
  "ts-general": {
    slug: "ts-general",
    label: "TypeScript",
    badgeClass: WHITE_BADGE,
    accentClass: "text-blue-700",
    ringClass: "ring-blue-300",
    cardBgClass: "bg-blue-200",
    decoTextClass: "text-blue-700/70",
  },
  "html-basic": {
    slug: "html-basic",
    label: "HTML",
    badgeClass: WHITE_BADGE,
    accentClass: "text-orange-700",
    ringClass: "ring-orange-300",
    cardBgClass: "bg-orange-200",
    decoTextClass: "text-orange-700/70",
  },
  "react-basic": {
    slug: "react-basic",
    label: "React",
    badgeClass: WHITE_BADGE,
    accentClass: "text-sky-700",
    ringClass: "ring-sky-300",
    cardBgClass: "bg-sky-200",
    decoTextClass: "text-sky-700/70",
  },
  "vue-basic": {
    slug: "vue-basic",
    label: "Vue.js",
    badgeClass: WHITE_BADGE,
    accentClass: "text-emerald-700",
    ringClass: "ring-emerald-300",
    cardBgClass: "bg-emerald-200",
    decoTextClass: "text-emerald-700/70",
  },
  "nodejs-basic": {
    slug: "nodejs-basic",
    label: "Node.js",
    badgeClass: WHITE_BADGE,
    accentClass: "text-green-700",
    ringClass: "ring-green-300",
    cardBgClass: "bg-green-200",
    decoTextClass: "text-green-700/70",
  },
  nextjs: {
    slug: "nextjs",
    label: "Next.js",
    badgeClass: WHITE_BADGE,
    accentClass: "text-slate-800",
    ringClass: "ring-slate-300",
    cardBgClass: "bg-zinc-200",
    decoTextClass: "text-zinc-700/70",
  },
  "aws-basic": {
    slug: "aws-basic",
    label: "AWS",
    badgeClass: WHITE_BADGE,
    accentClass: "text-orange-700",
    ringClass: "ring-orange-300",
    cardBgClass: "bg-orange-200",
    decoTextClass: "text-orange-700/70",
  },
  "git-basic": {
    slug: "git-basic",
    label: "Git",
    badgeClass: WHITE_BADGE,
    accentClass: "text-rose-700",
    ringClass: "ring-rose-300",
    cardBgClass: "bg-rose-200",
    decoTextClass: "text-rose-700/70",
  },
  "nginx-basic": {
    slug: "nginx-basic",
    label: "Nginx",
    badgeClass: WHITE_BADGE,
    accentClass: "text-teal-700",
    ringClass: "ring-teal-300",
    cardBgClass: "bg-teal-200",
    decoTextClass: "text-teal-700/70",
  },
  "security-general": {
    slug: "security-general",
    label: "セキュリティ",
    badgeClass: WHITE_BADGE,
    accentClass: "text-red-700",
    ringClass: "ring-red-300",
    cardBgClass: "bg-red-200",
    decoTextClass: "text-red-700/70",
  },
  "sql-basic": {
    slug: "sql-basic",
    label: "SQL",
    badgeClass: WHITE_BADGE,
    accentClass: "text-fuchsia-700",
    ringClass: "ring-fuchsia-300",
    cardBgClass: "bg-fuchsia-200",
    decoTextClass: "text-fuchsia-700/70",
  },
  "cs-basic": {
    slug: "cs-basic",
    label: "CS基礎",
    badgeClass: WHITE_BADGE,
    accentClass: "text-purple-700",
    ringClass: "ring-purple-300",
    cardBgClass: "bg-purple-200",
    decoTextClass: "text-purple-700/70",
  },
  docker: {
    slug: "docker",
    label: "Docker",
    badgeClass: WHITE_BADGE,
    accentClass: "text-cyan-700",
    ringClass: "ring-cyan-300",
    cardBgClass: "bg-cyan-200",
    decoTextClass: "text-cyan-700/70",
  },
  linux: {
    slug: "linux",
    label: "Linux",
    badgeClass: WHITE_BADGE,
    accentClass: "text-zinc-700",
    ringClass: "ring-zinc-300",
    cardBgClass: "bg-zinc-200",
    decoTextClass: "text-zinc-700/70",
  },
};

export function getCategoryTheme(slug: string): CategoryTheme {
  return categoryThemeMap[slug] ?? { ...DEFAULT_THEME, slug };
}
