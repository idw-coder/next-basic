interface YouTubeShortProps {
  /** ショートのURL（youtube.com/shorts/xxxx）の末尾にある動画ID */
  id: string;
  /** iframe の title（スクリーンリーダー向け）。動画のタイトルを入れる */
  title: string;
  caption?: string;
}

// 縦長（9:16）のYouTubeショートを埋め込む。
// youtube-nocookie.com は再生するまでCookieを置かない。allow は再生に要る機能だけに絞る。
export default function YouTubeShort({ id, title, caption }: YouTubeShortProps) {
  return (
    <figure style={{ maxWidth: '320px', margin: '0.75rem auto' }}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ width: '100%', aspectRatio: '9 / 16', border: 0, borderRadius: '12px' }}
      />
      {caption && (
        <figcaption className="mt-2 text-center text-[13px] text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
