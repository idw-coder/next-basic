"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

// 保存済みの解説を読み込む。tiptap JSONならそのまま、
// リッチテキスト導入前のプレーンテキストは文字列のまま渡す。
function parseContent(value: string) {
  if (!value) return "";
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({
  value,
  onChange,
  placeholder = "入力してください",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: parseContent(value),
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    if (value !== current) {
      editor.commands.setContent(parseContent(value));
    }
  }, [value, editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `px-2 py-0.5 border rounded text-sm cursor-pointer ${
      active
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white border-gray-300"
    }`;

  return (
    <div>
      <div className="flex flex-wrap gap-1 p-2 border border-b-0 rounded-t bg-gray-50">
        <button
          type="button"
          className={btnClass(editor.isActive("heading", { level: 1 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("heading", { level: 2 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("heading", { level: 3 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </button>
        <span className="w-px bg-gray-200 mx-1" />
        <button
          type="button"
          className={btnClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </button>
        <span className="w-px bg-gray-200 mx-1" />
        <button
          type="button"
          className={btnClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          ・リスト
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. リスト
        </button>
        <span className="w-px bg-gray-200 mx-1" />
        <button
          type="button"
          className={btnClass(editor.isActive("code"))}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          code
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("codeBlock"))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {"```"}
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="border rounded-b p-3 min-h-[200px] prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px] [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:text-gray-400 [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}
