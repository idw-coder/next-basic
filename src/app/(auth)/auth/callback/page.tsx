"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncLocalHistoryToServer } from "@/hooks/useQuizHistory";

// Googleログイン成功後にサーバーからリダイレクトされてくる画面。
// session cookie はリダイレクトの時点でサーバーがセット済みなので、ここでは何も保存しない。
// （以前は URL の ?token= の JWT を localStorage に保存していた）
// ログインに失敗したときは、サーバーが直接 /login?error=google に送るため、ここには来ない
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    syncLocalHistoryToServer().finally(() => {
      router.replace("/");
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">ログイン中...</p>
    </div>
  );
}
