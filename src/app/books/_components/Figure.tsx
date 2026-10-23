import Image from 'next/image';

interface FigureProps {
  src: string;
  alt?: string;
  maxWidth?: string;
  /** 既定はキャラ画像向けの24vh。グラフなど縮めたくない図は "none" を渡す */
  maxHeight?: string;
  caption?: string;
}

export default function Figure({ src, alt, maxWidth, maxHeight = '24vh', caption }: FigureProps) {
  return (
    <figure style={{ maxWidth, margin: '0.75rem auto' }}>
      <Image
        src={src}
        alt={alt ?? ''}
        width={800}
        height={600}
        style={{ width: '100%', height: 'auto', maxHeight, objectFit: 'contain' }}
      />
      {caption && (
        <figcaption className="mt-2 text-center text-[13px] text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
