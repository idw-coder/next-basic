const CODE_HTML_ENTITIES: Readonly<Record<string, string>> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
};

function decodeCodeHtmlEntities(content: string): string {
  let decoded = content;
  let previous: string;

  do {
    previous = decoded;
    decoded = decoded.replace(/&(amp|lt|gt|quot|apos|#39);/gi, (entity: string) => {
      return CODE_HTML_ENTITIES[entity.toLowerCase()] ?? entity;
    });
  } while (decoded !== previous);

  return decoded;
}

/**
 * HTML本文は維持したまま、code要素の中身だけを安全なテキストに正規化する。
 * pre > codeも同じcode要素として処理するため、インラインと複数行の両方に対応する。
 */
export function escapeHtmlInCode(html: string): string {
  return html.replace(
    /(<code\b[^>]*>)([\s\S]*?)(<\/code\s*>)/gi,
    (_match: string, openTag: string, content: string, closeTag: string) => {
      const decoded = decodeCodeHtmlEntities(content);
      const escaped = decoded.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return `${openTag}${escaped}${closeTag}`;
    },
  );
}
