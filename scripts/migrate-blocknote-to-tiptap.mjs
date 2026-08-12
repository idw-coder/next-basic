/**
 * 解説(explanation)に残っているBlockNote形式のJSONをtiptap形式に変換する一度きりのスクリプト。
 *
 * 管理画面のエディタをBlockNote→tiptapへ移行した際、既存データの変換をしていなかったため
 * 旧形式のまま残った行がある。表示側の互換コードを削除できるようにするための移行。
 *
 * 変換ロジックは src/components/admin/TiptapEditor.tsx の convertBlockNoteToTiptap と同じもの。
 *
 *   確認のみ: node scripts/migrate-blocknote-to-tiptap.mjs
 *   実行:     node scripts/migrate-blocknote-to-tiptap.mjs --apply
 */
import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';

// .env.local を読む（Next.jsと同じ接続情報を使う）
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      // ファイルが無ければ環境変数をそのまま使う
    }
  }
}

function convertInline(content) {
  if (!Array.isArray(content) || content.length === 0) return [];
  return content
    .filter((item) => item.type === 'text' && item.text)
    .map((item) => {
      const node = { type: 'text', text: item.text };
      const marks = [];
      if (item.styles) {
        if (item.styles.bold) marks.push({ type: 'bold' });
        if (item.styles.italic) marks.push({ type: 'italic' });
        if (item.styles.code) marks.push({ type: 'code' });
        if (item.styles.strikethrough) marks.push({ type: 'strike' });
      }
      if (marks.length > 0) node.marks = marks;
      return node;
    });
}

function convertBlockNoteToTiptap(blocks) {
  const content = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type === 'bulletListItem' || block.type === 'numberedListItem') {
      const listType = block.type;
      const items = [];
      while (i < blocks.length && blocks[i].type === listType) {
        const inline = convertInline(blocks[i].content ?? []);
        items.push({
          type: 'listItem',
          content: [{ type: 'paragraph', ...(inline.length ? { content: inline } : {}) }],
        });
        i++;
      }
      content.push({
        type: listType === 'bulletListItem' ? 'bulletList' : 'orderedList',
        content: items,
      });
      continue;
    }
    const inline = convertInline(block.content ?? []);
    if (block.type === 'heading') {
      content.push({
        type: 'heading',
        attrs: { level: block.props?.level ?? 1 },
        ...(inline.length ? { content: inline } : {}),
      });
    } else if (block.type === 'codeBlock') {
      const text = (block.content ?? []).map((c) => c.text ?? '').join('');
      content.push({ type: 'codeBlock', ...(text ? { content: [{ type: 'text', text }] } : {}) });
    } else {
      content.push({ type: 'paragraph', ...(inline.length ? { content: inline } : {}) });
    }
    i++;
  }
  if (content.length === 0) content.push({ type: 'paragraph' });
  return { type: 'doc', content };
}

function isBlockNote(value) {
  if (typeof value !== 'string' || !value.trim().startsWith('[')) return false;
  try {
    const parsed = JSON.parse(value);
    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every((b) => b !== null && typeof b === 'object' && 'type' in b)
    );
  } catch {
    return false;
  }
}

// 変換の前後でテキストが失われていないか検証する
function plainText(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return node.text ?? '';
  if (Array.isArray(node.content)) return node.content.map(plainText).join('');
  return '';
}

function blockNotePlainText(blocks) {
  return blocks
    .flatMap((b) => (Array.isArray(b.content) ? b.content : []))
    .map((c) => c.text ?? '')
    .join('');
}

async function main() {
  const apply = process.argv.includes('--apply');
  loadEnv();

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME,
  });

  const [rows] = await conn.execute(
    "SELECT id, slug, explanation FROM quiz WHERE explanation LIKE '[%'",
  );

  const targets = rows.filter((r) => isBlockNote(r.explanation));
  console.log(`対象: ${targets.length}件 (LIKE '[%' の候補 ${rows.length}件)\n`);

  let failed = 0;
  for (const row of targets) {
    const blocks = JSON.parse(row.explanation);
    const doc = convertBlockNoteToTiptap(blocks);
    const before = blockNotePlainText(blocks);
    const after = plainText(doc);
    const ok = before === after;
    if (!ok) failed++;

    console.log(`id=${row.id} ${row.slug}`);
    console.log(`  ${row.explanation.length} → ${JSON.stringify(doc).length} bytes`);
    console.log(`  テキスト一致: ${ok ? 'OK' : `NG (${before.length} → ${after.length}文字)`}`);

    if (apply && ok) {
      await conn.execute('UPDATE quiz SET explanation = ? WHERE id = ?', [
        JSON.stringify(doc),
        row.id,
      ]);
      console.log('  → 更新しました');
    }
    console.log('');
  }

  if (!apply) {
    console.log('確認のみです。実行するには --apply を付けてください。');
  } else if (failed > 0) {
    console.log(`テキストが一致しなかった ${failed}件はスキップしました。`);
  }

  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
