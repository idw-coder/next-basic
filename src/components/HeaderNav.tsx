"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";

const item = "block px-4 py-2.5 sm:px-3 sm:py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 sm:rounded-md transition-colors whitespace-nowrap";

export default function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setIsOpen(false);
    try {
      const stored = localStorage.getItem("user");
      const parsed = stored ? JSON.parse(stored) : null;
      setUserEmail(parsed?.email ?? null);
    } catch {
      setUserEmail(null);
    }
  }, [pathname]);

  const avatarSvg = useMemo(() => {
    if (!userEmail) return null;
    const svg = createAvatar(identicon, { seed: userEmail, size: 32 }).toString();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [userEmail]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="relative sm:static">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="sm:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="メニュー"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <nav className={`flex-col absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-sm shadow-lg py-1 z-50 sm:static sm:flex-row sm:items-center sm:gap-1 sm:w-auto sm:bg-transparent sm:border-0 sm:shadow-none sm:py-0 ${isOpen ? "flex" : "hidden sm:flex"}`}>
        <Link href="/#categories" className={item}>カテゴリ</Link>
        <Link href="/#news" className={item}>お知らせ</Link>
        {isLoggedIn ? (
          <>
            <Link
              href="/profile"
              className="block px-4 py-2.5 sm:px-2 sm:py-1 sm:rounded-md transition-opacity hover:opacity-70"
              aria-label="プロフィール"
            >
              {avatarSvg ? (
                <Image
                  src={avatarSvg}
                  alt="プロフィールアイコン"
                  width={32}
                  height={32}
                  className="rounded-full border bg-muted"
                  unoptimized
                />
              ) : (
                <span className="text-sm text-gray-600">プロフィール</span>
              )}
            </Link>
            {/* <button onClick={handleLogout} className={`w-full text-left ${item}`}>ログアウト</button> */}
          </>
        ) : (
          <Link href="/login" className={item}>ログイン</Link>
        )}
      </nav>
    </div>
  );
}
