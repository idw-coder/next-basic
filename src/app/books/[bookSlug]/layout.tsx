import { notFound } from "next/navigation";
import { getBook, getChaptersByBook } from "@/lib/books";
import {
  BookSidebarDesktop,
  BookSidebarMobile,
} from "../_components/BookSidebar";

interface BookLayoutProps {
  children: React.ReactNode;
  params: Promise<{ bookSlug: string }>;
}

export default async function BookLayout({
  children,
  params,
}: BookLayoutProps) {
  const { bookSlug } = await params;
  const book = getBook(bookSlug);
  if (!book) notFound();

  const chapters = getChaptersByBook(bookSlug);
  const sidebarChapters = chapters.map((c) => ({
    title: c.title,
    order: c.order,
    bookSlug: c.bookSlug,
    chapterSlug: c.chapterSlug,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="flex gap-8 py-6 md:py-10">
        <BookSidebarDesktop
          bookTitle={book.title}
          bookSlug={book.bookSlug}
          chapters={sidebarChapters}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <BookSidebarMobile
        bookTitle={book.title}
        bookSlug={book.bookSlug}
        chapters={sidebarChapters}
      />
    </div>
  );
}
