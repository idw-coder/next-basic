'use client';

import { useEffect } from 'react';
import ScrollHint from 'scroll-hint';

export function ScrollHintInitializer() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.js-scrollable:not([data-scroll-hint-initialized])',
      ),
    );

    if (elements.length === 0) return;

    elements.forEach((element) => {
      element.dataset.scrollHintInitialized = 'true';
    });

    new ScrollHint(elements, {
      suggestiveShadow: true,
      i18n: {
        scrollable: 'スクロールできます',
      },
    });
  }, []);

  return null;
}
