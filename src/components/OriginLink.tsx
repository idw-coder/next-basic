'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';

type OriginLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  /** `?from=` を含まないURL。HTMLの href にはこの値だけが出る */
  href: string;
  /** 流入元（`book:<bookSlug>/<chapterSlug>`）。無ければ通常の Link と同じ動作 */
  from?: string;
};

/**
 * 流入元（?from=）をクリック時にだけ付けて遷移するリンク。
 *
 * href に `?from=` を書くと、クローラーがパラメータ付きURLを別ページとして拾う。
 * canonical を指定していても、内部リンクがパラメータ付きURLばかりを指していると
 * Google はそちらを検索結果に出すことがある（Search Console で55本を確認）。
 * そのため href はパラメータなしのURLにし、通常の左クリックのときだけ
 * router.push で `?from=` 付きのURLへ遷移する。
 *
 * 新しいタブで開く操作（Cmd/Ctrl+クリック・中クリック）はブラウザに任せるので、
 * その場合は流入元が引き継がれない。
 */
export default function OriginLink({ href, from, onClick, ...rest }: OriginLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!from || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    router.push(`${href}${href.includes('?') ? '&' : '?'}from=${encodeURIComponent(from)}`);
  };

  return <Link href={href} onClick={handleClick} {...rest} />;
}
