'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

// 目次を表示する最小見出し数。これ未満の章では目次を出さない
const MIN_TOC_ITEMS = 3;

function useActiveHeading(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // 画面上部（ヘッダー下）の帯を見出しが横切ったら現在地とみなす
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return activeId;
}

function TocList({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[];
  activeId?: string | null;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.id} className={cn(item.level === 3 && 'pl-4')}>
          <a
            href={`#${item.id}`}
            onClick={onNavigate}
            className={cn(
              'block py-0.5 leading-snug transition-colors',
              activeId === item.id
                ? 'text-primary font-medium'
                : 'text-gray-500 hover:text-gray-900',
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** デスクトップ（xl以上）: 本文右に追従表示するTOC */
export function ChapterTocDesktop({ items }: { items: TocItem[] }) {
  const activeId = useActiveHeading(items);
  if (items.length < MIN_TOC_ITEMS) return null;

  return (
    <nav aria-label="この章の目次" className="text-xs">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-gray-900">
        <List className="h-3.5 w-3.5" />
        この章の目次
      </p>
      <TocList items={items} activeId={activeId} />
    </nav>
  );
}

/** モバイル〜lg: 章タイトル下に折りたたみで表示するTOC */
export function ChapterTocMobile({ items }: { items: TocItem[] }) {
  if (items.length < MIN_TOC_ITEMS) return null;

  return (
    <details className="group mb-6 rounded-lg border border-gray-200 bg-gray-50/50 xl:hidden">
      <summary className="flex cursor-pointer select-none items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-gray-900 [&::-webkit-details-marker]:hidden">
        <List className="h-4 w-4" />
        この章の目次
        <span className="ml-auto text-xs font-normal text-gray-400 group-open:hidden">
          開く
        </span>
        <span className="ml-auto hidden text-xs font-normal text-gray-400 group-open:inline">
          閉じる
        </span>
      </summary>
      <div className="border-t border-gray-200 px-4 py-3 text-sm">
        <TocList items={items} />
      </div>
    </details>
  );
}
