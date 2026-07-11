import { cn } from "@/lib/utils";

const sizeClass = {
  /** ロゴ・サブ見出し用 */
  sm: "h-1 w-4",
  /** セクション見出し用 */
  md: "h-1.5 w-6",
  /** ページヒーロー用 */
  lg: "h-2 w-10",
} as const;

interface TriBarProps {
  size?: keyof typeof sizeClass;
  className?: string;
}

/** ブランドの3本線アクセント（赤・青・ライムで固定） */
export function TriBar({ size = "md", className }: TriBarProps) {
  const bar = sizeClass[size];
  return (
    <span className={cn("flex gap-1", className)} aria-hidden="true">
      <span className={cn(bar, "rounded-full bg-brand-red")} />
      <span className={cn(bar, "rounded-full bg-brand-blue")} />
      <span className={cn(bar, "rounded-full bg-brand-lime ring-1 ring-ink/10")} />
    </span>
  );
}
