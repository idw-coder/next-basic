'use client';

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

// ラベルを表示しない言語（言語指定なしのコードブロック）
const HIDDEN_LANGUAGES = new Set(['plaintext', 'text', 'txt']);

/**
 * MDXの <pre>（rehype-pretty-code出力）を置き換えるコードブロック。
 * 右上に言語ラベルとコピーボタンを重ねる。
 */
export default function CodeBlock(props: React.ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const language = (props as Record<string, unknown>)['data-language'];
  const label =
    typeof language === 'string' && !HIDDEN_LANGUAGES.has(language) ? language : null;

  const handleCopy = async () => {
    const text = preRef.current?.innerText ?? '';
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Clipboard APIが使えない環境（フォーカス外・非対応ブラウザ）のフォールバック
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        ok = document.execCommand('copy');
      } finally {
        textarea.remove();
      }
    }
    if (ok) {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group relative">
      <pre ref={preRef} {...props} />
      <div className="absolute right-2 top-2 flex items-center gap-1.5">
        {label && (
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] leading-none text-gray-300">
            {label}
          </span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'コピーしました' : 'コードをコピー'}
          className="rounded border border-white/10 bg-white/10 p-1.5 text-gray-300 opacity-60 transition-all hover:bg-white/20 hover:text-white hover:opacity-100 group-hover:opacity-100"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
