"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  Bookmark,
  RotateCcw,
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
  const [quizMenuOpen, setQuizMenuOpen] = useState(false);
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

  const linkClass = (active = false) =>
    cn(
      "relative flex items-center gap-2.5 px-4 py-3 text-sm font-bold transition-colors hover:text-brand-blue sm:px-3 sm:py-2",
      "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand-blue after:transition-transform",
      active
        ? "text-brand-blue after:scale-x-100"
        : "text-ink sm:text-ink-body",
    );
  const iconClass = "size-4 text-ink-muted shrink-0";
  const closeMenu = () => {
    setOpen(false);
    setBooksMenuOpen(false);
  };

  return (
    <div className="sm:static">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-none text-ink hover:bg-transparent hover:text-brand-blue sm:hidden"
        aria-label="メニュー"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      <nav
        className={`
          fixed inset-x-0 top-14 z-50 border-b border-cream-line bg-cream-deep/96 shadow-[0_18px_40px_rgba(35,35,35,0.08)] backdrop-blur-xl
          sm:static sm:flex sm:items-center sm:gap-1 sm:border-0 sm:bg-transparent sm:shadow-none sm:backdrop-blur-none
          ${open ? "block" : "hidden sm:flex"}
        `}
      >
        <div
          className="relative"
          onPointerEnter={() => setQuizMenuOpen(true)}
          onPointerLeave={() => setQuizMenuOpen(false)}
          onMouseEnter={() => setQuizMenuOpen(true)}
          onMouseLeave={() => setQuizMenuOpen(false)}
          onFocus={() => setQuizMenuOpen(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setQuizMenuOpen(false);
            }
          }}
        >
          <Link
            href="/#categories"
            className={linkClass(pathname === '/' || pathname.startsWith('/quiz'))}
            onClick={closeMenu}
            aria-haspopup="menu"
          >
            <BookOpen className={iconClass} />
            クイズ
            <ChevronDown
              className={cn(
                "hidden size-3.5 text-muted-foreground transition-transform sm:block",
                quizMenuOpen && "rotate-180",
              )}
            />
          </Link>

          <div
            className={cn(
              "hidden sm:block",
              "absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-2",
              "transition duration-150 ease-out",
              quizMenuOpen
                ? "visible pointer-events-auto opacity-100"
                : "invisible pointer-events-none opacity-0",
            )}
            role="menu"
          >
            <div className="overflow-hidden rounded-[18px] border border-cream-line bg-cream-soft shadow-[0_24px_60px_rgba(35,35,35,0.14)]">
              <div className="p-1.5">
                <Link
                  href="/#categories"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-ink-body transition-colors hover:bg-cream-deep hover:text-brand-blue"
                  onClick={closeMenu}
                >
                  <BookOpen className="size-4 text-brand-blue" />
                  クイズ一覧
                </Link>
                <Link
                  href="/quiz/bookmarks"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-ink-body transition-colors hover:bg-[#fff2cd] hover:text-[#b06f00]"
                  onClick={closeMenu}
                >
                  <Bookmark className="size-4 text-[#f3bf55]" />
                  ブックマーク
                </Link>
                <Link
                  href="/quiz/review"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-ink-body transition-colors hover:bg-rose-50 hover:text-rose-600"
                  onClick={closeMenu}
                >
                  <RotateCcw className="size-4 text-rose-500" />
                  復習
                </Link>
                <Link
                  href="/search"
                  role="menuitem"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-ink-body transition-colors hover:bg-cream-deep hover:text-brand-blue"
                  onClick={closeMenu}
                >
                  <Search className="size-4 text-brand-red" />
                  問題を検索
                </Link>
              </div>
            </div>
          </div>
        </div>
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
            className={linkClass(pathname.startsWith('/books'))}
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
              <div className="overflow-hidden rounded-[22px] border border-cream-line bg-cream-soft shadow-[0_24px_60px_rgba(35,35,35,0.14)]">
                <div className="flex items-center justify-between border-b border-cream-line bg-cream-deep/55 px-4 py-3">
                  <div>
                    <p className="text-sm font-black text-ink">教科書へ直接移動</p>
                    <p className="mt-0.5 text-xs font-bold text-ink-muted">読みたい分野を選べます</p>
                  </div>
                  <Link
                    href="/books"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-3 py-1.5 text-xs font-black text-white shadow-[3px_3px_0_var(--color-brand-lime)] transition-transform hover:-translate-y-0.5"
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
                        className="flex min-w-0 items-center gap-3 rounded-2xl px-2.5 py-2 text-ink transition-colors hover:bg-cream-deep hover:text-brand-blue focus:bg-cream-deep focus:outline-none"
                        onClick={closeMenu}
                      >
                        <span
                          className={cn(
                            "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-white",
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
                          <span className="mt-0.5 block line-clamp-1 text-xs font-medium text-ink-muted">
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
        <Link href="/#news" className={linkClass(false)} onClick={closeMenu}>
          <Bell className={iconClass} />
          お知らせ
        </Link>
        <Link
          href="/payment"
          className={linkClass(pathname === '/payment')}
          onClick={closeMenu}
        >
          <CreditCard className={iconClass} />
          プラン
        </Link>
        {/* entryのURLのみ表示 */}
        {showTech && (
          <Link
            href="/about/tech"
            className={linkClass(pathname === '/about/tech')}
            onClick={closeMenu}
          >
            <Wrench className={iconClass} />
            技術構成
          </Link>
        )}
        {isAdmin && (
          <Link
            href="/admin"
            className={linkClass(pathname.startsWith('/admin'))}
            onClick={closeMenu}
          >
            <Shield className={iconClass} />
            管理
          </Link>
        )}
        {isLoggedIn ? (
          <Link
            href="/profile"
            className={cn(linkClass(pathname === '/profile'), 'sm:ml-1')}
            aria-label="プロフィール"
            onClick={closeMenu}
          >
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
            <Link
              href="/login"
              className={cn(linkClass(pathname === '/login'), 'sm:hidden')}
              onClick={closeMenu}
            >
              <LogIn className={iconClass} />
              ログイン
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 hidden rounded-none border-0 border-b-2 border-ink bg-transparent px-1 font-black text-ink shadow-none transition-colors hover:bg-transparent hover:text-brand-blue sm:inline-flex"
              asChild
            >
              <Link href="/login" onClick={closeMenu}>
                ログイン
              </Link>
            </Button>
          </>
        )}
      </nav>
    </div>
  );
}
