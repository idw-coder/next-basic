import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  ArrowLeft,
  BookOpenCheck,
  ChevronRight,
  Shuffle,
  Lightbulb,
  Target,
  Users,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizListClient from "./QuizListClient";
import { getCategorySeoContent, type CategorySeoContent } from "./categoryContent";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8888";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://web-mondai.com";

export interface Tag {
  id: number;
  slug: string;
  name: string;
}

export interface Quiz {
  id: number;
  slug: string;
  question: string;
  tags: Tag[];
}

interface Category {
  id: number;
  slug: string;
  category_name: string;
  description?: string;
}

async function getCategory(categorySlug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const categories: Category[] = await res.json();
    return categories.find((c) => c.slug === categorySlug) || null;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

async function getQuizzes(
  categoryId: number,
  q?: string,
  tagSlug?: string
): Promise<Quiz[]> {
  try {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (tagSlug) params.append("tagSlug", tagSlug);

    const res = await fetch(
      `${API_BASE_URL}/api/quiz/category/${categoryId}/quizzes?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return [];
  }
}

async function getTagsByCategory(categoryId: number): Promise<Tag[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/quiz/category/${categoryId}/tags`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategory(categorySlug);

  if (!category) {
    return { title: "カテゴリが見つかりません" };
  }

  const title = `${category.category_name} 問題集 | ウェブエンジニア問題集`;
  const description =
    category.description
      ? `${category.category_name}の問題集。${category.description} 無料で学べる4択クイズ形式。`
      : `${category.category_name}に関する4択クイズ問題集。基礎から実践まで無料で学べます。`;

  return {
    title,
    description,
    alternates: {
      canonical: `/quiz/${categorySlug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ja_JP",
      url: `${SITE_URL}/quiz/${categorySlug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    keywords: [
      category.category_name,
      `${category.category_name} クイズ`,
      `${category.category_name} 問題`,
      "ウェブ開発",
      "学習",
      "無料",
    ],
  };
}

function buildJsonLd(
  category: Category,
  quizzes: Quiz[],
  categorySlug: string,
  seoContent: CategorySeoContent | null
) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${category.category_name} 問題集`,
        item: `${SITE_URL}/quiz/${categorySlug}`,
      },
    ],
  };

  const quizPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.category_name} 問題集`,
    description: category.description || `${category.category_name}に関するクイズ問題集`,
    url: `${SITE_URL}/quiz/${categorySlug}`,
    numberOfItems: quizzes.length,
    isPartOf: {
      "@type": "WebSite",
      name: "ウェブエンジニア問題集",
      url: SITE_URL,
    },
  };

  const jsonLdList: Record<string, unknown>[] = [breadcrumb, quizPage];

  if (seoContent && seoContent.faqs.length > 0) {
    jsonLdList.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seoContent.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return jsonLdList;
}

export default async function CategoryQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ q?: string; tagSlug?: string }>;
}) {
  const { category: categorySlug } = await params;
  const { q, tagSlug } = await searchParams;

  const category = await getCategory(categorySlug);

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>カテゴリが見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link href="/" className="inline-flex items-center gap-2">
                <ArrowLeft className="size-4 shrink-0" />
                トップページに戻る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [quizzes, tags] = await Promise.all([
    getQuizzes(category.id, q, tagSlug),
    getTagsByCategory(category.id),
  ]);

  const seoContent = getCategorySeoContent(categorySlug);
  const jsonLdList = buildJsonLd(category, quizzes, categorySlug, seoContent);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* 構造化データ */}
      {jsonLdList.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}

      {/* パンくずリスト */}
      <nav aria-label="パンくずリスト" className="mb-6 text-sm">
        <ol className="flex items-center gap-1 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">ホーム</Link>
          </li>
          <li><ChevronRight className="size-3.5" /></li>
          <li className="text-foreground font-medium">{category.category_name} 問題集</li>
        </ol>
      </nav>

      {/* ヘッダー */}
      <section className="mb-10 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none select-none" aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="none" fill="none">
          <path d="M -10 285 C 120 278 280 180 410 15 L 410 55 C 280 220 120 295 -10 300 Z" fill="#e5e7eb" opacity="0.4" />
        </svg>
        <div className="absolute top-1 right-6 sm:right-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/2 right-1 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/8 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-3 right-1/4 w-5 h-5 rounded-full bg-amber-200/30 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-0 left-1/4 w-4 h-4 rounded-full bg-gray-300/40 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-1/3 left-1 sm:left-5 w-6 h-6 rounded-full bg-primary/8 pointer-events-none" aria-hidden="true" />
        <div className="relative flex flex-col-reverse justify-center sm:flex-row sm:items-center gap-6">
          <div className="flex justify-center sm:justify-start">
            <Image
              src="/inpiration_man_color.png"
              alt=""
              width={588}
              height={761}
              className="w-full max-w-[120px] md:max-w-[160px] h-auto -scale-x-100"
            />
          </div>
          <div className="sm:flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2 md:text-3xl flex items-center gap-2">
              <BookOpenCheck className="size-6 shrink-0 text-primary" />
              {category.category_name} 問題集
            </h1>
            {category.description && (
              <p className="text-muted-foreground leading-relaxed">{category.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              全 <span className="font-semibold text-foreground">{quizzes.length}</span> 問
              {tags.length > 0 && ` ・ ${tags.length} タグ`}
            </p>
          </div>
        </div>
      </section>

      {/* ランダムクイズへの導線 */}
      <section className="mb-8">
        <Link href={`/quiz/random?category=${category.slug}`} className="block group">
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 p-3 sm:p-4 transition-colors">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors">
              <Shuffle className="size-4 sm:size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm sm:text-base">
                {category.category_name} ランダムクイズ
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                問題数を選んでランダムに出題
              </p>
            </div>
            <ArrowRight className="size-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* 問題一覧 */}
      <section className="mb-10">
        <h2 className="sr-only">{category.category_name}の問題一覧</h2>
        <QuizListClient
          initialQuizzes={quizzes}
          tags={tags}
          categoryId={category.id}
          categorySlug={categorySlug}
          currentQuery={q}
          currentTagSlug={tagSlug}
        />
      </section>

      {/* カテゴリ概要（SEOコンテンツ） */}
      {seoContent && (
        <section className="mb-10">
          <Card className="border-primary/10 bg-gradient-to-br from-primary/[0.03] to-transparent">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="size-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    {category.category_name}とは
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {seoContent.overview}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="size-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">
                    なぜ{category.category_name}を学ぶべきか
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {seoContent.whyLearn}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 出題トピック */}
      {seoContent && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <BookOpenCheck className="size-5 text-primary" />
            出題トピック
          </h2>
          <div className="flex gap-1 mb-4">
            <span className="w-4 h-1 rounded-full bg-red-400" />
            <span className="w-4 h-1 rounded-full bg-blue-400" />
            <span className="w-4 h-1 rounded-full bg-amber-400" />
            <span className="w-4 h-1 rounded-full bg-green-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {seoContent.topics.map((topic, i) => {
              const borderColors = ["border-l-red-400", "border-l-blue-400", "border-l-amber-400", "border-l-green-400", "border-l-purple-400", "border-l-cyan-400"];
              return (
                <div key={topic.title} className={`rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm border-l-[5px] ${borderColors[i % borderColors.length]} p-4`}>
                  <h3 className="text-sm font-bold text-foreground mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 対象者 */}
      {seoContent && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Users className="size-5 text-primary" />
            こんな方におすすめ
          </h2>
          <div className="flex gap-1 mb-4">
            <span className="w-4 h-1 rounded-full bg-red-400" />
            <span className="w-4 h-1 rounded-full bg-blue-400" />
            <span className="w-4 h-1 rounded-full bg-amber-400" />
            <span className="w-4 h-1 rounded-full bg-green-400" />
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {seoContent.targetAudience.map((audience, i) => {
              const dotColors = ["bg-red-400", "bg-blue-400", "bg-amber-400", "bg-green-400", "bg-purple-400", "bg-cyan-400"];
              return (
                <li
                  key={audience}
                  className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-3 text-sm text-foreground"
                >
                  <span className={`size-2 rounded-full ${dotColors[i % dotColors.length]} shrink-0`} />
                  {audience}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* よくある質問（FAQ） */}
      {seoContent && seoContent.faqs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            {category.category_name}に関するよくある質問
          </h2>
          <div className="flex gap-1 mb-4">
            <span className="w-4 h-1 rounded-full bg-red-400" />
            <span className="w-4 h-1 rounded-full bg-blue-400" />
            <span className="w-4 h-1 rounded-full bg-amber-400" />
            <span className="w-4 h-1 rounded-full bg-green-400" />
          </div>
          <div className="space-y-3">
            {seoContent.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-2 p-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 関連カテゴリ */}
      {seoContent && seoContent.relatedCategories.length > 0 && (
        <section className="mb-4">
          <h2 className="text-lg font-bold text-foreground mb-1">
            関連する問題集
          </h2>
          <div className="flex gap-1 mb-4">
            <span className="w-4 h-1 rounded-full bg-red-400" />
            <span className="w-4 h-1 rounded-full bg-blue-400" />
            <span className="w-4 h-1 rounded-full bg-amber-400" />
            <span className="w-4 h-1 rounded-full bg-green-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {seoContent.relatedCategories.map((related, i) => {
              const colors = [
                { border: "border-l-red-400", arrow: "bg-red-400" },
                { border: "border-l-blue-400", arrow: "bg-blue-400" },
                { border: "border-l-amber-400", arrow: "bg-amber-400" },
                { border: "border-l-green-400", arrow: "bg-green-400" },
              ];
              const c = colors[i % colors.length];
              return (
                <Link key={related.slug} href={`/quiz/${related.slug}`} className="group">
                  <div className={`flex items-center rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm pr-3 border-l-[5px] ${c.border} group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-200`}>
                    <span className="flex-1 font-bold text-sm text-foreground py-3 pl-4 truncate">
                      {related.name}
                    </span>
                    <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${c.arrow} group-hover:scale-110 transition-transform duration-200`}>
                      <ChevronRight className="size-4 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
