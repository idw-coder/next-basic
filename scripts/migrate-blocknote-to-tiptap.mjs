/**
 * 解説(explanation)に残っているBlockNote形式のJSONをtiptap形式に変換する一度きりのスクリプト。
 *
 * 管理画面のエディタをBlockNote→tiptapへ移行した際に既存データを変換しなかったため、
 * 旧形式のまま残っている行がある。表示側の互換コードを削除できるようにするための移行。
 *
 *   監査のみ: node scripts/migrate-blocknote-to-tiptap.mjs
 *   実行:     node scripts/migrate-blocknote-to-tiptap.mjs --apply
 *
 * 安全側に倒すため、未知のブロック/インライン種別を含む行、
 * テキストまたはURLが変換前後で一致しない行は --apply でもスキップする。
 */
import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        // 環境変数が既にあればそちらを優先（本番はdocker runで直接渡す）
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    } catch {
      /* ファイルが無ければ環境変数をそのまま使う */
    }
  }
}

const KNOWN_BLOCKS = new Set([
  'paragraph',
  'heading',
  'bulletListItem',
  'numberedListItem',
  'checkListItem',
  'codeBlock',
  'quote',
]);
const KNOWN_INLINE = new Set(['text', 'link']);

/** 変換中に遭遇した未対応の種別を記録する */
function createReport() {
  return { unknownBlocks: new Map(), unknownInline: new Map(), hasChildren: false };
}

function bump(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function marksOf(styles) {
  const marks = [];
  if (!styles) return marks;
  if (styles.bold) marks.push({ type: 'bold' });
  if (styles.italic) marks.push({ type: 'italic' });
  if (styles.code) marks.push({ type: 'code' });
  if (styles.strikethrough) marks.push({ type: 'strike' });
  return marks;
}

function convertInline(content, report) {
  if (!Array.isArray(content)) return [];
  const out = [];
  for (const item of content) {
    if (!item || typeof item !== 'object') continue;
    if (item.type === 'text') {
      if (!item.text) continue;
      const node = { type: 'text', text: item.text };
      const marks = marksOf(item.styles);
      if (marks.length) node.marks = marks;
      out.push(node);
    } else if (item.type === 'link') {
      // リンクは text + linkマーク に変換する。StarterKitがextension-linkを含むため表示可能。
      const href = item.href ?? '';
      const inner = Array.isArray(item.content) ? item.content : [];
      const label = inner.map((c) => c.text ?? '').join('') || href;
      const node = { type: 'text', text: label, marks: [{ type: 'link', attrs: { href } }] };
      const extra = marksOf(inner[0]?.styles);
      if (extra.length) node.marks.push(...extra);
      // URLは marks.attrs.href に残る。教科書カードの抽出は解説の生JSON文字列を
      // 正規表現でスキャンするため、これでURLは失われない（本文への併記は不要）。
      out.push(node);
    } else {
      bump(report.unknownInline, item.type ?? 'undefined');
    }
  }
  return out;
}

function convertBlockNoteToTiptap(blocks, report) {
  const content = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (Array.isArray(block.children) && block.children.length > 0) report.hasChildren = true;
    if (!KNOWN_BLOCKS.has(block.type)) bump(report.unknownBlocks, block.type ?? 'undefined');

    if (
      block.type === 'bulletListItem' ||
      block.type === 'numberedListItem' ||
      block.type === 'checkListItem'
    ) {
      const listType = block.type;
      const items = [];
      while (i < blocks.length && blocks[i].type === listType) {
        const inline = convertInline(blocks[i].content ?? [], report);
        items.push({
          type: 'listItem',
          content: [{ type: 'paragraph', ...(inline.length ? { content: inline } : {}) }],
        });
        i++;
      }
      // checkListItem はStarterKitに対応ノードが無いので箇条書きに寄せる
      content.push({
        type: listType === 'numberedListItem' ? 'orderedList' : 'bulletList',
        content: items,
      });
      continue;
    }

    const inline = convertInline(block.content ?? [], report);
    if (block.type === 'heading') {
      content.push({
        type: 'heading',
        attrs: { level: block.props?.level ?? 1 },
        ...(inline.length ? { content: inline } : {}),
      });
    } else if (block.type === 'codeBlock') {
      const text = (Array.isArray(block.content) ? block.content : [])
        .map((c) => c.text ?? '')
        .join('');
      content.push({ type: 'codeBlock', ...(text ? { content: [{ type: 'text', text }] } : {}) });
    } else if (block.type === 'quote') {
      content.push({
        type: 'blockquote',
        content: [{ type: 'paragraph', ...(inline.length ? { content: inline } : {}) }],
      });
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

/** 検証用: BlockNote側の可視テキスト（リンクのラベルも含む） */
function blockNoteText(blocks) {
  const out = [];
  const walk = (items) => {
    for (const c of items ?? []) {
      if (typeof c?.text === 'string') out.push(c.text);
      if (Array.isArray(c?.content)) walk(c.content);
    }
  };
  for (const b of blocks) {
    if (Array.isArray(b.content)) walk(b.content);
    if (Array.isArray(b.children)) for (const ch of b.children) if (Array.isArray(ch.content)) walk(ch.content);
  }
  return out.join('');
}

/** 検証用: tiptap側の可視テキスト */
function tiptapText(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return node.text ?? '';
  if (Array.isArray(node.content)) return node.content.map(tiptapText).join('');
  return '';
}

// 教科書リンクの抽出は解説の生文字列に対して行われるため、URLの残存を独立に検証する
const BOOK_URL_RE = /(?:https?:\/\/[^\s"'()<>\]]*?)?\/books\/([a-z0-9][a-z0-9-]*)\/([a-z0-9][a-z0-9-]*)(#[^\s"'()<>\]]*)?/g;

function bookUrls(text) {
  return [...String(text).matchAll(BOOK_URL_RE)].map((m) => m[0]).sort();
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

  console.log(`候補 ${rows.length}件 / BlockNoteと判定 ${targets.length}件\n`);

  const allUnknownBlocks = new Map();
  const allUnknownInline = new Map();
  const skipped = [];
  let converted = 0;

  for (const row of targets) {
    const blocks = JSON.parse(row.explanation);
    const report = createReport();
    const doc = convertBlockNoteToTiptap(blocks, report);
    const json = JSON.stringify(doc);

    const textOk = blockNoteText(blocks) === tiptapText(doc);
    const urlsBefore = bookUrls(row.explanation);
    const urlsAfter = bookUrls(json);
    const urlOk = urlsBefore.join('|') === urlsAfter.join('|');
    const unknownOk = report.unknownBlocks.size === 0 && report.unknownInline.size === 0;
    const ok = textOk && urlOk && unknownOk && !report.hasChildren;

    for (const [k, v] of report.unknownBlocks) allUnknownBlocks.set(k, (allUnknownBlocks.get(k) ?? 0) + v);
    for (const [k, v] of report.unknownInline) allUnknownInline.set(k, (allUnknownInline.get(k) ?? 0) + v);

    if (!ok) {
      const why = [
        !textOk && 'テキスト不一致',
        !urlOk && `URL不一致(${urlsBefore.length}→${urlsAfter.length})`,
        report.unknownBlocks.size > 0 && `未知ブロック:${[...report.unknownBlocks.keys()].join(',')}`,
        report.unknownInline.size > 0 && `未知インライン:${[...report.unknownInline.keys()].join(',')}`,
        report.hasChildren && 'ネスト(children)あり',
      ].filter(Boolean);
      skipped.push({ id: row.id, slug: row.slug, why });
      console.log(`SKIP id=${row.id} ${row.slug} — ${why.join(' / ')}`);
      continue;
    }

    converted++;
    if (apply) {
      await conn.execute('UPDATE quiz SET explanation = ? WHERE id = ?', [json, row.id]);
      console.log(`OK   id=${row.id} ${row.slug} — 更新 (${row.explanation.length}→${json.length}b, リンク${urlsAfter.length})`);
    } else {
      console.log(`OK   id=${row.id} ${row.slug} — 変換可 (${row.explanation.length}→${json.length}b, リンク${urlsAfter.length})`);
    }
  }

  console.log(`\n--- 集計 ---`);
  console.log(`変換${apply ? '済' : '可'}: ${converted}件 / スキップ: ${skipped.length}件`);
  if (allUnknownBlocks.size) console.log(`未知ブロック種別:`, Object.fromEntries(allUnknownBlocks));
  if (allUnknownInline.size) console.log(`未知インライン種別:`, Object.fromEntries(allUnknownInline));
  if (skipped.length) {
    console.log(`\nスキップした行は手動対応が必要です:`);
    for (const s of skipped) console.log(`  id=${s.id} ${s.slug} — ${s.why.join(' / ')}`);
  }
  if (!apply) console.log(`\n監査のみです。実行するには --apply を付けてください。`);

  await conn.end();
}

// 変換ロジックを検証できるようexportし、直接実行されたときだけDBに接続する
export { convertBlockNoteToTiptap, createReport, blockNoteText, tiptapText, bookUrls };

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
