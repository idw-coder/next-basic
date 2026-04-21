"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface ExplanationViewProps {
  explanation: string;
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
function TiptapExplanation({ explanation }: { explanation: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: JSON.parse(explanation),
    editable: false,
    immediatelyRender: false,
  });

  return (
    <div className="tiptap-explanation prose prose-sm max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
}

export default function ExplanationView({ explanation }: ExplanationViewProps) {
  if (isTiptapJSON(explanation)) {
    return <TiptapExplanation explanation={explanation} />;
  }

  // BlockNote形式の旧データはプレーンテキストに変換して表示
  if (isBlockNoteJSON(explanation)) {
    return (
      <p className="text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
        {extractTextFromBlockNote(explanation)}
      </p>
    );
  }

  return (
    <p className="text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
      {explanation}
    </p>
  );
}