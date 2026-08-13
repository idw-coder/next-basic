# コード負債の棚卸しと再発防止

最終更新: 2026-08-13

## このファイルの位置づけ

`technical/todo.md` とは扱うものが違う。

- `todo.md` … **個別の不具合・積み残し**。hydrationエラー、認証フォームのUX不足など、
  1件ずつ直せば終わるもの。着手順に上から並べる
- このファイル … **横断的・構造的な負債**。1箇所直しても意味がなく、
  プロジェクト全体の決めごととセットでないと解決しないもの

両方に載る話題があってよい（例: `dark:` は todo.md の 4 にも書いてある）。
todo.md は「その画面をどうするか」、こちらは「なぜ増え続けるか」を扱う。

---

## 現状の計測（2026-08-13 時点）

| 項目 | 件数 | 備考 |
|---|---:|---|
| `dark:` クラス | 340 | ダークモード自体が未実装。全部デッドコード |
| `gray-*` 系ユーティリティ | 254 | Tailwind標準パレット |
| ブランドトークン（`brand`/`ink`/`cream`） | 255 | `globals.css` 定義 |
| インライン hex（`bg-[#...]` 等） | 3 | `HeaderNav.tsx` など |
| `transition-all` | 14 | プロパティ指定が無く再描画コストが読めない |
| `text-[10px]` | 45 | 日本語では小さすぎる |
| `shuffleArray` の重複定義 | 4（+変種1） | 中身は完全に同一 |

**再計測コマンド**（進捗確認に使う。数が減っていれば前進している）

```bash
for p in 'dark:' 'transition-all' 'text-\[10px\]'; do
  printf '%s: %s\n' "$p" "$(rg -o "$p" src --no-filename | wc -l | tr -d ' ')"
done
rg -c 'function shuffleArray' src
```

---

## なぜ溜まるのか

このプロジェクトは基本的にAI支援（バイブコーディング）で進めている。
そこで出る負債は、**個々の判断が間違っているわけではない**という特徴がある。

`shuffleArray` を例にすると分かりやすい。4箇所それぞれのセッションで、
「シャッフルが要る → 10行だから書く」という判断をした。単体ではどれも正しい。
既存の実装が `src/lib` に無く、他ファイルに同じものがあることを知る手段も無かった。
結果として同一関数が4つできた。

`dark:` も同じ構造。shadcn/ui のテンプレートには `dark:` が付いてくるので、
AIはそれを踏襲して書く。ダークモードが未実装であることは指示しない限り伝わらない。

つまり原因は**プロジェクトの決めごとがどこにも書かれていないこと**にある。
現状 `.cursorrules` は1行しかない。

```
Generate commit messages in Japanese.
```

規約が無い以上、AIはその場ごとに妥当な判断をする。それが積み重なって
「誰も間違えていないのに全体は不整合」という状態になる。

### 帰結: 掃除より先に、生成を止める

ここが一番大事なところ。**掃除しても再発する**。
`shuffleArray` を共通化しても、次のセッションでまたローカルに書かれる。
色を揃えても、次に足すコンポーネントは `gray-*` で書かれる。

なので着手順は下記に固定する。逆順にやると、掃除した先から積み上がる。

1. 規約を明文化する（AIが読む場所に置く）
2. 機械判定できるものを lint に落とす
3. それから掃除する

---

## 1. 再発防止（最優先）

### 1-1. 規約を `AGENTS.md` に明文化する

**現状**: `AGENTS.md` も `.cursor/rules/` も存在しない。`.cursorrules` は1行のみ。

最低限これだけ書けば、今回の監査で挙げた指摘の大半は最初から発生しない。

- **色**: `--color-brand-*` / `--color-ink*` / `--color-cream*` から選ぶ。
  `gray-*` とインラインhexは新規で使わない
- **ダークモード**: 未実装。`dark:` を新規に追加しない
- **トランジション**: `transition-all` ではなく `transition-colors` など対象を明示する
- **エラー処理**: 取得失敗を `catch { return [] }` で握りつぶさない。
  失敗を呼び出し側に伝える（`throw` するか、`failed` フラグを返す）
- **文字サイズ**: 本文相当に `text-[10px]` を使わない。日本語の下限は11px
- **共通処理**: 汎用ユーティリティは `src/lib` に置く。コンポーネント内に定義しない

工数は小さい（30分程度）。効果が一番大きいのでここから。

### 1-2. 機械判定できるものを ESLint に入れる

**場所**: `eslint.config.mjs`（現状 `next/core-web-vitals` + `next/typescript` のみ）

ルール文書は「読まれないことがある」が、lintは忘れようがない。
`dark:` と `transition-all` は文字列マッチで判定できるので機械化できる。

`no-restricted-syntax` でこう書ける想定（**要検証。セレクタが効くか未確認**）。

```js
{
  rules: {
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'Literal[value=/\\bdark:/]',
        message: 'ダークモードは未実装。docs/technical/code-debt.md を参照',
      },
      {
        selector: 'Literal[value=/\\btransition-all\\b/]',
        message: 'transition-colors など対象を明示する',
      },
    ],
  },
}
```

既存340箇所があるので、いきなり `error` にすると `pnpm lint` が通らなくなる。
`warn` で入れて新規追加だけ気づける状態にし、掃除が済んでから `error` に上げる。

---

## 2. 掃除（規約を置いた後）

### 2-1. `shuffleArray` が4重定義 ── 小・確実

中身は4つとも完全に同一の Fisher–Yates。差は型注釈と関数名だけ。

| 場所 | 行 | シグネチャ |
|---|---:|---|
| `src/app/quiz/random/RandomQuizClient.tsx` | 157 | `<T>(array: T[]): T[]` |
| `src/app/quiz/review/ReviewClient.tsx` | 37 | `<T>(array: T[]): T[]` |
| `src/app/quiz/[category]/[quizId]/QuizInteraction.tsx` | 130 | `<T>(array: readonly T[]): T[]` |
| `src/app/quiz/[category]/CategoryRandomStartCard.tsx` | 50 | `<T>(array: T[]): T[]` |
| `src/app/quiz/[category]/[quizId]/page.tsx` | 60 | `shuffleChoices(choices: readonly Choice[])` |

`readonly T[]` が最も緩いので、`src/lib/shuffle.ts` に
`shuffleArray<T>(array: readonly T[]): T[]` を1つ置けば5箇所すべてを置き換えられる。
`shuffleChoices` も `Choice` 固有の処理は無く、単に名前が違うだけ。

リスクはほぼ無い。規約を置いた直後の練習として手頃。

### 2-2. 色システムが3系統 ── 中・要判断

ブランドトークン255に対し `gray-*` が254。**ほぼ半々で混在している**。
「ブランド色に少し例外がある」ではなく、2つの体系が並立している状態。

一括置換は危険。`gray-400` と `--color-ink-muted` は同じ明度ではないので、
機械的に置き換えるとコントラストが変わる。対応表を先に決めてから、
画面単位で移していくのが現実的。

なお、カテゴリごとの色分けは意図的なものなので対象外。

### 2-3. `dark:` 340箇所 ── 中・要判断

`todo.md` の 4 に詳しく書いた。実装するか消すかの判断が先で、
**宙ぶらりんが一番コストが高い**（読む側が「対応済み」と誤解する）。

消す場合は機械的な削除で済むが、実装する場合は
`.dark` の `--primary`（`oklch(0.65 0.17 264)`、紫寄りの青）が
ライト側のブランド青 `#0967c9` と別物なので、トークンの調整が先に要る。

### 2-4. 巨大ファイル ── ロジックとデータを区別する

`wc -l` 上位は下記。ただし**上位3つはデータであって負債ではない**（後述）。

| ファイル | 行数 | 種別 |
|---|---:|---|
| `src/app/quiz/[category]/sectionTagMap.ts` | 1387 | データ |
| `src/app/quiz/[category]/[quizId]/QuizInteraction.tsx` | 1177 | **ロジック** |
| `src/app/books/_constants/bookSeoContent.ts` | 1115 | データ |
| `src/app/quiz/[category]/categoryContent.ts` | 880 | データ |
| `src/app/page.tsx` | 864 | 混在（75〜384行がデータ定義、385行以降がJSX） |
| `src/app/search/SearchClient.tsx` | 652 | **ロジック** |
| `src/app/admin/quizzes/[id]/edit/page.tsx` | 644 | **ロジック** |

実際に手を入れたいのは `QuizInteraction.tsx`。
2026-08-13の改修でキーボード処理を+122行足した分は、
`useQuizKeyboard` フックとして切り出せる（`todo.md` の 6 に記載）。

### 2-5. `catch` で失敗を握りつぶす ── 小〜中

8ファイルで `catch { return [] }` / `return null` のパターンがある。
これは「エラーで画面が落ちない」ようにする防御としては妥当だが、
**取得失敗と結果0件が呼び出し側で区別できなくなる**。
UI/UX監査で「エラーなのに空状態が出る」と指摘した根本原因がこれ。

- `src/lib/randomQuizSession.ts`
- `src/lib/quizContent.ts`（38行）
- `src/lib/quizQueueSession.ts`
- `src/hooks/useQuizHistory.ts`
- `src/hooks/useQuizBookmarks.ts`
- `src/app/quiz/random/page.tsx`
- `src/app/quiz/[category]/page.tsx`（85行 ── **対応済み**。`failed` フラグを返す形に変更）
- `src/app/quiz/[category]/[quizId]/page.tsx`

`quiz/[category]/page.tsx` で採った「`{ items, failed }` を返す」形が参考になる。
ただし hooks の localStorage 系は、パース失敗時に空を返すのが正しい場面もある
（初回訪問と壊れたデータの区別に意味が無い）。一律には直せない。

---

## 負債ではないもの（判断済み・触らない）

将来のセッションで「行数が多いから分割しよう」と手を出さないための記録。

- **`sectionTagMap.ts`（1387行）/ `bookSeoContent.ts`（1115行）/ `categoryContent.ts`（880行）**
  … タグ対応表とSEO文面のデータ。長いのは当然で、分割しても得は無い。
  むしろ1ファイルに集まっているほうが探しやすい
- **カテゴリごとの色分け** … 意図的な設計。色システム統一の対象外
- **`/api` を Express にプロキシする構成** … 移行途中ではなく現行方針。
  `technical/express-to-nextjs-migration.md` を参照
- **日本語のコメント** … 「なぜそうしたか」が残っているのはこのリポジトリの良いところ。
  英語化や削減はしない

---

## 進め方の目安

| 順 | やること | 規模 | 効果 |
|---|---|---|---|
| 1 | `AGENTS.md` に規約を書く | 30分 | 大（再発が止まる） |
| 2 | ESLint に `dark:` / `transition-all` を warn で追加 | 30分 | 大 |
| 3 | `shuffleArray` を `src/lib` に共通化 | 30分 | 小（練習向き） |
| 4 | `catch` 握りつぶしを画面単位で解消 | 数時間 | 中 |
| 5 | `dark:` を実装 or 削除の判断 | 要判断 | 中 |
| 6 | 色システムを画面単位で寄せる | 継続 | 中 |

1〜3 は独立していて、いつ着手しても他に影響しない。
4以降は挙動が変わるので、`todo.md` の 3（ブラウザ未検証分）の確認が済んでから。
