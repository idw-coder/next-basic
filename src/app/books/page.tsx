import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getAllBooks, getChaptersByBook } from "@/lib/books";

export const metadata: Metadata = {
  title: "Books | ウェブエンジニア問題集",
  description:
    "エンジニア初学者向けの技術書コンテンツ。体系的に基礎から学べます。",
};

export default function BooksPage() {
  const books = getAllBooks();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Books</h1>
        <p className="mt-2 text-gray-600">
          体系的に学べる技術書コンテンツです。クイズの前に、まずはここでインプットしましょう。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {books.map((book) => {
          const chapters = getChaptersByBook(book.bookSlug);
          return (
            <Link
              key={book.bookSlug}
              href={`/books/${book.bookSlug}`}
              className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {book.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {book.description}
                  </p>
                  <p className="mt-3 text-xs text-gray-500">
                    全{chapters.length}章
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
