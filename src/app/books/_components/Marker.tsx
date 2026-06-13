import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';

interface MarkerProps {
  children: ReactNode;
}

function normalizeMarkerChildren(children: ReactNode) {
  const rawItems = Children.toArray(children);
  const unwrappedChildren =
    rawItems.length === 1 && isValidElement(rawItems[0]) && rawItems[0].type === 'p'
      ? (rawItems[0].props as { children?: ReactNode }).children
      : children;

  const items = Children.toArray(unwrappedChildren);
  const firstContentIndex = items.findIndex(
    (item) => typeof item !== 'string' || item.trim().length > 0,
  );

  if (firstContentIndex === -1) {
    return null;
  }

  const lastContentIndex = items.findLastIndex(
    (item) => typeof item !== 'string' || item.trim().length > 0,
  );
  const contentItems = items.slice(firstContentIndex, lastContentIndex + 1);

  return contentItems.map((item, index) => {
    if (typeof item !== 'string') {
      return item;
    }

    let text = item.replace(/\s*\n\s*/g, ' ');
    if (index === 0) {
      text = text.trimStart();
    }
    if (index === contentItems.length - 1) {
      text = text.trimEnd();
    }

    return text;
  });
}

export default function Marker({ children }: MarkerProps) {
  return (
    <span className="book-marker">
      {normalizeMarkerChildren(children)}
    </span>
  );
}
