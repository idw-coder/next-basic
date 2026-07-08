# AI委任タスク指示書集

教科書（Books）機能の改善タスクを、別のAIセッションへコピペで委任するための指示書。
優先度順（P1が最優先）。各コードブロックを丸ごと貼り、「添付」欄のファイルを一緒に渡す。

## 全タスク共通の注意（委任前に必ず伝える）

- **devサーバーを起動するのは1セッションだけ。** 多重起動すると velite が `.velite/` を同時書き込みしてビルドが壊れる。起動前に `lsof -nP -iTCP:3000 -sTCP:LISTEN` 等で確認
- **同じ本のコンテンツを複数セッションで同時に編集しない**（書き戻し競合が起きる）
- 作業後は `npx tsc --noEmit` を通し、変更ファイル一覧を報告させる

---

## ✅ P1-a: 執筆中プレースホルダー章の noindex / sitemap除外 / バッジ表示（2026-07-03 完了）

**モデル**: 安価〜中位 / **効果**: SEO大（thin content解消）+ UX大 / **工数**: 半日以下

```
docs/books.md 仕様の教科書サイト（Next.js App Router + Velite）で、
本文が「この章は現在執筆中です」だけのプレースホルダー章が約20章公開されており、
thin content としてSEOに悪影響なので draft 運用に切り替えたい。

# やること
1. velite.config.ts の chapters スキーマに draft: s.boolean().default(false) を追加し、
   transform の出力にも含める
2. grep -rl "この章は現在執筆中です" content/books/ で該当章を特定し、
   各ファイルの frontmatter に draft: true を追加（本文は変更しない）
3. 章ページ src/app/books/[bookSlug]/[chapterSlug]/page.tsx の generateMetadata で、
   draft の章には robots: { index: false, follow: true } を返す
4. src/app/sitemap.ts で draft の章を sitemap から除外する
5. 章一覧に「執筆中」バッジ（グレーの小さいピル）を追加する。リンク自体は残す:
   - src/app/books/_components/BookSidebar.tsx の章リスト
   - 本トップ src/app/books/[bookSlug]/page.tsx の章一覧

# 確認
- npx tsc --noEmit が通る
- draft 章のHTMLに <meta name="robots" content="noindex"> が出力される
- /sitemap.xml に draft 章のURLが含まれない
- サイドバーと本トップの両方でバッジが表示される

# 制約
- devサーバーが他で動いていないことを確認してから起動する（多重起動でveliteが壊れる）
- 公開章（draft でない章）の挙動を一切変えないこと

# 添付
docs/books.md / velite.config.ts / 上記4〜5のファイル
```

---

## P1-b: 未執筆章の執筆（1章ずつ委任）

**モデル**: 高性能必須 / **効果**: SEO大（主要検索クエリの受け皿） / **工数**: 1章あたり数時間

対象（javascript 12章 / system-design 8章）は `grep -rl "この章は現在執筆中です" content/books/` で最新を確認。
javascript のクロージャ・this・async/Promise・モジュール・DOM操作を優先。

**進捗**: `javascript/12-closures.mdx` ✅（2026-07-03執筆・公開済み。トーンの見本としてこの章も参照可）。
執筆完了時のチェック: frontmatterの `draft: true` を削除 → noindexが外れsitemapに載る。章末に参考リンク＋QuizLinkを置く。draft章へのMarkdownリンクは張らない（執筆中ページに誘導しない）。

```
docs/books.md 仕様の教科書、JavaScript本の未執筆章を1章書いてほしい。

# 対象
ファイル: content/books/javascript/[ここに指定。例: 12-closures.mdx]
（現在は「執筆中」プレースホルダー。frontmatter の title / description / order は維持）

# 守ること（docs/books.md の規約。必ず読んでから書くこと）
- 規約は3層（必須/原則/裁量）。docs/books.md「規約の優先度」の節に従い、
  吹き出しや図を規定数合わせで入れない。最優先は検索意図に答える中身の正確さ
- H1なし・H2始まり。手書きの「## 目次」は入れない（自動TOCが表示される）
- メソッド・APIの解説には「構文」「引数の表」「戻り値」を必ず明示（MDN代替の粒度）
- <Figure> と <SpeechBubble> を章あたり2〜4個、冒頭に固定せず本文中に分散
  （学習者=/images/usingcomputer_suit_woman_color.png、先生=/images/oksign_man_color.png）
- 重要な定義・判断基準・ハマりどころに <Marker>、補足は <Callout>（typeを使い分け）
- MDNへのリンクは節末か章末「## 参考リンク」（2〜4本）に置く。説明の代わりにしない。
  URLは実際にアクセスして存在確認し、推測で書かない
- 既存の完成章（07-arrays.mdx、08-string-methods.mdx）とトーン・構成・粒度を揃える
- 関連する既存章への内部リンクを入れ、次章への橋渡し文で締める
- 「## よくあるハマりどころ」「## ちゃんと使うためのポイント」の節を入れる
- 完成したら frontmatter の draft: true を削除する（無ければ何もしない）

# 添付
docs/books.md / 対象ファイル / content/books/javascript/07-arrays.mdx（トーン参考）
```

---

## ✅ P2: 章ページの JSON-LD（TechArticle + BreadcrumbList）（2026-07-03 完了）

**モデル**: 安価〜中位 / **効果**: SEO中〜大（パンくずリッチリザルト） / **工数**: 小

```
docs/books.md 仕様の教科書で、章ページ
src/app/books/[bookSlug]/[chapterSlug]/page.tsx に JSON-LD を追加してほしい。
canonical / openGraph は実装済み。サイトURLは src/lib/site.ts の SITE_URL を import して使う。

# やること
1. BreadcrumbList: 教科書(/books) > 本タイトル(/books/{bookSlug}) > 章タイトル
2. TechArticle: headline=章タイトル / description / inLanguage: 'ja' /
   url は canonical と一致 / isPartOf で本を参照
出力方式は src/app/books/page.tsx の既存 JSON-LD 実装（scriptタグ）に合わせる。
frontmatter に draft: true がある章には出力しない（draft対応が未導入ならスキップでよい）。

# 確認
- 章ページのHTMLに application/ld+json が出力される
- 構造が https://search.google.com/test/rich-results で解釈できる形になっている
- npx tsc --noEmit が通る

# 添付
docs/books.md / 章ページ page.tsx / src/app/books/page.tsx / src/lib/site.ts
```

---

## ✅ P3: 章末クイズ導線（QuizLink）の一括挿入（2026-07-03 完了・126章）

**モデル**: 安価でOK / **効果**: UX大（コア回遊の完成）+ 滞在時間 / **工数**: 小

```
docs/books.md 仕様の教科書で、章末にクイズへの導線を一括で入れてほしい。

# やること
1. src/lib/books.ts の categoryToBookMap で「対応クイズカテゴリがある本」を確認
2. その本の公開章すべてについて、本文末尾（次章への橋渡し文の直前）に
   <QuizLink category="対応カテゴリ" /> を挿入
3. props は src/app/books/_components/QuizLink.tsx の実装を確認して合わせる

# 制約
- 既に QuizLink がある章、「この章は現在執筆中です」のプレースホルダー章はスキップ
- 1章につき1つだけ。本文中には入れない
- 挿入した章の一覧と、対応が無くスキップした本の一覧を報告する

# 添付
docs/books.md / src/lib/books.ts / QuizLink.tsx / mdx-content.tsx
```

---

## P4: 公式ドキュメントリンクの横展開（本ごとに1セッション）

**モデル**: 中位以上（URL実在確認が必須） / **効果**: SEO中（E-E-A-T）+ UX / **工数**: 本あたり中

**進捗**: javascript ✅ / typescript ✅（2026-07-03、14章30本・全URL検証済み） / 残り: css-basics → react-learning → next-js。
メモ: TypeScript公式ハンドブックに日本語版は無い（/ja/ は tsconfig リファレンスと Playground のみ）。英語リンクには「（英語）」を明記する。

対象の優先順: css-basics → react-learning → next-js。
リンク先の目安: TS=typescriptlang.org、CSS/JS/Web API=developer.mozilla.org/ja、
React=ja.react.dev、Next.js=nextjs.org/docs。

```
docs/books.md の「外部公式ドキュメントへのリンク」の節に厳密に従い、
content/books/[ここに指定。例: typescript]/ の公開章に公式ドキュメントへの
参考リンクを追加してほしい。

# フェーズ1: 候補リスト作成（まずこれだけ提示して停止）
- 全章を読み、「章 / 置く場所（節末 or 章末） / URL」の候補リストを作る
- 1章あたり2〜4本に絞る。日本語版URLを優先
- URLは必ず実際にアクセスして存在確認。リダイレクトされる場合はその旨を明記
- 推測でURLを書くことを禁止。確認できないものは候補から外す

# フェーズ2: 挿入（リスト承認後）
- 既存の本文・説明は一切削らない（「詳しくは公式へ」で説明を置き換えるのは禁止）
- 書式は通常のMarkdownリンク。章末にまとめる場合は「## 参考リンク」
- 完了後、挿入した全URLに curl -sIL で最終ステータスを確認し結果を報告

# 参考
content/books/javascript/08-string-methods.mdx が導入済みの見本。

# 添付
docs/books.md / 対象の本の全章
```

---

## P5: sitemap の lastModified 正確化

**モデル**: 中位（デプロイ環境の制約理解が必要） / **効果**: SEO中 / **工数**: 中

```
docs/books.md 仕様の教科書で、src/app/sitemap.ts が全URLに new Date() を返しており、
Google が lastmod を信用しなくなるので、実際の更新日時を返すよう修正してほしい。

# 方針
- velite.config.ts の transform で各章に updated（ISO日時文字列）を追加
- 取得は git log -1 --format=%cI -- <ファイルパス>。
  ただし CI / Vercel は shallow clone で git 履歴が取れないことがあるため、
  取得できない場合はファイルの mtime にフォールバックする
- sitemap.ts では、章ページは updated を、本ページは所属章の updated の最大値を使う
- クイズ・静的ページのエントリは変更しない

# 確認
- ローカルの /sitemap.xml で章ごとに異なる lastmod が出る
- git 履歴が無い状態（別ディレクトリへの export 等）でもビルドが落ちない
- npx tsc --noEmit が通る

# 添付
docs/books.md / velite.config.ts / src/app/sitemap.ts
```

---

## P6: 章ごとの動的OG画像

**モデル**: 中位〜高（ImageResponseの制約・フォント処理） / **効果**: SNS CTR中 / **工数**: 中

```
Next.js App Router の教科書章ページに動的OG画像を追加してほしい。

# やること
- src/app/books/[bookSlug]/[chapterSlug]/opengraph-image.tsx を作成し、
  ImageResponse で 1200x630 の画像を生成する
- 背景は src/lib/book-theme.ts のテーマカラー系統、本タイトル（小）+
  章タイトル（大）+ サイト名「ウェブエンジニア問題集」を配置
- 日本語表示のため Noto Sans JP をサブセットで埋め込む
- generateStaticParams と整合させ、ビルドで全章分生成されることを確認
- generateMetadata 側の openGraph 設定と競合しないか確認する

# 確認
- 開発サーバーで /books/{bookSlug}/{chapterSlug}/opengraph-image が表示される
- 長い章タイトルでもはみ出さない
- npm run build が通る（ビルド時間の増加も報告）

# 添付
docs/books.md / 章ページ page.tsx / src/lib/book-theme.ts / src/app/layout.tsx
```

---

## TODO — P7: 章末フィードバックウィジェット（「この章は役に立ちましたか？」）

**モデル**: 中位以上（API設計を含む） / **効果**: 改善サイクルのデータ源 + エンゲージメント / **工数**: 中
**状態**: 未着手。着手時は以下をそのまま委任できる。

```
docs/books.md 仕様の教科書サイトに、章末フィードバックウィジェットを実装してほしい。

# 要件
- 各章ページの末尾（QuizLinkバナーの下、ChapterNavの上）に
  「この章は役に立ちましたか？」+ 👍/👎 ボタンを表示
- 投票するとお礼メッセージに切り替わる。連打防止に localStorage で章ごとの投票済みを記録
- 集計データは章単位（bookSlug / chapterSlug / 種別 / 日時）で保存する

# 実装前に確認すること
1. 既存APIの実装パターンを調べる（sitemap.ts が参照する Express バックエンド
   {API_BASE_URL}/api/... と、src/app/api/ の Next.js Route Handler のどちらに寄せるか）
2. DBスキーマ（テーブル1つ: chapter_feedback）とAPI設計を先に提案し、承認後に実装
3. 認証は不要（匿名投票）。ただしスパム対策として同一章への連投は弾く

# 将来の使い道（設計時に意識）
- 👎が多い章を Search Console 分析（本ファイルの月次運用）と突き合わせて改善対象を決める
- 管理画面（/admin）に章ごとの集計を表示できる形でデータを持つ

# 添付
docs/books.md / 章ページ page.tsx / src/app/api/ 配下の既存Route Handler例 / sitemap.ts
```

---

## ブラウザ操作: JSクイズ解説の強化＋教科書リンク挿入

**モデル**: ブラウザ操作可能なAI（Claude with chrome MCP等） / **効果**: UX大（解説品質）+ SEO（内部リンク） / **工数**: 中（問題数に依存）

以下をブラウザ操作AIにコピペで渡す。

````
あなたはブラウザを操作して、JavaScriptクイズの解説を改善するタスクを行います。

# サイト情報
- 管理画面URL: https://study.ntorelabo.com/admin/quizzes
- 公開サイト: https://study.ntorelabo.com

# 作業手順

## 1. クイズ一覧を開く
https://study.ntorelabo.com/admin/quizzes にアクセスし、カテゴリのプルダウンで「JavaScript」を選択してフィルタリングします。

## 2. 各クイズを1問ずつ編集
一覧のペン（鉛筆）アイコンをクリックして編集画面を開きます。
編集画面のURL形式: `/admin/quizzes/{id}/edit`

編集画面には以下のフィールドがあります:
- **Slug**: 英語ケバブケース（変更しない）
- **問題文**: クイズの問題（変更しない）
- **選択肢**: 4つの選択肢と正解フラグ（変更しない）
- **解説**: Tiptapリッチテキストエディタ（ここを編集する）
- **カテゴリ**: カテゴリ選択（変更しない）
- **タグ**: タグ選択（変更しない）

## 3. 解説の評価と改善

### 解説が弱い・不十分なケースの判定基準:
- 1〜2文しかなく、なぜその答えが正解なのかの説明が不十分
- 正解の選択肢の説明だけで、不正解の選択肢がなぜ間違いなのかの説明がない
- 具体的なコード例がなく抽象的な説明だけ
- 用語の定義だけで実務での使いどころに触れていない

### 改善する場合のルール:
- **既存の正しい説明は削除しない**。追記・補強のみ行う
- 以下の構成を目安にする:
  1. なぜその答えが正解なのか（1〜2文）
  2. 他の選択肢がなぜ不正解なのか（各1文程度。明らかなものは省略可）
  3. 補足（実務での注意点やよくある間違い。1〜2文で軽く）
- 全体で200〜500文字程度が目安（長すぎない）
- コード例は短く（3〜5行以内）。必要な場合のみ追加
- 改善不要（十分な解説がすでにある）なら何もしない

### Tiptapエディタの操作:
- エディタ上部にツールバーがあります: H1, H2, H3, B, I, ・リスト, 番号リスト, コード
- テキストはエディタ内に直接入力します
- 改行はEnter、段落はそのまま入力されます

## 4. 教科書リンクの追加

解説の**末尾**に、そのクイズの内容に最も関連する教科書チャプターのURLを追記します。

### リンクの形式:
解説の最後に空行を入れてから、URLをプレーンテキストで貼り付けるだけでOKです。
サイト側で自動的にカード表示に変換されます。

```
（既存の解説テキスト）

https://study.ntorelabo.com/books/javascript/{chapterSlug}
```

アンカー（#セクション名）を付けるとさらに具体的にリンクできます:
```
https://study.ntorelabo.com/books/javascript/{chapterSlug}#セクション名
```

### 利用可能な教科書チャプター（公開済みのみ）:

| slug | タイトル | 関連トピック |
|------|---------|-------------|
| 01-variables-and-scope | 変数宣言とスコープ | var/let/const、スコープ、ホイスティング |
| 02-data-types | データ型と型変換 | プリミティブ、typeof、型変換 |
| 03-operators-and-expressions | 演算子と式 | ===/==、短絡評価、??、?. |
| 04-control-flow | 制御構文 | if/switch/for/while |
| 05-functions | 関数とアロー関数 | 関数定義、this、デフォルト引数、IIFE |
| 07-arrays | 配列メソッド | map/filter/reduce/find/some/every/sort |
| 08-string-methods | 文字列操作と正規表現 | replace/split/slice/正規表現 |
| 11-this-keyword | thisの正体 | this、bind/call/apply、アロー関数のthis |
| 12-closures | クロージャ | スコープチェーン、クロージャ、プライベート変数 |
| 13-async-callback-promise | 非同期処理 | コールバック、Promise、async/await |
| 14-error-handling | エラーハンドリング | try/catch/finally、カスタムエラー |
| 15-modules | モジュールシステム | import/export、CommonJS |
| 17-map-set-weakref | Map・Set・WeakRef | Map、Set、WeakMap、WeakRef |
| 20-web-apis | Web API | fetch、Storage、IntersectionObserver |
| 21-numbers-and-math | 数値の扱いと計算 | toFixed、四捨五入、0.1+0.2、Math |
| 22-date | 日付と時刻 | Date、フォーマット、差分計算 |
| 23-json | JSON | stringify、parse、ディープコピー |

### リンクのマッチングルール:
- クイズの問題内容を読み、上の表の「関連トピック」列から最も近い章を1つ選ぶ
- 明確に関連する章がない場合はリンクを追加しない（無理にリンクしない）
- 1問につきリンクは1つまで
- すでに教科書リンク（`/books/javascript/` を含むURL）がある場合は追加しない

## 5. 保存
編集が完了したら「保存」ボタンをクリックします。

## 安全ルール
- **問題文、選択肢、正解フラグ、カテゴリ、タグは絶対に変更しない**
- 1問ずつ作業し、保存してから次へ進む
- 解説が十分で、関連チャプターもない場合はスキップしてよい
- 迷ったらスキップする（壊すより残す方が安全）
- 作業完了後、編集したクイズIDの一覧を報告する
````

---

## 運用: Search Console 月次分析

**モデル**: 中位 / **効果**: SEO大（長期・計測起点） / **工数**: 月1で小

```
Search Console のデータ（添付CSV: クエリ / 表示回数 / クリック数 / 掲載順位）を分析してほしい。
サイトは docs/books.md 仕様の学習サイト（クイズ + 教科書）。

# やること
1. 掲載順位5〜20位 かつ 表示回数が多いクエリを抽出
2. 各クエリに対応する教科書の章（/books/...）またはクイズページを特定
3. 章ごとに「検索意図に対して不足しているコンテンツ」を診断し、
   修正案（description書き直し / H2追加 / 補筆 / 新章）を優先度付きで提案

# 制約
- 提案のみで停止し、承認後に修正へ着手する

# 添付
GSCのCSVエクスポート / docs/books.md
```
