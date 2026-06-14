'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

function findTextRanges(root: Element, query: string): Range[] {
  const ranges: Range[] = [];
  const q = query.toLowerCase();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent?.toLowerCase() || '';
    let startIndex = 0;
    for (;;) {
      const idx = text.indexOf(q, startIndex);
      if (idx === -1) break;
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + query.length);
      ranges.push(range);
      startIndex = idx + 1;
    }
  }

  return ranges;
}

const supportsHighlight =
  typeof window !== 'undefined' && typeof CSS !== 'undefined' && 'highlights' in CSS;

function clearHighlights() {
  if (supportsHighlight) {
    CSS.highlights.delete('book-search');
    CSS.highlights.delete('book-search-current');
  }
}

function applyHighlightStyles(ranges: Range[], currentIdx: number) {
  if (!supportsHighlight || ranges.length === 0) {
    clearHighlights();
    return;
  }
  CSS.highlights.set('book-search', new Highlight(...ranges));
  CSS.highlights.set('book-search-current', new Highlight(ranges[currentIdx]));
}

export function SearchHighlighter() {
  const matchesRef = useRef<Range[]>([]);
  const indexRef = useRef(0);
  const [query, setQuery] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const onQuery = (e: Event) => {
      setQuery((e as CustomEvent<{ query: string }>).detail.query);
    };
    const onClear = () => setQuery('');
    document.addEventListener('book-search-query', onQuery);
    document.addEventListener('book-search-clear', onClear);
    return () => {
      document.removeEventListener('book-search-query', onQuery);
      document.removeEventListener('book-search-clear', onClear);
    };
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      matchesRef.current = [];
      indexRef.current = 0;
      clearHighlights();
      document.dispatchEvent(
        new CustomEvent('book-search-matches', { detail: { count: 0, index: 0 } }),
      );
      return;
    }

    const timer = setTimeout(() => {
      const article = document.querySelector('article');
      if (!article) return;

      const ranges = findTextRanges(article, query);
      matchesRef.current = ranges;
      indexRef.current = 0;
      applyHighlightStyles(ranges, 0);

      document.dispatchEvent(
        new CustomEvent('book-search-matches', {
          detail: { count: ranges.length, index: 0 },
        }),
      );

      if (ranges.length > 0) {
        ranges[0].startContainer.parentElement?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [query, pathname]);

  useEffect(() => {
    const onNav = (e: Event) => {
      const { direction } = (e as CustomEvent<{ direction: 'next' | 'prev' }>).detail;
      const ranges = matchesRef.current;
      if (ranges.length === 0) return;
      const cur = indexRef.current;
      const next =
        direction === 'next'
          ? (cur + 1) % ranges.length
          : (cur - 1 + ranges.length) % ranges.length;
      indexRef.current = next;
      applyHighlightStyles(ranges, next);
      document.dispatchEvent(
        new CustomEvent('book-search-matches', {
          detail: { count: ranges.length, index: next },
        }),
      );
      ranges[next].startContainer.parentElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    };
    document.addEventListener('book-search-nav', onNav);
    return () => document.removeEventListener('book-search-nav', onNav);
  }, []);

  useEffect(() => {
    if (!query) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && matchesRef.current.length > 0) {
        e.preventDefault();
        document.dispatchEvent(
          new CustomEvent('book-search-nav', {
            detail: { direction: e.shiftKey ? 'prev' : 'next' },
          }),
        );
      }
      if (e.key === 'Escape') {
        setQuery('');
        document.dispatchEvent(new CustomEvent('book-search-clear'));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  useEffect(() => {
    return () => clearHighlights();
  }, []);

  return null;
}
