import type { Metadata } from 'next';

// ページ本体はブックマークをlocalStorageから読むクライアントコンポーネントのため、
// metadataをexportできない。タイトル（ブラウザタブ・履歴）とnoindexをここで与える。
export const metadata: Metadata = {
  title: 'ブックマークした問題 | ウェブエンジニア問題集',
  description: '後で解き直したい問題をブックマークして、まとめて復習できます。',
  robots: { index: false, follow: true },
};

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
