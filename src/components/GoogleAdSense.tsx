'use client';

import { useEffect } from 'react';

interface GoogleAdSenseProps {
  adSlot?: string;
  adFormat?: string;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * グローバルな空間に拡張、既存のWindowオブジェクトに「adsbygoogle」という配列を追加
 */
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleAdSense({
  adSlot,
  adFormat = "auto",
  style,
  className,
}: GoogleAdSenseProps) {
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Adsense error ', err);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className || ""}`}
      style={{
        display: "block",
        ...style,
      }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
}
