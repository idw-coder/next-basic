"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  parseTiptapDoc,
  stripUrlsFromText,
  stripUrlsFromTiptapDoc,
  type TiptapNode,
} from "@/lib/quizContent";

interface ExplanationViewProps {
  explanation: string;
  /** 本文から取り除くURL（教科書リンクはカード表示に置き換えるため） */
  stripUrls?: string[];
}

// tiptap形式のJSONを解析して表示
function TiptapExplanation({
  doc,
  stripUrls,
}: {
  doc: TiptapNode;
  stripUrls?: string[];
}) {
  const content =
    stripUrls && stripUrls.length > 0 ? stripUrlsFromTiptapDoc(doc, stripUrls) : doc;
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
  const doc = parseTiptapDoc(explanation);
  if (doc) {
    return <TiptapExplanation doc={doc} stripUrls={stripUrls} />;
  }

  // リッチテキスト導入前に登録されたプレーンテキストの解説
  return (
    <p className="text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
      {stripUrlsFromText(explanation, stripUrls ?? [])}
    </p>
  );
}
