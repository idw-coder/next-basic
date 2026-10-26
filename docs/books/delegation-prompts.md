# AI委任タスク指示書集

教科書（Books）機能の改善タスクを、別のAIセッションへコピペで委任するための指示書。
優先度順（P1が最優先）。各コードブロックを丸ごと貼り、「添付」欄のファイルを一緒に渡す。

> 整理メモ（2026-08-08）: Books 仕様の一次情報は `docs/books/guide.md`。このファイルは未完了タスクの委任用プロンプトとして使う。完了したタスクは削除する（経緯はgit履歴で追える）。

## 全タスク共通の注意（委任前に必ず伝える）

- **devサーバーを起動させない。** 多重起動すると velite が `.velite/` を同時書き込みし、JSONが壊れて全ページが500になる。表示確認は既に立っているサーバーへ `curl` で行い、立っていなければ確認をスキップさせる
- **`npx velite` / `npm run build` も実行させない**（`.velite/` を消すため、他セッションのdevサーバーが即座に壊れる）
- **ブラウザ版ChatGPTなど、リポジトリのファイルを自動で読まないツールに委任するときは `AGENTS.md` を必ず貼る**（Claude Code・Codex・Cursorは自動で読む）
- **同じ本のコンテンツを複数セッションで同時に編集しない**（書き戻し競合が起きる）
- 作業後は `npx tsc --noEmit` を通し、変更ファイル一覧を報告させる

---

## P1-b: 未執筆章の執筆（1章ずつ委任）

**モデル**: 高性能必須 / **効果**: SEO大（主要検索クエリの受け皿） / **工数**: 1章あたり数時間

対象は `grep -rl "この章は現在執筆中です" content/books/` で最新を確認。
2026-10-24 時点では draft プレースホルダーが 15 章残っている（docker 6・node-js 6・javascript 3）。

**進捗**: `javascript/12-closures.mdx` ✅（2026-07-03執筆・公開済み。トーンの見本としてこの章も参照可）。
執筆完了時のチェック: frontmatterの `draft: true` を削除 → noindexが外れsitemapに載る。章末に参考リンク＋QuizLinkを置く。draft章へのMarkdownリンクは張らない（執筆中ページに誘導しない）。

```
docs/books/guide.md 仕様の教科書、JavaScript本の未執筆章を1章書いてほしい。

# 対象
ファイル: content/books/javascript/[ここに指定。例: 12-closures.mdx]
（現在は「執筆中」プレースホルダー。frontmatter の title / description / order は維持）

# 守ること（docs/books/guide.md の規約。必ず読んでから書くこと）
- 規約は3層（必須/原則/裁量）。docs/books/guide.md「規約の優先度」の節に従い、
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
docs/books/guide.md / 対象ファイル / content/books/javascript/07-arrays.mdx（トーン参考）
```

---

## P1-c: AWS SAA-C03本の章の拡充（1章ずつ委任）

**モデル**: 高性能必須（AWS公式ドキュメントとの照合が必要） / **効果**: SEO大＋教材の完成度 / **工数**: 1章あたり数時間

対象は `grep -l "コンテンツ追加予定" content/books/aws-saa-c03/*.mdx` で最新を確認。2026-10-26 時点で17章。
各章の冒頭の注記（`<Callout type="info">` の「コンテンツ追加予定」）に、その章に足りない内容が箇条書きで書いてある。注記の項目は、公式試験ガイドの対象知識・対象スキルと照らして決めたもの。

**同じ本なので、並行で複数セッションに投げない。** 1章終わってから次の章を投げる。

委任する順番（試験の配点が高い分野から、薄い章を優先。順番は筆者の判断）:

| 順 | ファイル | 試験ガイドのタスク | 状態 |
|---|---|---|---|
| 1 | `iam-and-least-privilege.mdx` | 1.1 | 骨組み |
| 2 | `multi-account-and-federation.mdx` | 1.1 | 骨組み |
| 3 | `vpc-network-security.mdx` | 1.2 | 骨組み |
| 4 | `data-security.mdx` | 1.3 | 骨組み |
| 5 | `decoupled-architecture.mdx` | 2.1 | 骨組み |
| 6 | `scalability-and-ha.mdx` | 2.1 / 2.2 | 骨組み |
| 7 | `disaster-recovery.mdx` | 2.2 | 骨組み |
| 8 | `database-selection.mdx` | 3.3 | 骨組み |
| 9 | `network-performance.mdx` | 3.4 | 骨組み |
| 10 | `storage-selection.mdx` | 3.1 | S3以外が薄い |
| 11 | `compute-selection.mdx` | 3.2 | EC2・Auto Scalingが薄い |
| 12 | `data-ingestion-and-analytics.mdx` | 3.5 | 半分程度 |
| 13 | `cost-optimized-storage.mdx` | 4.1 | 骨組み |
| 14 | `cost-optimized-compute.mdx` | 4.2 | 骨組み |
| 15 | `cost-optimized-database.mdx` | 4.3 | 骨組み |
| 16 | `cost-optimized-network-and-checklist.mdx` | 4.4 | 骨組み |
| 17 | `monitoring-and-cloudwatch.mdx` | 2.2 | 残り3項目 |

```
docs/books/guide.md 仕様の教科書、AWS SAA-C03本の1章を拡充してほしい。

# 対象
ファイル: content/books/aws-saa-c03/[ここに指定。例: iam-and-least-privilege.mdx]
対応する試験ガイドのタスク: [ここに指定。例: 1.1]
冒頭の「コンテンツ追加予定」の注記に、この章に足りない内容が箇条書きで書いてある。これを書き足すのが主な作業。
加えて、注記の項目に限らず次の3つが薄ければ補う:
- 実務での使用例
- 構成図（MermaidDiagram）
- 試験問題での判断パターン（「この要件ならこのサービス」の対応）

# 最初に読むもの
- AGENTS.md（作業ルール。devサーバーと Velite のルールは必ず守る）
- docs/books/guide.md（執筆ルール）
- 公式試験ガイドの該当タスク:
  https://docs.aws.amazon.com/ja_jp/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html
  （分野ごとのページ: solutions-architect-associate-03-domain1.html 〜 domain4.html）
- 書き方の見本（この本で完成している章）:
  content/books/aws-saa-c03/application-security.mdx
  content/books/aws-saa-c03/infrastructure-as-code-and-operations.mdx
  content/books/aws-saa-c03/monitoring-and-cloudwatch.mdx の「Amazon EventBridge」「EventBridge Scheduler」の節

# 守ること
- 既存の本文は削らない。書き足す・直すだけ
- 事実（数値・上限・仕様・推奨）は AWS 公式ドキュメント（docs.aws.amazon.com/ja_jp を優先）で確かめ、
  本文中に出典リンクを置く。出典のない断定は書かない。筆者の整理として書くときは
  「これは筆者の整理です」と明記する
- 外部URLは全件 curl -s -o /dev/null -w "%{http_code}" -L <url> で200を確認する。推測でURLを書かない
- 料金・クォータなど変わりやすい値は、出典を添えるか、公式で確認する導線を残す
- 試験に「よく出る」と書くときも根拠を示すか、筆者の判断と明記する
- 吹き出し・イラストは章の既存のものに合わせる
  （学習者=/images/usingcomputer_suit_woman_color.png、先生=章内で使われている画像に揃える）
  冒頭に固定せず本文中に分散。1章の中で同じイラストを繰り返さない
- 重要な定義・判断基準に <Marker>、補足や注意は <Callout>（type を使い分け）
- APIやCLIを解説するときは、構文・引数（パラメーター）の表・戻り値を示す
- 「次の章では」「前章で」など章の並び順に頼る書き方をしない。章へのリンクで書く
  （例: [データベース選択](/books/aws-saa-c03/database-selection)）
- 日本語で **強調** を閉じるとき、** の直前に全角括弧や句読点を置かない
  （誤: **文（statement）**と / 正: **文**（statement）と）
- Mermaid の改行は <br/> を使う（\n は文字のまま表示される）。
  ノードが4つ以上の図は flowchart TB（縦向き）にする（横向きはスマホで読めない）
- ページ内リンクに日本語の見出しidを使わない（guide.md「ページ内リンクのフラグメントに日本語を使わない」）
- 書き終えたら、注記の箇条書きから書き足した項目を消す。全部書けたら注記ごと消す
- 対象ファイル以外は編集しない。他の章にリンクを足したほうがよい箇所があれば、報告に書く

# 確認
- npx tsc --noEmit
- 追加した外部URLが全件200
- 内部リンク（/books/aws-saa-c03/...）の参照先ファイルが実在する
- devサーバーが既に立っていれば curl で対象ページが200か確認（立っていなければ起動せずスキップ）

# 報告
- 書き足した節の一覧
- 使った公式ドキュメントのURL一覧
- 注記に残した項目（書けなかったもの）と理由
- 他の章に足したほうがよいリンク

# 添付
AGENTS.md / docs/books/guide.md / 対象ファイル / content/books/aws-saa-c03/application-security.mdx（トーン参考）
```

---

## P4: 公式ドキュメントリンクの横展開（本ごとに1セッション）

**モデル**: 中位以上（URL実在確認が必須） / **効果**: SEO中（E-E-A-T）+ UX / **工数**: 本あたり中

**進捗**: javascript ✅ / typescript ✅ / css-basics ✅（2026-08-08確認） / 残り: react-learning → next-js。
メモ: TypeScript公式ハンドブックに日本語版は無い（/ja/ は tsconfig リファレンスと Playground のみ）。英語リンクには「（英語）」を明記する。

対象の優先順: react-learning → next-js。
リンク先の目安: TS=typescriptlang.org、CSS/JS/Web API=developer.mozilla.org/ja、
React=ja.react.dev、Next.js=nextjs.org/docs。

```
docs/books/guide.md の「外部公式ドキュメントへのリンク」の節に厳密に従い、
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
docs/books/guide.md / 対象の本の全章
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
docs/books/guide.md / 章ページ page.tsx / src/lib/book-theme.ts / src/app/layout.tsx
```

---

## TODO — P7: 章末フィードバックウィジェット（「この章は役に立ちましたか？」）

**モデル**: 中位以上（API設計を含む） / **効果**: 改善サイクルのデータ源 + エンゲージメント / **工数**: 中
**状態**: 未着手。着手時は以下をそのまま委任できる。

```
docs/books/guide.md 仕様の教科書サイトに、章末フィードバックウィジェットを実装してほしい。

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
docs/books/guide.md / 章ページ page.tsx / src/app/api/ 配下の既存Route Handler例 / sitemap.ts
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
サイトは docs/books/guide.md 仕様の学習サイト（クイズ + 教科書）。

# やること
1. 掲載順位5〜20位 かつ 表示回数が多いクエリを抽出
2. 各クエリに対応する教科書の章（/books/...）またはクイズページを特定
3. 章ごとに「検索意図に対して不足しているコンテンツ」を診断し、
   修正案（description書き直し / H2追加 / 補筆 / 新章）を優先度付きで提案

# 制約
- 提案のみで停止し、承認後に修正へ着手する

# 添付
GSCのCSVエクスポート / docs/books/guide.md
```
