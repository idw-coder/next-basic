import { Star } from 'lucide-react';

// チートシートの表で「とくに出番が多い行」に付ける印。
// 意味は各章の冒頭に凡例を1行置いて説明する。
export default function Pick() {
  return (
    <span
      className="mr-1.5 inline-block align-[-0.15em] text-amber-500 dark:text-amber-400"
      title="よく使うコマンド"
      role="img"
      aria-label="よく使うコマンド"
    >
      <Star className="size-3.5" fill="currentColor" strokeWidth={1.5} />
    </span>
  );
}
