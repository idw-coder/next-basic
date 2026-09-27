'use client';

import { Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { isWithinOneMonth } from '@/lib/content-date';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type NewsItem = {
  date: string;
  text: string;
  link?: string;
};

const INITIAL_COUNT = 5;

export function NewsList({ items, today }: { items: NewsItem[]; today: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > INITIAL_COUNT;
  const visible = expanded ? items : items.slice(0, INITIAL_COUNT);

  return (
    <>
      <Stack id="news-list-items" divider={<Divider />}>
        {visible.map((item, i) => {
          const showNewBadge = isWithinOneMonth(item.date, today);
          const content = (
            <Stack
              spacing={0.5}
              className={item.link ? 'group' : undefined}
              sx={{
                py: 1.5,
                ...(item.link && {
                  cursor: 'pointer',
                }),
              }}
            >
              <Stack direction={'row'} spacing={1} sx={{ alignItems: 'center' }}>
                <Typography component={'span'} variant="caption" color="text.secondary">
                  {item.date}
                </Typography>
                {showNewBadge && (
                  <Chip
                    label="NEW"
                    size="small"
                    sx={{
                      fontWeight: '600',
                      fontSize: '0.625rem',
                      bgcolor: 'secondary.dark',
                      color: 'common.white',
                    }}
                  />
                )}
              </Stack>
              <Typography
                component={'p'}
                variant="body2"
                sx={{
                  fontSize: '0.8125rem',
                  transition: 'color 150ms',
                  ...(item.link && {
                    '.group:hover &': {
                      color: 'primary.main',
                    },
                  }),
                }}
              >
                {item.text}
              </Typography>
            </Stack>
          );
          return item.link ? (
            <Link key={i} href={item.link}>
              {content}
            </Link>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </Stack>

      {hasMore && (
        <Button
          type="button"
          variant="text"
          size="small"
          sx={{
            width: 'fit-content',
            display: 'flex',
            mx: 'auto',
            mb: 1,
          }}
          aria-expanded={expanded}
          aria-controls="news-list-items"
          onClick={() => setExpanded(!expanded)}
          startIcon={
            <ChevronDown
              className={`size-3.5 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          }
        >
          {expanded ? '閉じる' : `過去のお知らせを表示（残り ${items.length - INITIAL_COUNT} 件）`}
        </Button>
      )}
    </>
  );
}
