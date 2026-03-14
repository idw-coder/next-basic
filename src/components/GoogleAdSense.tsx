'use client';

import { useEffect, useState } from 'react';

interface GoogleAdSenseProps {
  adSlot?: string;
  adFormat?: string;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * ?mode=entry 付きでアクセスした場合、sessionStorage にフラグを保存し、
 * そのタブが開いている間は広告要素を CSS で非表示にする。
 * タブを閉じると sessionStorage がクリアされ、通常表示に戻る。
 */
export function HideAdsForEntry() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "entry") {
      sessionStorage.setItem("entry", "1");
    }
    setHide(sessionStorage.getItem("entry") === "1");
  }, []);

  if (!hide) return null;
  return (
    <style>{`ins.adsbygoogle, [data-ad-slot] { display: none !important; }`}</style>
  );
}

export default function GoogleAdSense({
  adSlot,
  adFormat = "auto",
  style,
  className,
}: GoogleAdSenseProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Adsense error ', err);
    }
  }, []);

  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <ins
      className={`adsbygoogle ${className || ""}`}
      style={{
        display: "block",
        minWidth: "280px",
        minHeight: "100px",
        ...style,
      }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
}