"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type NewsItem = {
  date: string;
  text: string;
  isNew: boolean;
  link?: string;
};

const INITIAL_COUNT = 5;

export function NewsList({ items }: { items: NewsItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > INITIAL_COUNT;
  const visible = expanded ? items : items.slice(0, INITIAL_COUNT);

  return (
    <>
      <div id="news-list-items" className="divide-y divide-border">
        {visible.map((item, i) => {
          const content = (
            <div
              className={`py-3 space-y-1 ${item.link ? "group cursor-pointer" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {item.date}
                </span>
                {item.isNew && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1.5 py-0 leading-4"
                  >
                    NEW
                  </Badge>
                )}
              </div>
              <p
                className={`text-sm text-foreground ${item.link ? "group-hover:text-primary transition-colors" : ""}`}
              >
                {item.text}
              </p>
            </div>
          );
          return item.link ? (
            <Link key={i} href={item.link}>
              {content}
            </Link>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="news-list-items"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex min-h-11 w-full items-center justify-center gap-1 rounded-md py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded
            ? "閉じる"
            : `過去のお知らせを表示（残り ${items.length - INITIAL_COUNT} 件）`}
        </button>
      )}
    </>
  );
}
