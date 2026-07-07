"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface ExplanationViewProps {
  explanation: string;
  /** 本文から取り除くURL（教科書リンクはカード表示に置き換えるため） */
  stripUrls?: string[];
}

// プレーンテキストからURLを取り除き、残った空行を整理する
function stripUrlsFromText(text: string, urls: string[]): string {
  let result = text;
  for (const url of urls) {
    result = result.split(url).join('');
  }
  return result.replace(/\n{3,}/g, '\n\n').trim();
}

// tiptap JSONからURLだけのテキストノードを取り除く。
// URLを含む長文ノードは部分削除し、空になった段落ごと落とす。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripUrlsFromTiptap(node: any, urls: string[]): any | null {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((child: any) => stripUrlsFromTiptap(child, urls))
      .filter(Boolean);
    // テキストが全て消えた段落は段落ごと削除（docは残す）
    if (content.length === 0 && node.type === 'paragraph') return null;
    return { ...node, content };
  }
  return node;
}

// tiptap形式のJSONかどうかをチェック→trueならTiptapExplanationコンポーネントを返す
function isTiptapJSON(explanation: string): boolean {
  const trimmed = explanation.trim();
  if (!trimmed.startsWith("{")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed?.type === "doc" && Array.isArray(parsed?.content);
  } catch {
    return false;
  }
}

// BlockNote形式（JSON配列）からプレーンテキストを抽出する。
// 管理画面をBlockNote→tiptapに移行したため、旧データの互換用。
// リッチテキスト表示は不要で、プレーンテキストとして表示できれば十分。
function extractTextFromBlockNote(json: string): string {
  try {
    const blocks = JSON.parse(json);
    if (!Array.isArray(blocks)) return json;
    const texts: string[] = [];
    for (const block of blocks) {
      if (Array.isArray(block?.content)) {
        for (const item of block.content) {
          if (typeof item?.text === "string") texts.push(item.text);
        }
      }
    }
    return texts.join("\n") || json;
  } catch {
    return json;
  }
}

// BlockNote形式（JSON配列）かどうかをチェック→trueならextractTextFromBlockNoteコンポーネントを返す
function isBlockNoteJSON(explanation: string): boolean {
  const trimmed = explanation.trim();
  if (!trimmed.startsWith("[")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) && parsed.every(
      (b: Record<string, unknown>) => b !== null && typeof b === "object" && "type" in b
    );
  } catch {
    return false;
  }
}

// tiptap形式のJSONを解析して表示
function TiptapExplanation({
  explanation,
  stripUrls,
}: {
  explanation: string;
  stripUrls?: string[];
}) {
  const content =
    stripUrls && stripUrls.length > 0
      ? stripUrlsFromTiptap(JSON.parse(explanation), stripUrls)
      : JSON.parse(explanation);
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
    immediatelyRender: false,
  });

  return (
    <div className="tiptap-explanation prose prose-sm max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
}

export default function ExplanationView({ explanation, stripUrls }: ExplanationViewProps) {
  if (isTiptapJSON(explanation)) {
    return <TiptapExplanation explanation={explanation} stripUrls={stripUrls} />;
  }

  // BlockNote形式の旧データはプレーンテキストに変換して表示
  if (isBlockNoteJSON(explanation)) {
    return (
      <p className="text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
        {stripUrlsFromText(extractTextFromBlockNote(explanation), stripUrls ?? [])}
      </p>
    );
  }

  return (
    <p className="text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
      {stripUrlsFromText(explanation, stripUrls ?? [])}
    </p>
  );
}