"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface HeaderSearchProps {
  className?: string;
}

export default function HeaderSearch({ className }: HeaderSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form
      role="search"
      action="/search"
      method="get"
      className={cn("relative", className)}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
      />
      <input
        ref={inputRef}
        type="search"
        name="q"
        placeholder="問題・教科書を検索"
        aria-label="問題・教科書を検索"
        className="h-10 w-full rounded-lg border border-ink/10 bg-white/75 py-2 pl-9 pr-12 text-sm font-medium text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-brand-blue/35 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/15"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-ink/10 bg-cream-soft px-1.5 py-0.5 text-[10px] font-bold text-ink-muted lg:block">
        ⌘K
      </kbd>
    </form>
  );
}
