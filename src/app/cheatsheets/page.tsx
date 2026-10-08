import { MoveRight, NotebookTabs, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { getBookTheme } from '@/lib/book-theme';
import { getBook, getChapter } from '@/lib/books';
import { SITE_URL } from '@/lib/site';
import { Box, Card, Chip, Typography } from '@mui/material';

export const metadata: Metadata = {
  title: 'プログラミングチートシート一覧｜目的からすぐ引ける早見表',
  description:
    'HTML文字参照、JavaScript、正規表現、Docker、Git、GitHub Actions、Zod、AIエージェント開発のチートシートをまとめています。構文やコマンドを目的別に素早く確認できます。',
  alternates: { canonical: '/cheatsheets' },
  openGraph: {
    title: 'プログラミングチートシート一覧',
    description: 'Web開発の構文・コマンド・設定を目的別にすぐ引けるチートシート集です。',
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/cheatsheets`,
  },
};

const CHEATSHEET_SHORTCUTS = [
  {
    label: 'HTMLエンティティ',
    summary: '&lt;・&amp;・&nbsp;',
    bookSlug: 'html-basics',
    chapterSlug: 'html-cheatsheet',
    anchor: 'html-entities',
  },
  {
    label: '配列メソッド',
    summary: 'map・filter・reduce',
    bookSlug: 'javascript',
    chapterSlug: '07-arrays',
    anchor: 'cheatsheet',
  },
  {
    label: '制御文字',
    summary: '\\n・\\t・\\r・\\0',
    bookSlug: 'javascript',
    chapterSlug: '08-string-methods',
    anchor: 'control-characters',
  },
  {
    label: '日時・タイムゾーン',
    summary: 'UTC・JST・ISO 8601',
    bookSlug: 'javascript',
    chapterSlug: '22-date',
    anchor: 'date-time-cheatsheet',
  },
  {
    label: '正規表現',
    summary: '記号・フラグ・実例',
    bookSlug: 'javascript',
    chapterSlug: '08-string-methods',
    anchor: 'よく使うパターン部品',
  },
  {
    label: 'Zod',
    summary: 'スキーマ・メソッド',
    bookSlug: 'zod',
    chapterSlug: 'cheatsheet',
  },
  {
    label: 'Gitコマンド',
    summary: 'add・commit・push',
    bookSlug: 'git-basic',
    chapterSlug: '11-cheatsheet',
  },
  {
    label: 'Dockerコマンド',
    summary: 'pull・run・ps・stop',
    bookSlug: 'docker',
    chapterSlug: 'image-and-container-basics',
  },
  {
    label: 'GitHub Actions',
    summary: 'トリガー・式・ジョブ',
    bookSlug: 'github-actions',
    chapterSlug: '12-cheatsheet',
  },
  {
    label: 'AIエージェント',
    summary: 'プロンプト指示・ルール設定・権限',
    bookSlug: 'ai-agent-development',
    chapterSlug: 'cheatsheet',
  },
] as const;

export default function CheatsheetsPage() {
  const items = CHEATSHEET_SHORTCUTS.flatMap((shortcut) => {
    const book = getBook(shortcut.bookSlug);
    const chapter = getChapter(shortcut.bookSlug, shortcut.chapterSlug);
    if (!book || !chapter || chapter.draft) return [];

    const href = `/books/${shortcut.bookSlug}/${shortcut.chapterSlug}${
      'anchor' in shortcut ? `#${encodeURIComponent(shortcut.anchor)}` : ''
    }`;

    return [{ ...shortcut, book, href }];
  });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'プログラミングチートシート一覧',
      description: 'Web開発の構文・コマンド・設定を目的別に確認できるチートシート集です。',
      url: `${SITE_URL}/cheatsheets`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          url: `${SITE_URL}${item.href}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'チートシート',
          item: `${SITE_URL}/cheatsheets`,
        },
      ],
    },
  ];

  return (
    <Box
      sx={{
        background:
          'linear-gradient(180deg, var(--color-cream-deep) 0%, #ffffff 38%, var(--color-cream) 100%)',
      }}
    >
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <Box component="section" sx={{ px: 2, py: { xs: 3.5, sm: 6 } }}>
        <Box sx={{ maxWidth: '72rem', mx: 'auto' }}>
          <Chip
            icon={<Sparkles size={14} />}
            label="必要なところだけ、すぐ引ける"
            variant="outlined"
            sx={{
              borderColor: 'rgba(9, 103, 201, 0.2)',
              bgcolor: 'rgba(255, 255, 255, 0.75)',
              color: 'primary.main',
              fontWeight: 900,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              '& .MuiChip-icon': {
                color: 'inherit',
              },
              px: 2,
            }}
          />
          <Typography
            component="h1"
            sx={{
              mt: 1.5,
              fontFamily: 'var(--font-display)',
              fontSize: '1.875rem',
              fontWeight: 900,
              fontSynthesis: 'none',
              lineHeight: 1.25,
              letterSpacing: '-0.025em',
              '@media (min-width: 640px)': {
                mt: 2,
                fontSize: '3rem',
              },
            }}
          >
            チートシート
          </Typography>
          <Typography
            component="p"
            sx={{
              mt: 1.25,
              color: 'var(--color-ink-body)',
              fontSize: '0.875rem',
              fontWeight: 700,
              lineHeight: '1.5rem',
              '@media (min-width: 640px)': {
                mt: 2,
                fontSize: '1.125rem',
                lineHeight: '2rem',
              },
            }}
          >
            構文やコマンドを忘れたときに、目的から素早く確認できる早見表をまとめました。
            <br />
            詳しい理由を知りたくなったら、そのまま各教科書の解説へ進めます。
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: '72rem', mx: 'auto', px: 2, py: { xs: 3, sm: 4 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
            '@media(min-width: 640px)': {
              gap: 2,
            },
            '@media(min-width: 1024px)': {
              gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
            },
          }}
        >
          {items.map((item) => {
            const { book } = item;
            const theme = getBookTheme(book.bookSlug);

            return (
              <Link
                key={item.label}
                href={item.href}
                className="group"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  outline: 'none',
                }}
              >
                <Card
                  className={theme.cardBg}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    minHeight: 96,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    overflow: 'hidden',
                    p: 1.25,
                    border: '1px solid rgba(35, 35, 35, 0.1)',
                    borderRadius: '0.625rem',
                    boxShadow: '0 8px 20px rgba(35, 35, 35, 0.06)',
                    transition: 'transform 200ms, box-shadow 200ms',
                    '.group:hover &': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 35px rgba(35, 35, 35, 0.11)',
                    },
                    '.group:focus-visible &': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '4px',
                    },
                    '@media (min-width: 640px)': {
                      minHeight: 120,
                      p: 2,
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 25px rgba(35, 35, 35, 0.06)',
                    },
                  }}
                >
                  <Box
                    component="span"
                    className={theme.iconBg}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '3px solid rgba(255, 255, 255, 0.7)',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      '@media (min-width: 640px)': {
                        width: 52,
                        height: 52,
                        borderRadius: '0.75rem',
                        borderWidth: '4px',
                      },
                    }}
                  >
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 52px, 32px"
                        style={{
                          objectFit: 'contain',
                          padding: 6,
                        }}
                      />
                    ) : (
                      <NotebookTabs className={theme.iconText} size={20} strokeWidth={1.8} />
                    )}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'inline-flex',
                      color: 'text.secondary',
                      fontSize: '18px',
                      lineHeight: 0,
                      transition: 'transform 150ms',
                      '.group:hover &': {
                        color: 'primary.main',
                        transform: 'translateX(4px)',
                      },
                      '@media (min-width: 640px)': {
                        top: 16,
                        right: 16,
                        fontSize: '20px',
                      },
                    }}
                  >
                    <MoveRight size="1em" />
                  </Box>

                  <Box
                    sx={{
                      mt: 'auto',
                      minWidth: 0,
                      pt: 1.25,
                      '@media (min-width: 640px)': {
                        pt: 2,
                      },
                    }}
                  >
                    <Typography
                      component="h2"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 900,
                        lineHeight: 1.25,
                        transition: 'color 150ms',
                        '.group:hover &': {
                          color: 'primary.main',
                        },
                        '@media (min-width: 640px)': {
                          fontSize: '1.25rem',
                        },
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      component="p"
                      className={theme.accent}
                      sx={{
                        mt: 0.5,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        lineHeight: 1.25,
                        '@media (min-width: 640px)': {
                          fontSize: '0.875rem',
                        },
                      }}
                    >
                      {item.summary}
                    </Typography>
                  </Box>
                </Card>
              </Link>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
