"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X, BookOpen, Bell, User as UserIcon, LogIn, Wrench } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";
import { Button } from "@/components/ui/button";

export default function HeaderNav() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("mode") === "entry") {
      sessionStorage.setItem("entry", "1");
    }
    setShowTech(sessionStorage.getItem("entry") === "1");
  }, [searchParams]);

  useEffect(() => {
    setOpen(false);
    setIsLoggedIn(!!localStorage.getItem("token"));
    try {
      const stored = localStorage.getItem("user");
      setUserEmail(stored ? JSON.parse(stored)?.email ?? null : null);
    } catch {
      setUserEmail(null);
    }
  }, [pathname]);

  const avatarSvg = useMemo(() => {
    if (!userEmail) return null;
    const svg = createAvatar(identicon, { seed: userEmail, size: 32 }).toString();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [userEmail]);

  const linkClass =
    "flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted sm:hover:bg-transparent sm:text-muted-foreground sm:hover:text-foreground sm:px-3 sm:py-2 sm:rounded-md transition-colors";
  const iconClass = "size-4 text-muted-foreground shrink-0";

  return (
    <div className="sm:static">
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        aria-label="メニュー"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      <nav
        className={`
          fixed inset-x-0 top-14 border-b bg-background z-50
          sm:static sm:flex sm:items-center sm:gap-1 sm:border-0 sm:bg-transparent
          ${open ? "block" : "hidden sm:flex"}
        `}
      >
        <Link href="/#categories" className={linkClass}>
          <BookOpen className={iconClass} />
          カテゴリ
        </Link>
        <Link href="/#news" className={linkClass}>
          <Bell className={iconClass} />
          お知らせ
        </Link>
        {/* entryのURLのみ表示 */}
        {showTech && (
          <Link href="/about/tech" className={linkClass}>
            <Wrench className={iconClass} />
            技術構成
          </Link>
        )}
        {isLoggedIn ? (
          <Link href="/profile" className={`${linkClass} sm:ml-1`} aria-label="プロフィール">
            {avatarSvg ? (
              <Image
                src={avatarSvg}
                alt=""
                width={16}
                height={16}
                className="rounded-full border bg-muted size-4 sm:size-7"
                unoptimized
              />
            ) : (
              <UserIcon className={iconClass} />
            )}
            <span className="sm:hidden">プロフィール</span>
          </Link>
        ) : (
          <>
            <Link href="/login" className={`${linkClass} sm:hidden`}>
              <LogIn className={iconClass} />
              ログイン
            </Link>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex ml-1 rounded-full" asChild>
              <Link href="/login">ログイン</Link>
            </Button>
          </>
        )}
      </nav>
    </div>
  );
}
