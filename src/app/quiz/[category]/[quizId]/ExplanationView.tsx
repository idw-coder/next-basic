'use client';

import type { PartialBlock } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';

/**
 * BlockNote形式のJSONかどうかを簡易判定
 */
function parseBlockNoteContent(explanation: string): unknown[] | null {
  const trimmed = explanation.trim();
  if (!trimmed.startsWith('[')) return null;
  try {
    const parsed = JSON.parse(explanation) as unknown;
    if (!Array.isArray(parsed)) return null;
    const looksLikeBlocks = parsed.every(
      (b) =>
        b !== null &&
        typeof b === 'object' &&
        'type' in (b as object) &&
        typeof (b as { type: unknown }).type === 'string'
    );
    return looksLikeBlocks ? parsed : null;
  } catch {
    return null;
  }
}

interface ExplanationViewProps {
  explanation: string;
}

export default function ExplanationView({ explanation }: ExplanationViewProps) {
  const blocks = parseBlockNoteContent(explanation);

  if (blocks && blocks.length > 0) {
    return <BlockNoteExplanation explanation={explanation} blocks={blocks} />;
  }

  return (
    <p className="text-muted-foreground whitespace-pre-wrap">{explanation}</p>
  );
}

function BlockNoteExplanation({
  explanation,
  blocks,
}: {
  explanation: string;
  blocks: unknown[];
}) {
  const editor = useCreateBlockNote(
    {
      initialContent: blocks as PartialBlock[],
      trailingBlock: false,
    },
    [explanation]
  );

  return (
    <div className="bn-mantine-explanations [&_.bn-editor]:min-h-0 [&_.bn-block-content]:!py-0 [&_.bn-block-content]:!pt-0 [&_.bn-side-menu]:hidden [&_.bn-toolbar]:hidden">
      <BlockNoteView editor={editor} editable={false} />
    </div>
  );
}
