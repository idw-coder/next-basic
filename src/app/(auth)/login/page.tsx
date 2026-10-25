"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

// ログインのコールバックが失敗したとき /login?error=... に戻ってくる。値は src/lib/server/authAccount.ts
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  google: "Googleでのログインに失敗しました。もう一度お試しください。",
  microsoft: "Microsoftでのログインに失敗しました。もう一度お試しください。",
  microsoft_no_email:
    "このMicrosoftアカウントにはメールアドレスがないため、ログインできません。",
  microsoft_email_taken:
    "このメールアドレスは別のログイン方法で登録されています。Googleでログインしてください。",
};

function LoginError() {
  const error = useSearchParams().get("error");
  const message = error ? LOGIN_ERROR_MESSAGES[error] : undefined;
  if (!message) return null;

  return (
    <p role="alert" className="text-sm text-red-500 dark:text-red-400">
      {message}
    </p>
  );
}

// ログイン手段はOAuthのみ。プロバイダを足すときはボタンを並べる
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent>
          <div className="space-y-3">
            <Suspense fallback={null}>
              <LoginError />
            </Suspense>
            <p className="text-sm text-gray-500">初めての方も、そのまま無料で登録できます。</p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = "/api/auth/google";
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Googleでログイン
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = "/api/auth/microsoft";
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 21 21" aria-hidden="true">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              Microsoftでログイン
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
