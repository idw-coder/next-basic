"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { syncLocalHistoryToServer } from "@/hooks/useQuizHistory";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login?error=google");
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      })
    );

    syncLocalHistoryToServer().finally(() => {
      router.replace("/");
    });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">ログイン中...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">ログイン中...</p>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}