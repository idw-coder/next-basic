# AI委任タスク指示書集

教科書（Books）機能の改善タスクを、別のAIセッションへコピペで委任するための指示書。
優先度順（P1が最優先）。各コードブロックを丸ごと貼り、「添付」欄のファイルを一緒に渡す。

> 整理メモ（2026-08-08）: Books 仕様の一次情報は `docs/books/guide.md`。このファイルは未完了タスクの委任用プロンプトとして使う。完了したタスクは削除する（経緯はgit履歴で追える）。

## 全タスク共通の注意（委任前に必ず伝える）

- **devサーバーを起動させない。** 多重起動すると velite が `.velite/` を同時書き込みし、JSONが壊れて全ページが500になる。表示確認は既に立っているサーバーへ `curl` で行い、立っていなければ確認をスキップさせる
- **`pnpm exec velite` / `pnpm build` も実行させない**（`.velite/` を消すため、他セッションのdevサーバーが即座に壊れる）
- **ブラウザ版ChatGPTなど、リポジトリのファイルを自動で読まないツールに委任するときは `AGENTS.md` を必ず貼る**（Claude Code・Codex・Cursorは自動で読む）
- **同じ本のコンテンツを複数セッションで同時に編集しない**（書き戻し競合が起きる）
- 作業後は `pnpm exec tsc --noEmit` を通し、変更ファイル一覧を報告させる

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
- pnpm build が通る（ビルド時間の増加も報告）

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

## P8: TypeScriptの本に「エラーコード別の原因と直し方」の章を追加

**モデル**: 高（エラーの再現と原因の正確さが要る） / **効果**: 検索流入＋困っている読者への直接の回答 / **工数**: 中
**根拠**: Search Console（2026-08-11〜11-13）で `ts2591`（2.7位）・`ts2339`（7.3位）・`ts2769`（5.0位）・`no overload matches this call`（6.6位）・`cannot find name process`（40.2位）が合計約30表示でクリック0。TypeScriptの本にはエラーコードを見出しにした章がなく、既存章でのエラーコードの言及は `11-tsconfig.mdx` の TS7006 と TS2322 の2か所だけ。

```
content/books/typescript に、エラーコード別に原因と直し方を引ける章を1つ追加してほしい。

# 最初に読むもの
- AGENTS.md（devサーバーとVeliteのルール。pnpm exec velite と pnpm build は実行しない）
- docs/books/guide.md（執筆ルール。Figure・SpeechBubbleの使い方、強調記法の注意）
- content/books/typescript の既存15章（文体・コンポーネントの使い方・扱い済みの範囲を把握する）

# 作るファイル
- content/books/typescript/common-errors.mdx（ファイル名に連番を付けない）
- frontmatter: order: 15（既存章のorderは動かさない）。title と description は既存章の形式に合わせる
- title にはエラーコードを2〜3個含める（例: 「TypeScriptのエラーコード別の原因と直し方 — TS2339・TS2769・TS2591」）

# 扱うエラー（この順で、1エラー＝1つのh2）
必須（検索で実際に表示されているもの）
1. TS2339: Property 'x' does not exist on type 'Y'.
2. TS2769: No overload matches this call.
3. TS2591: Cannot find name 'process'（@types/node が必要なケース）
4. TS2304: Cannot find name 'x'.
追加（頻出のもの。再現できたものだけ載せる）
5. TS2322: Type 'A' is not assignable to type 'B'.
6. TS2345: Argument of type 'A' is not assignable to parameter of type 'B'.
7. TS7006: Parameter 'x' implicitly has an 'any' type.
8. TS18048 / TS2532: 'x' is possibly 'undefined'. / Object is possibly 'undefined'.
9. TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type ...

# 各エラーの書き方
- h2 は「TS2339: Property 'x' does not exist on type 'Y'」のように、コードと英語のエラー文をそのまま入れる
  （読者はエラー文をコピーして検索するため）
- 構成は「エラーが出る最小のコード → tscの出力そのまま → 原因 → 直し方（複数あれば使い分け）」
- 原因が複数あるエラー（TS2339・TS2769）は、原因ごとにh3で分ける
- 該当する既存章があれば、その章へ内部リンクを張る
  （絞り込みは 05-narrowing、アサーションは 08-assertion-and-guard、@types は 12-type-definitions、strict は 11-tsconfig）
- 章の冒頭に、エラーコードと一言の原因を並べた早見表を置く

# 正確さのルール（重要）
- エラー文とエラーコードを記憶で書かない。スクラッチ用の一時ディレクトリで実際に tsc を実行し、
  出力をそのまま貼る。使った TypeScript のバージョンを章の冒頭に明記する
- 再現できなかったエラーは載せない。載せなかったものは作業報告に書く
- 断定には公式ドキュメントへのリンクを付ける。TypeScript Handbook には日本語版がないので、
  英語ページへのリンクには「（英語）」と明記する。出典のない判断は「筆者の解釈」と書く
- 技術の説明に例えを使わない。実際の用語と動作をそのまま書く
- 外部URLは curl -s -o /dev/null -w "%{http_code}" -L <url> で全件200を確認する

# 書いたあとにやること
- 14-practical-patterns.mdx の末尾に「次の章」や本の締めの文があるか確認し、
  新しい章が最後になることと矛盾していれば直す
- src/app/books/_constants/searchSuggestions.ts に検索サジェストを足す
  （基準は docs/books/guide.md の「章を追加したら検索サジェストを見直す」）
- 新しい本の追加ではないので、guide.md の「デプロイ後の作業」1〜6は不要
- pnpm exec tsc --noEmit を通す
- 表示確認は lsof -nP -iTCP -sTCP:LISTEN | grep node で既存のdevサーバーを探し、
  立っていればそこへ curl する。立っていなければ AGENTS.md の手順に従う
- MDXは1ファイルずつ書き込む（devサーバー稼働中に複数MDXを連続で書くと .velite/chapters.json が壊れる）
- コミットはしない。変更ファイル一覧、再現に使ったTypeScriptのバージョン、載せなかったエラーを報告する

# 添付（リポジトリを自動で読まないツールの場合）
AGENTS.md / docs/books/guide.md / content/books/typescript/11-tsconfig.mdx（文体の見本）
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
