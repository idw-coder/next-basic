'use client';

import { useEffect } from 'react';

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