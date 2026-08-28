'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getHashTarget() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  try {
    return document.getElementById(decodeURIComponent(hash));
  } catch {
    return document.getElementById(hash);
  }
}

export function HashAnchorScroller() {
  const pathname = usePathname();

  useEffect(() => {
    let frameId = 0;

    const scrollToHash = () => {
      getHashTarget()?.scrollIntoView({ block: 'start' });
    };

    const scheduleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = requestAnimationFrame(scrollToHash);
      });
    };

    scheduleScroll();
    window.addEventListener('hashchange', scheduleScroll);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('hashchange', scheduleScroll);
    };
  }, [pathname]);

  return null;
}
