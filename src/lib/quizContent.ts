/**
 * クイズ解説（explanation）の保存形式を扱うユーティリティ。
 *
 * 保存形式は2つだけ:
 *   - tiptap JSON  … 管理画面のリッチテキストエディタが出力する `{ type: "doc", content: [...] }`
 *   - プレーンテキスト … リッチテキスト導入前に登録された解説
 *
 * かつて存在したBlockNote形式（JSON配列）は全データをtiptapへ移行済みのため扱わない。
 *
 * Server Component（メタデータ・JSON-LD生成）とClient Component（表示）の
 * 双方から使うため、副作用と環境依存を持たない純粋関数だけを置く。
 */

export interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
  [key: string]: unknown;
}

/** tiptapのドキュメントJSONかどうか。プレーンテキストならfalse。 */
export function isTiptapDoc(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.startsWith('{')) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed?.type === 'doc' && Array.isArray(parsed?.content);
  } catch {
    return false;
  }
}

/** tiptap JSONとして解析する。形式が違えばnull。 */
export function parseTiptapDoc(value: string): TiptapNode | null {
  if (!isTiptapDoc(value)) return null;
  try {
    return JSON.parse(value.trim()) as TiptapNode;
  } catch {
    return null;
  }
}

/** ノード木から可視テキストだけを連結する。 */
export function tiptapNodeText(node: TiptapNode | null | undefined): string {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text' && typeof node.text === 'string') return node.text;
  if (Array.isArray(node.content)) return node.content.map(tiptapNodeText).join('');
  return '';
}

/**
 * 保存形式を問わずプレーンテキストを得る。
 * `<title>`・meta description・JSON-LD・スクリーンリーダー用テキストなど、
 * リッチな構造を持てない箇所で使う。
 */
export function toPlainText(value: string | undefined | null): string {
  if (!value) return '';
  const doc = parseTiptapDoc(value);
  return doc ? tiptapNodeText(doc) : value;
}

/** プレーンテキストからURLを取り除き、残った空行を整理する。 */
export function stripUrlsFromText(text: string, urls: string[]): string {
  let result = text;
  for (const url of urls) {
    result = result.split(url).join('');
  }
  return result.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * tiptapノードからURLを取り除く。
 * URLを含む長文ノードは部分削除し、空になった段落は段落ごと落とす（docは残す）。
 * 教科書リンクをカード表示へ置き換えるために使う。
 */
export function stripUrlsFromTiptapDoc(
  node: TiptapNode | null,
  urls: string[],
): TiptapNode | null {
  if (!node || typeof node !== 'object') return node;
  if (node.type === 'text' && typeof node.text === 'string') {
    let text = node.text;
    for (const url of urls) {
      text = text.split(url).join('');
    }
    if (text.trim() === '') return null;
    return { ...node, text };
  }
  if (Array.isArray(node.content)) {
    const content = node.content
      .map((child) => stripUrlsFromTiptapDoc(child, urls))
      .filter((child): child is TiptapNode => child !== null);
    if (content.length === 0 && node.type === 'paragraph') return null;
    return { ...node, content };
  }
  return node;
}
