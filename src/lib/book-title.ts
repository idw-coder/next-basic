// 書名は「JavaScript入門 — 非同期処理からDOMまで」のように、emダッシュで副題を続ける形式が多い。
// 一覧カードのように幅が狭い場所では副題が途中で切れて読めないため、主題だけを取り出す。
export function getBookShortTitle(title: string) {
  const [main] = title.split(/\s*—\s*/);
  return main.trim() || title;
}
