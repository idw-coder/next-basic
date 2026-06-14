import Image from 'next/image';

interface FigureProps {
  src: string;
  alt?: string;
  maxWidth?: string;
  caption?: string;
}

export default function Figure({ src, alt, maxWidth, caption }: FigureProps) {
  return (
    <figure style={{ maxWidth, margin: '1.5rem auto' }}>
      <Image
        src={src}
        alt={alt ?? ''}
        width={800}
        height={600}
        style={{ width: '100%', height: 'auto', maxHeight: '40vh', objectFit: 'contain' }}
      />
      {caption && (
        <figcaption
          style={{
            fontSize: '0.875rem',
            color: 'var(--muted-foreground)',
            marginTop: '0.5rem',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
