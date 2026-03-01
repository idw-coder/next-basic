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

function useIsEntry() {
  const [isEntry, setIsEntry] = useState(false);
  useEffect(() => {
    setIsEntry(sessionStorage.getItem("entry") === "1");
  }, []);
  return isEntry;
}

export function AdSenseScript({ clientId }: { clientId: string }) {
  const isEntry = useIsEntry();
  if (isEntry) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}

export default function GoogleAdSense({
  adSlot,
  adFormat = "auto",
  style,
  className,
}: GoogleAdSenseProps) {
  const isEntry = useIsEntry();

  useEffect(() => {
    if (isEntry) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Adsense error ', err);
    }
  }, [isEntry]);

  if (process.env.NODE_ENV === 'development' || isEntry) {
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