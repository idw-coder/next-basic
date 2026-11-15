import Image from 'next/image';

interface FigureProps {
  src: string;
  alt?: string;
  maxWidth?: string;
  /** 既定はキャラ画像向けの24vh。グラフなど縮めたくない図は "none" を渡す */
  maxHeight?: string;
  caption?: string;
  /** 元画像の幅。スクリーンショットなど4:3以外の画像で指定する */
  width?: number;
  /** 元画像の高さ。widthと組み合わせて表示比率を保つ */
  height?: number;
  /** 画像内で注目させる範囲。各値は元画像に対する百分率 */
  highlights?: Array<{
    top: number;
    left: number;
    width: number;
    height: number;
    /** 背景に合わせて調整する強調枠の色。既定は薄めの赤 */
    color?: string;
  }>;
}

export default function Figure({
  src,
  alt,
  maxWidth,
  maxHeight = '24vh',
  caption,
  width = 800,
  height = 600,
  highlights = [],
}: FigureProps) {
  return (
    <figure style={{ maxWidth, margin: '0.75rem auto' }}>
      <div className="relative">
        <Image
          src={src}
          alt={alt ?? ''}
          width={width}
          height={height}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            maxHeight,
            objectFit: 'contain',
          }}
        />
        {highlights.map((highlight, index) => (
          <span
            key={`${highlight.top}-${highlight.left}-${index}`}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-md border-[3px]"
            style={{
              top: `${highlight.top}%`,
              left: `${highlight.left}%`,
              width: `${highlight.width}%`,
              height: `${highlight.height}%`,
              borderColor: highlight.color ?? '#f87171',
            }}
          />
        ))}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[13px] text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
