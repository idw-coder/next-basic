'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 見出しへ飛んだあと、レイアウトの変化に合わせて位置を直し続ける時間
const PIN_DURATION_MS = 8000;

// 読者が自分でスクロールし始めたら、位置の補正をやめる
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

function getHashTarget() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  try {
    return document.getElementById(decodeURIComponent(hash));
  } catch {
    return document.getElementById(hash);
  }
}

// MermaidDiagram はクライアントで非同期に描画され、枠が50pxほどから数百pxへ伸びる。
// ハッシュへのスクロール位置はその前に決まるため、見出しより上で図が描画されると
// 目的の見出しが画面の下へ押し出される。ページの高さが変わるたびに見出しへ合わせ直す。
export function HashAnchorScroller() {
  const pathname = usePathname();

  useEffect(() => {
    let frameId = 0;
    let pinTimer = 0;
    let pinning = false;
    let pageHeight = 0;

    const scrollToHash = (behavior?: ScrollBehavior) => {
      getHashTarget()?.scrollIntoView({ block: 'start', behavior });
    };

    // 図の描画中にスムーズスクロールを重ねると、古い目標位置で止まるので即時に合わせる。
    // observe直後の通知では高さが変わっていないので、目次クリックのスムーズスクロールは邪魔しない
    const resizeObserver = new ResizeObserver(() => {
      const height = document.documentElement.scrollHeight;
      if (!pinning || height === pageHeight) return;
      pageHeight = height;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => scrollToHash('instant'));
    });

    const stopPinning = () => {
      pinning = false;
      clearTimeout(pinTimer);
      resizeObserver.disconnect();
      USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, stopPinning));
    };

    const startPinning = () => {
      stopPinning();
      if (!getHashTarget()) return;
      pinning = true;
      pageHeight = document.documentElement.scrollHeight;
      resizeObserver.observe(document.documentElement);
      resizeObserver.observe(document.body);
      pinTimer = window.setTimeout(stopPinning, PIN_DURATION_MS);
      USER_SCROLL_EVENTS.forEach((type) =>
        window.addEventListener(type, stopPinning, { passive: true }),
      );
    };

    const scheduleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = requestAnimationFrame(() => {
          scrollToHash();
          startPinning();
        });
      });
    };

    scheduleScroll();
    window.addEventListener('hashchange', scheduleScroll);

    return () => {
      cancelAnimationFrame(frameId);
      stopPinning();
      window.removeEventListener('hashchange', scheduleScroll);
    };
  }, [pathname]);

  return null;
}
