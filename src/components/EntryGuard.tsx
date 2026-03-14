"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * sessionStorage に entry フラグがない場合、トップページにリダイレクトする。
 * ?mode=entry 付きでアクセスした場合もフラグを保存してそのまま表示する。
 */
export function EntryGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "entry") {
      sessionStorage.setItem("entry", "1");
    }
    if (sessionStorage.getItem("entry") === "1") {
      setAllowed(true);
    } else {
      router.replace("/");
    }
  }, [router]);

  if (!allowed) return null;
  return <>{children}</>;
}
