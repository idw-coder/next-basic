"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface BlockNoteInlineItem {
  type: string;
  text?: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    strikethrough?: boolean;
  };
}

interface BlockNoteBlock {
  type: string;
  content?: BlockNoteInlineItem[];
  props?: { level?: number; [key: string]: unknown };
}

interface TiptapMark {
  type: string;
}

interface TiptapNode {
  type: string;
  text?: string;
  marks?: TiptapMark[];
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
}

function convertBlockNoteInline(
  content: BlockNoteInlineItem[]
): TiptapNode[] {
  if (!Array.isArray(content) || content.length === 0) return [];
  return content
    .filter((item) => item.type === "text" && item.text)
    .map((item) => {
      const node: TiptapNode = { type: "text", text: item.text };
      const marks: TiptapMark[] = [];
      if (item.styles) {
        if (item.styles.bold) marks.push({ type: "bold" });
        if (item.styles.italic) marks.push({ type: "italic" });
        if (item.styles.code) marks.push({ type: "code" });
        if (item.styles.strikethrough) marks.push({ type: "strike" });
      }
      if (marks.length > 0) node.marks = marks;
      return node;
    });
}

function convertBlockNoteToTiptap(blocks: BlockNoteBlock[]): TiptapNode {
  const content: TiptapNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i]!;
    if (block.type === "bulletListItem") {
      const items: TiptapNode[] = [];
      while (i < blocks.length && blocks[i]!.type === "bulletListItem") {
        const inline = convertBlockNoteInline(blocks[i]!.content ?? []);
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              ...(inline.length ? { content: inline } : {}),
            },
          ],
        });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }
    if (block.type === "numberedListItem") {
      const items: TiptapNode[] = [];
      while (i < blocks.length && blocks[i]!.type === "numberedListItem") {
        const inline = convertBlockNoteInline(blocks[i]!.content ?? []);
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              ...(inline.length ? { content: inline } : {}),
            },
          ],
        });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }
    const inline = convertBlockNoteInline(block.content ?? []);
    if (block.type === "heading") {
      content.push({
        type: "heading",
        attrs: { level: block.props?.level ?? 1 },
        ...(inline.length ? { content: inline } : {}),
      });
    } else if (block.type === "codeBlock") {
      const text = (block.content ?? []).map((c) => c.text ?? "").join("");
      content.push({
        type: "codeBlock",
        ...(text ? { content: [{ type: "text", text }] } : {}),
      });
    } else {
      content.push({
        type: "paragraph",
        ...(inline.length ? { content: inline } : {}),
      });
    }
    i++;
  }
  if (content.length === 0) content.push({ type: "paragraph" });
  return { type: "doc", content };
}

function isBlockNoteFormat(data: unknown): data is BlockNoteBlock[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    (data[0] as BlockNoteBlock).props !== undefined
  );
}

function parseContent(value: string) {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (isBlockNoteFormat(parsed)) return convertBlockNoteToTiptap(parsed);
    return parsed;
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
