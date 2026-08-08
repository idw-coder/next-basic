# MDX技術書チャプター生成プロンプト

以下の仕様に従って、技術書のチャプター（MDXファイル）を生成してください。

---

## プロジェクト概要

Next.js + Velite による技術書サイトです。コンテンツは `content/books/{bookSlug}/` 配下の `.mdx` ファイルで管理されています。

### 書籍の構成例（TypeScript本）

```
content/books/typescript/
├── index.yaml
├── 01-introduction.mdx
├── 02-basic-types.mdx
├── 03-type-alias-and-interface.mdx
├── 04-union-and-literal.mdx
├── 05-narrowing.mdx
├── 06-functions.mdx
├── 07-generics.mdx
├── 08-assertion-and-guard.mdx
├── 09-utility-types.mdx
├── 10-modules.mdx
├── 11-tsconfig.mdx
├── 12-type-definitions.mdx
├── 13-react-and-typescript.mdx
└── 14-practical-patterns.mdx
```

---

## frontmatter

各 `.mdx` ファイルの先頭に以下の形式で記載します。

```yaml
---
title: '章タイトル — サブタイトル'
description: '1〜2文の説明。検索やOGPに使われる。'
order: 1
chapterLabel: '第1章' # 任意。order と別の表示ラベルにしたい場合だけ指定
---
```

- `title`: 章番号は含めない。ダッシュ区切りでサブタイトルを付けるパターンが多い（例: `'ユニオン型とリテラル型 — 型を絞り込む'`）
- `order`: 章の表示順（数値）
- `chapterLabel`: 任意。`order: 7.1` のような小数で差し込む章を、読者向けに自然なラベルで表示したい場合だけ指定する

---

## 文体・トーン

- 日本語で記述
- 「です・ます」調
- 読者を「あなた」と呼ばない。主語は省略するか「TypeScriptは〜」のように主題を主語にする
- 冗長な前置き・挨拶は不要。冒頭から本題に入る
- 「〜しましょう」より「〜します」を使う
- 絵文字は使わない

---

## 構成パターン

### 冒頭

frontmatterの直後に、この章で何を扱うかを1〜2段落で簡潔に述べる。Calloutやコードブロックは使わず、プレーンなテキストで始める。

```mdx
TypeScriptには、既存の型を変換して新しい型を作る**ユーティリティ型**が組み込まれています。自分で一から型を書かなくても、「この型の一部だけ使いたい」「全プロパティをオプショナルにしたい」といった変換を簡潔に書けます。
```

### セクション区切り

`---`（水平線）で大きなセクションを区切る。`## 見出し` の前に `---` を置く。

### コード例

- 言語は `tsx`（TypeScript + JSX）を基本とする。純粋なJSの例は `js`
- コード内にコメントで補足を入れる（`// ← ここがポイント` のように）
- 良い例と悪い例を対比する場合は、エラーになるコードにコメントで `// エラー — 理由` を付ける

```tsx
greet({ name: 'Alice' }); // OK
greet('Alice');            // エラー — string型はUser型に代入できない
```

### 末尾

「まとめ」セクションで章の要点を2〜3段落でまとめる。箇条書きでもよいが、だらだら並べない。最後の1文で次の章への導線を置く。

```mdx
次の章では、TypeScriptのモジュールシステムと `import` / `export` の型を扱います。
```

---

## 使用可能なMDXコンポーネント

MDX内で以下のカスタムコンポーネントが使えます（`mdx-content.tsx` で登録済み）。

### 1. `<Callout>`

補足情報・Tips・注意点に使う。`type="column"` で使用する。

```mdx
<Callout type="column">
### 見出し（短く）

補足テキスト。コードブロックも入れられる。
閉じタグの前に空行を1つ入れること。

</Callout>
```

**使いどころ:**
- 内部実装の解説（「裏側ではこうなっている」）
- よくある間違いや注意点
- 「〜ではなく〜を使う」といった使い分けの補足
- フレームワーク固有の事情（「Next.jsを使っている場合」など）

**ルール:**
- 1章あたり2〜4個が目安。多すぎると本文が読みにくくなる
- 本文の流れを止めない位置に配置する（セクション末尾が自然）
- Callout内の見出しは `###` を使う

### 2. `<MermaidDiagram>`

フローチャート・シーケンス図・状態遷移図などに使う。

```mdx
<MermaidDiagram
  chart={`
flowchart TD
    classDef mount fill:#3b82f6,color:#fff,stroke:#2563eb
    classDef render fill:#f59e0b,color:#fff,stroke:#d97706

    A["ステップ1"] --> B["ステップ2"]
    B --> C["ステップ3"]

    class A mount
    class B,C render

`}
/>
```

**props:**
- `chart` (必須): Mermaid記法の図定義。バッククォート内に記述
- `id` (任意): 一意なID。同じページに複数のMermaidがある場合は指定する（デフォルト: `'mermaid-diagram'`）
- `maxWidth` (任意): 最大幅（例: `"500px"`）

**使いどころ:**
- 処理フロー・ライフサイクルの可視化
- 型の関係性・派生の図解
- 概念の全体像

**ルール:**
- `classDef` でノードに色を付ける。推奨色:
  - 青系: `fill:#3b82f6,color:#fff,stroke:#2563eb`
  - 紫系: `fill:#8b5cf6,color:#fff,stroke:#7c3aed`
  - 黄系: `fill:#f59e0b,color:#fff,stroke:#d97706`
  - 緑系: `fill:#22c55e,color:#fff,stroke:#16a34a`
  - 赤系: `fill:#ef4444,color:#fff,stroke:#b91c1c`
- 1章あたり0〜2個。図が多すぎると重くなる
- チャート文字列の前後にバッククォート内で改行を入れること

### 3. `<Figure>`

イラスト画像の挿入に使う。

```mdx
## <Figure src="/images/fork_suit_man_color.png" alt="説明テキスト" maxWidth="300px" />
```

**props:**
- `src` (必須): `/images/` 配下の画像パス
- `alt` (必須): 代替テキスト
- `maxWidth` (任意): 最大表示幅

**使用可能な画像一覧:**

| ファイル名 | 内容 | 推奨用途 |
|---|---|---|
| `fork_suit_man_color.png` | 分岐で悩んでいる男性 | 選択・判断に迷う場面、使い分けの導入 |
| `question_woman_04_color.png` | 疑問を持つ女性 | 「なぜ？」「どうして？」の導入 |
| `relief_man_color.png` | 安心している男性 | 問題解決後、「これで安心」の場面 |
| `planning_suit_man_color.png` | 計画を立てている男性 | 設計・構成の導入 |
| `stepup_suit_man_color-1.png` | ステップアップする男性 | レベルアップ、応用への導入 |
| `pc-work-woman01.png` | PCで作業する女性 | 実装・コーディングの場面 |
| `usingcomputer_suit_woman_color.png` | PCを使う女性（スーツ） | 実務・業務での活用場面 |

**ルール:**
- `## <Figure ... />` のように見出しレベルの行に置く（表示位置の調整のため）
- 1章あたり0〜2枚。内容に合ったものだけ使う
- 章の冒頭〜序盤に1枚、または話題の転換点に1枚が自然

---

## テーブル

情報の一覧・比較には Markdown テーブルを使う。

```mdx
| 項目 | 説明 |
| --- | --- |
| `Partial<T>` | 全プロパティをオプショナルに |
| `Required<T>` | 全プロパティを必須に |
```

---

## 他の章への参照

同じ書籍内の他の章を参照する場合は、章番号と内容を自然に言及する。リンクは張らなくてよい（同一書籍内の参照は読者が目次から辿れる）。

```mdx
型の絞り込みについては05章で詳しく扱います。
交差型については03章で解説しています。
```

---

## 生成時の入力テンプレート

以下の情報を指定して章の生成を依頼してください。

```
## 生成依頼

- 書籍: [書籍名（例: TypeScript）]
- 章番号/ファイル名: [例: 05-narrowing.mdx]
- title: [章タイトル]
- description: [説明文]
- order: [数値]
- chapterLabel: [任意。例: 配列メソッド 1]
- 扱うトピック: [箇条書きで主要トピックを列挙]
- 想定読者レベル: [例: JavaScript経験者、TypeScript初学者]
- 前の章との接続: [前章の最後で何を予告したか]
- 次の章への接続: [この章の最後で何を予告するか]
- 使いたいコンポーネント: [Callout / MermaidDiagram / Figure（画像名）から選択]
- 分量目安: [例: 150〜250行]
```

---

## 品質チェックリスト

生成後、以下を確認してください。

- [ ] frontmatterの `title` / `description` / `order` が正しい
- [ ] 冒頭がプレーンテキストで始まっている（Calloutやコードから始めない）
- [ ] コード例に言語指定がある（`tsx` / `js` / `ts`）
- [ ] エラーになるコードにはコメントで理由が書かれている
- [ ] Calloutの閉じタグ前に空行がある
- [ ] MermaidDiagramの `chart` 内の先頭・末尾に改行がある
- [ ] 同一ページに複数のMermaidDiagramがある場合、`id` を分けている
- [ ] Figureの `src` が使用可能な画像一覧に存在する
- [ ] 「まとめ」セクションがある
- [ ] 最後の文が次の章への導線になっている
- [ ] 1章あたりCallout 2〜4個、MermaidDiagram 0〜2個、Figure 0〜2枚の範囲内
