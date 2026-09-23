# MUI教科書（content/books/mui）の章立て計画

**この本に章を追加する前に必ず読むこと。** 全13章の設計が決まっており、**最終的な `order` があらかじめ振られている**。
思いついた順に連番を振ると並びが壊れるので、必ず下の表の番号を使う。

対象バージョンは **`@mui/material` v9**（このリポジトリの実装は 9.1.1 / 2026-06-11リリース）。調査日は2026-09-22。

## 全13章と order

| order | 章 | ファイル | 状態 |
| --- | --- | --- | --- |
| 1 | MUIとは何か — Material Designの実装という立ち位置 | `what-is-mui.mdx` | 執筆済み |
| 2 | Next.js App Routerへの導入 — AppRouterCacheProviderと'use client'境界 | `nextjs-app-router-setup.mdx` | 執筆済み |
| 3 | sx prop — MUIのスタイリングの基本単位 | `sx-prop.mdx` | 執筆済み |
| 4 | レイアウト — Box・Stack・Container・Grid | `layout-box-stack-grid.mdx` | 執筆済み |
| 4.5 | Typography — 文字の見た目と意味を分けて指定する | `typography.mdx` | 執筆済み |
| 5 | テーマの構造 — createThemeとデザイントークン | `theme-and-tokens.mdx` | 執筆済み |
| 6 | カスタマイズの4段階 — sxからGlobalStylesまで | `customization-levels.mdx` | 執筆済み |
| 7 | slotsとslotProps — コンポーネントの内部構造を差し替える | `slots-and-slot-props.mdx` | 執筆済み |
| 8 | ダークモード — cssVariablesとcolorSchemes | `dark-mode-and-css-variables.mdx` | 執筆済み |
| 9 | レスポンシブ — ブレークポイントとuseMediaQuery | `responsive-and-breakpoints.mdx` | 執筆済み |
| 10 | フォーム — TextField・Select・Autocomplete | `form-components.mdx` | 執筆済み |
| 11 | Dialog・Snackbar・Menu — Portalとフォーカス管理 | `dialog-snackbar-menu.mdx` | 執筆済み |
| 12 | アクセシビリティ — v9の構造変更と支援設定への対応 | `accessibility.mdx` | 執筆済み |
| 13 | 他のCSSと共存する — カスケードレイヤーとTailwind CSS併用 | `coexisting-with-other-css.mdx` | 執筆済み |

全13章＋差し込み1章（4.5 Typography）を執筆済み。

章と章のあいだに差し込みたくなった場合は、既存の `order` を動かさず**小数**を使う（`order: 5.5`）。`chapterLabel` を添えれば読者向けの表示も自然にできる。javascript本の `7.1`〜`7.5` が実例。

ファイル名に連番を付けないこと（URLに残るため）。

## この本を書く理由

**日本語で読めるv9準拠のまとまったMUI教材が存在しない。** 2026-09-22時点でWeb検索した範囲では、MUI専門の日本語書籍は見つからず、入門記事はZenn・Qiita・企業ブログが中心だった。

そしてv9は既存の書き方をかなり壊している。下は**公式のmigrationガイドと `node_modules/@mui/material` の型定義の両方で確認した**事実。

| v8以前の書き方 | v9 | 確認方法 |
| --- | --- | --- |
| `<Grid item xs={6}>` | `<Grid size={6}>` | `Grid/Grid.d.ts` のpropsは `container` / `size` / `spacing` / `direction` のみ。`GridLegacy` はディレクトリごと存在しない |
| `<Box mt={2}>` | `<Box sx={{ mt: 2 }}>` | Box・Typography・Grid・Stack・Linkからsystem propsが削除。`Box.d.ts` を `mt\|mb\|padding\|margin` でgrepして0件 |
| `<CssVarsProvider>` + `extendTheme()` | `createTheme({ cssVariables: true, colorSchemes })` ＋ 通常の `ThemeProvider` | `styles/ThemeProviderWithVars.d.ts` で `@deprecated` 指定。JSDocに移行diffあり。**削除ではなく非推奨**で、実行時にはまだ存在する（`node -e` で確認済み） |
| `components` / `componentsProps` | `slots` / `slotProps` | 公式migrationガイド |
| `<Grid direction="column">` | `Stack` を使う | 公式migrationガイド |

日本語の既存記事はv5〜v7時代のものが多く、これらは当時は正しかった書き方。**古い記事をなぞらず、v9の実物に当てて書くこと**が、この本の一番の価値になる。

## この本のスコープ

MySQL本が `sql-basics` に文法を任せているのと同じ切り分けをする。

- **Reactの仕組み**（Hooks・再レンダー・props）→ [React入門](../../content/books/react-learning/) の担当
- **CSSの基礎** → [css-basics](../../content/books/css-basics/)、**ユーティリティCSSの思想** → [tailwind-css](../../content/books/tailwind-css/) の担当
- この本は**MUI固有のことだけ**を扱う。コンポーネントAPI・`sx`・theme・slots・Emotion・App Router統合

各章の冒頭に次の形の宣言を入れる。

> `useState` や props の考え方は、[React入門](/books/react-learning/04-use-state)で学んだ内容がそのまま通用します。この章では、**MUIならではの書き方**だけに絞って扱います。

## 章立ての根拠

公式ドキュメントの情報設計（[全コンポーネント一覧](https://mui.com/material-ui/all-components/)、[How to customize](https://mui.com/material-ui/customization/how-to-customize/)、[Upgrade to v9](https://mui.com/material-ui/migration/upgrade-to-v9/)、[Next.js integration](https://mui.com/material-ui/integrations/nextjs/)）を調べたうえで決めた。

- **踏襲した点** — 6章の並びは公式が明示している推奨順「narrowest to broadest」（一点物 `sx` → 再利用 `styled()` → 全体 `theme.components` → グローバル `GlobalStyles`）をそのまま使う。13章のTailwind併用は公式にIntegrationページがあり、独自見解ではない
- **落とした点** — MUI X（Data Grid・Pickers・Charts・Tree View。有料ライセンスの線引きは11章で触れるだけ）、Joy UI / Base UI、RTL、Shadow DOM、Lab（Masonry・Timeline）、テンプレートとデザインリソース。Web開発者向けの通読教科書には過剰
- **意図的に変えた点** — 公式はCustomizationをComponentsの後ろに置くが、`sx` を3章に前倒した。`sx` を知らないとコンポーネント章のサンプルコードが読めないため。MySQL本で文字コードを5章に前倒したのと同じ判断。またアクセシビリティは公式では各コンポーネントページに散っているが、v9でまとめて変わった（Stepperが `<div>` から `<ol>`/`<li>` に、Menu・Tabsがroving tabindexに、`enhanceHighContrast` と `prefers-reduced-motion` 対応が9.1.0で追加）ので独立章にした

## 執筆時の注意

- **記憶でAPIを書かない。** v9は破壊的変更が多く、学習データに残っている書き方はほぼv5〜v7のもの。必ず `node_modules/@mui/material/**/*.d.ts` と公式ドキュメントで実物を確認してから書く
- **このサイト自身が検証環境になる。** `@mui/material 9.1.1` + Next.js 15 App Router + React 19 で動いており、[src/app/layout.tsx](../../src/app/layout.tsx) が `AppRouterCacheProvider` を `enableCssLayer: true` で使っている。2章と13章は机上のサンプルではなく実装から取れる
- 順序に依存する言い回し（「次の章では」「前章の」）を使わない。章タイトルへのリンクで書く。orderが動いても壊れないため
- その他の執筆ルールは [docs/books.md](../books.md) に従う

## デプロイ後の作業

**新しい本なので [docs/books.md](../books.md) の「デプロイ後の作業」1〜6をすべて実行する。** MDXを置いただけでは公開作業は終わっていない。

1. テーマカラー（`src/lib/book-theme.ts`）— 未使用色は `red` / `lime` / `sky` / `fuchsia` / `pink`。MUIのブランド色は青だが、青系は cyan（react-learning）・blue（css-basics）・indigo（typescript）で埋まっているため、`sky` にするか別系統にするかは要判断
2. 表示順（`src/lib/books.ts` の `BOOK_ORDER`）— react-learning と tailwind-css の近くが自然
3. NEWバッジ（`src/lib/books.ts` の `NEW_BOOK_SLUGS`）
4. クイズカテゴリ連携（`src/lib/books.ts` の `categoryToBookMap`）— 対応カテゴリを作るかどうかも含めて判断
5. 本内検索サジェスト（`src/app/books/_constants/searchSuggestions.ts`）
6. **トップページのお知らせ（`src/app/page.tsx` の `NEWS` 配列）** — 忘れられやすい
