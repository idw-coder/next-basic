export interface ChapterLabelSource {
  order: number;
  chapterLabel?: string;
}

export function getChapterLabel(chapter: ChapterLabelSource) {
  return chapter.chapterLabel ?? `第${chapter.order}章`;
}

export function getChapterListLabel(chapter: ChapterLabelSource) {
  return chapter.chapterLabel ?? String(chapter.order).padStart(2, '0');
}
