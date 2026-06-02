"use client";

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.role !== "admin") {
          router.replace("/");
          return;
        }
      } catch {
        router.replace("/login");
        return;
      }
    }
    setAuthed(true);
  }, [router]);

  const handleSignout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!authed) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-gray-50 flex flex-col">
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-gray-200 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={handleSignout}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 w-full"
          >
            <LogOut className="h-4 w-4" />
            サインアウト
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
