"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  Bell,
  User as UserIcon,
  LogIn,
  Wrench,
  Search,
  CreditCard,
  Library,
  Shield,
  ChevronDown,
  ArrowRight,
  Blocks,
  Braces,
  FileCode2,
  Atom,
  Paintbrush,
  Wind,
  Cpu,
  Globe,
  GitBranch,
  FlaskConical,
  Globe2,
  TestTube2,
  Database,
  type LucideIcon,
} from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";
import { Button } from "@/components/ui/button";
import { getBookTheme } from "@/lib/book-theme";
import { cn } from "@/lib/utils";

interface HeaderBook {
  bookSlug: string;
  title: string;
  description: string;
  coverImage?: string;
}

interface HeaderNavProps {
  books: HeaderBook[];
}

const bookIconMap: Record<string, LucideIcon> = {
  BookOpen,
  Blocks,
  Braces,
  FileCode2,
  Atom,
  Paintbrush,
  Wind,
  Cpu,
  Globe,
  GitBranch,
  FlaskConical,
  Globe2,
  TestTube2,
  Database,
};

export default function HeaderNav({ books }: HeaderNavProps) {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [booksMenuOpen, setBooksMenuOpen] = useState(false);
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
      const parsed = stored ? JSON.parse(stored) : null;
      setUserEmail(parsed?.email ?? null);
      setIsAdmin(parsed?.role === "admin");
    } catch {
      setUserEmail(null);
      setIsAdmin(false);
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
  const closeMenu = () => {
    setOpen(false);
    setBooksMenuOpen(false);
  };

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
        <Link href="/search" className={linkClass} onClick={closeMenu}>
          <Search className={iconClass} />
          検索
        </Link>
        <Link href="/#categories" className={linkClass} onClick={closeMenu}>
          <BookOpen className={iconClass} />
          クイズ
        </Link>
        <div
          className="relative"
          onPointerEnter={() => setBooksMenuOpen(true)}
          onPointerLeave={() => setBooksMenuOpen(false)}
          onMouseEnter={() => setBooksMenuOpen(true)}
          onMouseLeave={() => setBooksMenuOpen(false)}
          onFocus={() => setBooksMenuOpen(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setBooksMenuOpen(false);
            }
          }}
        >
          <Link
            href="/books"
            className={linkClass}
            onClick={closeMenu}
            aria-haspopup="menu"
          >
            <Library className={iconClass} />
            教科書
            <ChevronDown
              className={cn(
                "hidden size-3.5 text-muted-foreground transition-transform sm:block",
                booksMenuOpen && "rotate-180",
              )}
            />
          </Link>

          {books.length > 0 && (
            <div
              className={cn(
                "hidden sm:block",
                "absolute left-1/2 top-full z-50 w-[34rem] -translate-x-1/2 pt-2",
                "transition duration-150 ease-out",
                booksMenuOpen
                  ? "visible pointer-events-auto opacity-100"
                  : "invisible pointer-events-none opacity-0",
              )}
              role="menu"
            >
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">教科書へ直接移動</p>
                    <p className="mt-0.5 text-xs text-gray-500">読みたい分野を選べます</p>
                  </div>
                  <Link
                    href="/books"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    onClick={closeMenu}
                  >
                    一覧
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                <div className="grid max-h-[28rem] grid-cols-2 gap-1 overflow-y-auto p-2">
                  {books.map((book) => {
                    const theme = getBookTheme(book.bookSlug);
                    const FallbackIcon = bookIconMap[theme.iconName] ?? BookOpen;

                    return (
                      <Link
                        key={book.bookSlug}
                        href={`/books/${book.bookSlug}`}
                        role="menuitem"
                        className="flex min-w-0 items-center gap-3 rounded-md px-2.5 py-2 text-gray-900 transition-colors hover:bg-gray-50 hover:text-primary focus:bg-gray-50 focus:outline-none"
                        onClick={closeMenu}
                      >
                        <span
                          className={cn(
                            "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-100",
                            theme.iconBg,
                          )}
                        >
                          {book.coverImage ? (
                            <Image
                              src={book.coverImage}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-contain p-1.5"
                            />
                          ) : (
                            <FallbackIcon className={cn("size-6", theme.iconText)} strokeWidth={1.8} />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-inherit">
                            {book.title}
                          </span>
                          <span className="mt-0.5 block line-clamp-1 text-xs text-gray-500">
                            {book.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        <Link href="/#news" className={linkClass} onClick={closeMenu}>
          <Bell className={iconClass} />
          お知らせ
        </Link>
        <Link href="/payment" className={linkClass} onClick={closeMenu}>
          <CreditCard className={iconClass} />
          プラン
        </Link>
        {/* entryのURLのみ表示 */}
        {showTech && (
          <Link href="/about/tech" className={linkClass} onClick={closeMenu}>
            <Wrench className={iconClass} />
            技術構成
          </Link>
        )}
        {isAdmin && (
          <Link href="/admin" className={linkClass} onClick={closeMenu}>
            <Shield className={iconClass} />
            管理
          </Link>
        )}
        {isLoggedIn ? (
          <Link href="/profile" className={`${linkClass} sm:ml-1`} aria-label="プロフィール" onClick={closeMenu}>
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
            <Link href="/login" className={`${linkClass} sm:hidden`} onClick={closeMenu}>
              <LogIn className={iconClass} />
              ログイン
            </Link>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex ml-1 rounded-full" asChild>
              <Link href="/login" onClick={closeMenu}>ログイン</Link>
            </Button>
          </>
        )}
      </nav>
    </div>
  );
}
