"use client";

import { fetchNextApiJson } from "@/lib/nextApiClient";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  HelpCircle,
  Shapes,
  Tag,
  Users,
  NotebookPen,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: Home },
  { href: "/admin/notes/new", label: "ノート作成", icon: NotebookPen },
  { href: "/admin/quizzes", label: "クイズ管理", icon: HelpCircle },
  { href: "/admin/quiz-categories", label: "カテゴリー管理", icon: Shapes },
  { href: "/admin/quiz-tags", label: "クイズタグ管理", icon: Tag },
  { href: "/admin/users", label: "ユーザー管理", icon: Users },
];

interface MeResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  role?: string;
}

type AuthStatus = "checking" | "authenticated" | "error";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    // ログイン状態は httpOnly の session cookie で見えないため、/api/auth/me に聞く。
    // 401（未ログイン）なら下の catch で /login へ送る
    let active = true;

    void (async () => {
      try {
        const response = await fetchNextApiJson<MeResponse>("/api/auth/me");
        if (!active) return;

        const role = response.role ?? "user";

        if (role !== "admin") {
          router.replace("/");
          return;
        }

        setAuthStatus("authenticated");
      } catch (error) {
        if (!active) return;

        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 401 || status === 404) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        setAuthStatus("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSignout = async () => {
    // session cookie は httpOnly で画面から消せないため、サーバーに消してもらう。
    // 失敗しても画面上はログアウトさせる（/login へ送る）
    await fetchNextApiJson("/api/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (authStatus === "checking") return null;

  if (authStatus === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-gray-600">認証情報を確認できませんでした。</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full border-b bg-gray-50 md:w-60 md:border-b-0 md:border-r">
        <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:p-3 md:space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm md:gap-3 ${
                  active
                    ? "bg-gray-200 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-2 md:p-3">
          <button
            onClick={handleSignout}
            className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 md:justify-start md:gap-3"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            サインアウト
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-x-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
