#!/usr/bin/env node
/**
 * content/books の MDX を、devサーバーもVeliteも起動せずに検査する。
 *
 * 検査項目
 *   1. 強調の閉じ `**` が CommonMark の right-flanking を満たすか
 *      （満たさないと太字にならず `**` がそのまま表示される。AGENTS.md 参照）
 *   2. 本文に H1 がないか（H2 始まりが規約）
 *   3. `<Figure>` / `<SpeechBubble>` が指す画像が public/ に実在するか
 *   4. 内部リンク `/books/{book}/{chapter}` の参照先 MDX が実在するか
 *   5. Mermaid の双方向矢印 `<-->`（MDXがJSXと誤認する）
 *   6. 外部URLが 200 を返すか（--links 指定時のみ。ネットワークアクセスあり）
 *
 * 使い方
 *   node scripts/check-content.mjs                      # 全書籍、リンク疎通なし
 *   node scripts/check-content.mjs ai-agent-development # 特定の本だけ
 *   node scripts/check-content.mjs --links              # 外部URLの疎通も確認
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const BOOKS_DIR = 'content/books';
const PUBLIC_DIR = 'public';

const args = process.argv.slice(2);
const checkLinks = args.includes('--links');
const bookFilter = args.find((a) => !a.startsWith('--'));

/** コードブロックを除いた本文。規約はレンダリングされる本文にだけ適用する */
function stripCode(src) {
  return src.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

const isPunct = (ch) => /[\p{P}\p{S}]/u.test(ch);

/**
 * 閉じ `**` が right-flanking にならないケースを検出する。
 * 直前が約物で、直後が空白でも約物でもないと closer として解釈されない。
 * 例) `**文（statement）**と、` は太字にならない
 */
function findEmphasisIssues(body) {
  const issues = [];
  const re = /\*\*([^\n]+?)\*\*/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const inner = m[1];
    const next = body[m.index + m[0].length] ?? ' ';
    if (inner && isPunct(inner.at(-1)) && !/\s/.test(next) && !isPunct(next)) {
      issues.push(`${m[0].slice(0, 40)} … 直後="${next}"`);
    }
  }
  return issues;
}

function listChapters() {
  if (!existsSync(BOOKS_DIR)) return [];
  return readdirSync(BOOKS_DIR)
    .filter((b) => statSync(path.join(BOOKS_DIR, b)).isDirectory())
    .filter((b) => !bookFilter || b === bookFilter)
    .flatMap((book) =>
      readdirSync(path.join(BOOKS_DIR, book))
        .filter((f) => f.endsWith('.mdx'))
        .map((f) => ({ book, slug: f.replace(/\.mdx$/, ''), file: path.join(BOOKS_DIR, book, f) }))
    );
}

const chapters = listChapters();
if (chapters.length === 0) {
  console.error(`対象の章が見つかりません（${bookFilter ?? BOOKS_DIR}）`);
  process.exit(1);
}
const known = new Set(chapters.map((c) => `${c.book}/${c.slug}`));

const problems = [];
const urls = new Map(); // URL -> 参照している章

for (const { book, slug, file } of chapters) {
  const src = readFileSync(file, 'utf8');
  const body = stripCode(src.replace(/^---\n[\s\S]*?\n---\n/, ''));
  const at = (msg) => problems.push(`${book}/${slug}: ${msg}`);

  for (const hit of findEmphasisIssues(body)) at(`強調が閉じない  ${hit}`);
  for (const h1 of body.match(/^# .+$/gm) ?? []) at(`本文にH1がある  ${h1}`);
  // 以降はすべて body（コードブロック除去済み）を見る。
  // コード例の中のタグやパスは解説用のサンプルであって、実在する必要がない
  if (body.includes('<-->')) at('Mermaidに双方向矢印 <--> がある');

  for (const [, img] of body.matchAll(/(?:src|character)="(\/[^"]+)"/g)) {
    if (!existsSync(path.join(PUBLIC_DIR, img))) at(`画像が存在しない  ${img}`);
  }

  for (const [, href] of body.matchAll(/\]\((\/books\/[^)#]+)/g)) {
    const target = href.replace(/^\/books\//, '').replace(/\/$/, '');
    // 本のトップ（/books/xxx）は章一覧なのでディレクトリの存在で判定する
    const ok = target.includes('/')
      ? known.has(target)
      : existsSync(path.join(BOOKS_DIR, target));
    if (!ok) at(`内部リンクの参照先がない  /books/${target}`);
  }

  for (const [, url] of src.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    if (!urls.has(url)) urls.set(url, []);
    urls.get(url).push(`${book}/${slug}`);
  }
}

console.log(`検査対象: ${chapters.length}章 / 外部URL ${urls.size}件`);

if (checkLinks && urls.size > 0) {
  const results = await Promise.all(
    [...urls.keys()].map(async (url) => {
      try {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), 20000);
        // HEAD を拒否するサイトがあるため GET で確認する
        const res = await fetch(url, { redirect: 'follow', signal: ac.signal });
        clearTimeout(timer);
        return { url, status: res.status };
      } catch (e) {
        return { url, status: `ERR ${e.name}` };
      }
    })
  );
  for (const { url, status } of results) {
    if (status !== 200) problems.push(`${urls.get(url).join(', ')}: 外部URLが ${status}  ${url}`);
  }
} else if (urls.size > 0) {
  console.log('（外部URLの疎通は未確認。--links を付けると確認します）');
}

if (problems.length === 0) {
  console.log('問題なし');
} else {
  console.log(`\n${problems.length}件の問題:`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
