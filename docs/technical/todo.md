# 技術的な積み残し

最終更新: 2026-08-13

すぐに壊れるものではないが、放置すると効いてくる項目。着手順は上から。

1件ずつ直せば終わる話をここに置く。`dark:` の340箇所や色システムの混在のように、
プロジェクト全体の決めごとが要るものは `code-debt.md` にまとめた。

---

## 1. 本番DBの認証情報がリポジトリに直書き ✅ 完了（2026-08-13）

**だった問題**: `express-mysql-docker/docker-compose.prod.yml` の `nextjs` サービスに
`DB_USER=root` / `DB_PASSWORD=rootpassword` が平文で書かれ、git に追跡されていた。
しかもその値は**本番で実際に使われている現役のパスワード**だった（`db/.env` の
`MYSQL_ROOT_PASSWORD` と一致することを確認）。パスワードは `3cdb710` で履歴に混入。

### やったこと

**ファイル側**（親リポジトリ `75f3d22`）

- `docker-compose.prod.yml` の `environment:` から `DB_USER` / `DB_PASSWORD` を削除。
  `env_file: ./nextjs/.env` は元々あったので、2行消すだけで `.env` 側から供給される
- `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_CONNECTION_LIMIT` は秘匿情報ではないので compose に残した
- `nextjs/.env.example` を新規追加（サーバー側 `.env` が未追跡でキーが不明だったため）

**本番側**

- `appuser` は既に実在した（`db/.env` の `MYSQL_USER`）。パスワードを新規発行して設定
- 権限は `GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.*` のみ。
  アプリのSQLは DML だけで DDL を投げないため、これで足りる
- `/var/www/app/nextjs/.env` に `DB_USER` / `DB_PASSWORD` を追記
- **`root` のパスワードをローテーション**。`root@localhost` と `root@%` の2アカウントが
  存在したので両方に `ALTER USER`。`password_last_changed` が2行とも更新済みなのを確認
- `/var/www/app/db/.env` も新しい値に更新（既存ボリュームには効かないが再構築時の食い違い防止）

これにより、git履歴に残る `rootpassword` はどのアカウントでも通らなくなった。

### 学んだこと（次に似た作業をするとき用）

- `environment:` は `env_file:` より優先される。`.env` に書いても `environment:` に
  同じキーがあると無視されるので、**消す側の作業が必須**
- MySQL の `MYSQL_ROOT_PASSWORD` などは**データ領域の初回作成時にしか読まれない**。
  既存DBのパスワード変更は `ALTER USER` でしか行えず、`.env` の書き換えは効かない
- MySQL のアカウントは「ユーザー名 + 接続元ホスト」の組。`root@localhost` と
  `root@%` は別アカウントで、パスワードも別管理。片方だけ変えても意味がない
- デプロイ前に `.env` の値で実際に接続できるか試せば（`mysql -uappuser -p"$(grep ...)"`）、
  切り替え失敗のリスクをゼロにできる

### 残っている軽い課題

- ローカルの `next-basic/.env.local` に GHCR の PAT が平文コメントで残っている。
  git 履歴には**入っていないことを確認済み**（両リポジトリで `-S` 検索）。
  緊急ではないが、有効なトークンなら GitHub 側で失効させたい
- `root@%` は「どのホストからでも root で入れる」設定。今回は残したが、
  アプリが `appuser` に移行済みなので、将来的には削除を検討してよい

---

## 2. クイズ詳細ページのhydrationエラー

**場所**: `/quiz/[category]/[quizId]`

ページを開くだけで、ブラウザコンソールに `Hydration failed because the server rendered text ...` が出る。操作は不要で、初回ロードで必ず発生する。

**既存の問題であることは確認済み**（2026-08-12）。解説フォーマット統一の変更を `git stash` して元コードで再現したところ、同じエラーが出た。今回の変更が原因ではない。

**再現手順**

`.claude/launch.json` の devサーバーを起動し、新しいタブで下記を開いてコンソールを見る。

- `/quiz/vue-basic/196`
- `/quiz/react-basic/1`

**調査の当たり**

サーバーとクライアントで値が変わるものが原因のはず。候補は以下。

- localStorage を読む `src/hooks/useQuizBookmarks.ts` / `src/hooks/useQuizHistory.ts`
- `?from=` を扱う `src/lib/quizOrigin.ts`
- 状態を持つ `src/app/quiz/[category]/[quizId]/QuizInteraction.tsx`

**影響**

表示は正常なので実害は出ていないが、hydrationエラーが出ている間は他のReactエラーが埋もれる。コンソールを信用できる状態に戻しておきたい。

---

## 3. UI/UX改善（2026-08-13）のブラウザ未検証分

型チェック・ESLint・本番ビルドは通っているが、**ブラウザで一度も操作していない**。
ビルドが通るのは「壊れていない」証明であって「意図どおり動く」証明ではないので、
プッシュ前に下記を一度クリックして確かめる。

**確認すること**

- `/quiz/react-basic/1` で `1`〜`4` キーを押して選択肢が切り替わるか、`Enter` で回答されるか
- 回答後、フォーカスが判定結果へ移るか（Tabを押して「次の問題へ」に届くか）
- マウス操作が従来どおりか。選択肢クリック → 「回答する」の2ステップが壊れていないこと
- 選択肢の上で矢印キー。radiogroup化したので上下左右で移動する（**Tabでは移動しなくなった**）
- ヘッダー検索(⌘K)を開いた状態で `3` を押しても裏の選択肢が動かないこと
  （一度この不具合を入れて `[role="dialog"]` ガードで直した箇所。再発しやすい）
- DBを落とした状態で `/quiz/react-basic` を開き、エラー画面と再読み込みボタンが出るか

**意図的に変えた挙動（元に戻す判断が要るもの）**

- 選択肢のTab移動をやめて矢印キーに変更（ARIAのradiogroup仕様どおりだが操作感は変わる）
- `min-h-11` でリストの行が数px高くなり、1画面あたりの表示件数が減った
- `transition-all` → `transition-colors` にした箇所は、ホバー時の影やscaleが即時変化になった

---

## 4. ダークモードが未実装のまま `dark:` クラスが340箇所ある

**場所**: `src/app/globals.css` の `.dark` ブロック（112〜144行）と、各コンポーネント

`globals.css` に `.dark` のトークン定義と `@custom-variant dark` があり、
`dark:` クラスが **340箇所**（`RandomQuizClient.tsx` 68 / `page.tsx` 64 /
`SearchClient.tsx` 46 / `QuizInteraction.tsx` 16 …）書かれている。

しかし `<html>` に `dark` クラスを付けるコードがリポジトリ内に存在しない。
`next-themes` も `ThemeProvider` もトグルUIも無い。つまり**全部デッドコード**。

**厄介な点**

- `.dark` の `--primary` は `oklch(0.65 0.17 264)`（紫寄りの青）で、
  ライト側のブランド青 `#0967c9` と別物。実装したら色がちぐはぐになる
- `src/components/MermaidDiagram.tsx` だけが
  `document.documentElement.classList.contains('dark')` を読んでいるが、
  付与するコードが無いので常に `default` テーマで動いている

**判断が要る**

実装するなら `.dark` のトークンをブランド色に合わせ直す作業が先。
やらないなら340箇所を消す。どちらでもいいが、宙ぶらりんが一番コストが高い。

---

## 5. 認証フォームのUX不足

**場所**: `src/app/(auth)/login/page.tsx` / `src/app/(auth)/register/page.tsx`

- `autoComplete` が未設定。パスワードマネージャや iOS/Android の自動入力が効かない。
  `email` / `current-password` / `new-password` を入れるだけ。**無料サイトの登録の摩擦になるので優先度は高い**
- メール形式のバリデーションが無い（`required` のみ）
- パスワードは `minLength: 6` だけ。確認用フィールドも表示トグルも無い
- ページに `<h1>` が無い（`profile/page.tsx` も同様）
- Googleログインボタンが送信中も押せる（`disabled` が付いていない）
- `text-gray-400` などブランドトークン外の色を使っている

---

## 6. 自分で作った負債（2026-08-13の改修で発生）

**エラー表示が4か所に散らばった**

`src/components/ErrorState.tsx` を共通化したのに、下記3つはそれを使わず個別に書いた。
全画面用と「リストの枠内」用で形が違ったため。`ErrorState` に inline variant を
持たせれば1つにまとめられる。

- `src/app/quiz/[category]/QuizListClient.tsx`
- `src/app/search/SearchClient.tsx`
- `src/app/quiz/review/ReviewClient.tsx`

**`QuizInteraction.tsx` が1177行になった**

元から1000行超あったファイルにキーボード処理を+122行足した。
`useQuizKeyboard` のようなフックに切り出すのが素直だった。

**`src/app/error.tsx` の影響範囲が全ルート**

独自バウンダリを持たないルートは全部この画面になる。`/payment` で
決済途中にエラーが出た場合、「トップページに戻る」だけでは案内が足りない可能性がある。
`src/app/payment/error.tsx` を別途用意することを検討。

**skip link に `z-[60]` を使った**

`src/app/layout.tsx`。ヘッダーが `z-50` なのでそれより上にする必要があった。
プロジェクトに名前付きの z-index スケールが無いのが根本原因。

---

## 7. 残りのUI/UX指摘（小粒・急がない）

2026-08-13のUI/UX監査で挙げたうち、未対応のもの。

**表示の間違い・保守性**

- `src/app/page.tsx` のヒーローで「16カテゴリ」が literal `16`。
  同じページの別箇所は `CATEGORIES.length` を使っているので、カテゴリを増やすとズレる
- お知らせ21件が `src/app/page.tsx` に直書き（308〜383行付近）。更新のたびにデプロイが要る
- `src/app/quiz/bookmarks/page.tsx` のグループ見出しがカテゴリのslug生表示。
  `useQuizBookmarks` が表示名を保存していないため、直すには保存データの構造変更が必要

**アクセシビリティ・可読性**

- `text-[10px]` が45箇所（`text-[9〜11px]` 合わせて84箇所）。日本語で10pxは厳しい。
  トップページの本文相当だけ11pxに上げたが、他は手つかず
- `transition-all` が14箇所残っている
- `.prose :target { scroll-margin-top: 5rem }`（80px）に対し、
  ヘッダーは56/64px、章ページの目次は `top-[7.5rem]`（120px）。アンカー着地位置がずれうる
- `src/app/quiz/[category]/[quizId]/page.tsx` 281行の `sr-only` + `aria-hidden="true"` 併用。
  クローラー向けの意図は分かるが、コメントが「スクリーンリーダーからアクセス可能」と
  書いてあり実態と食い違っている（`aria-hidden` が打ち消している）

**機能面**

- 進捗バーが出るのはランダムセッション時のみ。カテゴリ一覧から個別に解くと現在地が見えない
- 「前の問題へ」戻る導線が無い
- 色システムが3系統混在。ブランドトークン（`--color-brand-*`）、Tailwindパレット（`gray-*`）、
  インラインhex（`HeaderNav.tsx` の `hover:bg-[#fff2cd]` など）。
  カテゴリごとの色分けは意図的だと思うが、`gray-*` は `--color-ink-muted` に寄せられる

---

## 8. 解説文が選択肢を「選択肢A」とラベル参照している

選択肢は表示時にシャッフルされるのに、解説が `選択肢A` と固定ラベルで指している。
並び順が変わると対応が崩れ、`quiz.id=460` では解説が正解を誤答として否定していた。

原因は問題作成プロンプトに参照方法の指定が無かったこと。以下を追記済みで、
以降の生成分では発生しない。

- 解説内で選択肢を指す場合は、必ず選択肢の内容を引用して参照する。
  「選択肢A」「選択肢1」「上から2番目」のようなラベル・位置・番号での参照は禁止。

**残作業**: 既存23件の `explanation` を再生成（slug はインデックス済みのため維持）。

- 対応済: 460, 385, 16, 25, 46, 464, 465
- 残り18件: 437, 458, 459, 461, 462, 463, 466, 467, 477, 478, 479, 480,
  481, 482, 483, 484, 561, 565

抽出SQL（「選択肢」はターミナルで日本語が落ちるため16進で渡す。
接続は `--default-character-set=utf8mb4`）:

```sql
SET @s = CONVERT(UNHEX('E981B8E68A9EE882A2') USING utf8mb4);
SELECT id, slug, explanation
FROM quiz
WHERE deleted_at IS NULL
  AND explanation LIKE CONCAT('%', @s, '%')
ORDER BY id;
```
