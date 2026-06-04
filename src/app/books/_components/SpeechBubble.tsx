import Image from 'next/image';

interface SpeechBubbleProps {
  // 吹き出しの横に表示するキャラクター画像（public/images 配下）。省略可
  character?: string;
  // 話し手の名前（画像の下に小さく表示）。省略可
  name?: string;
  // 吹き出しを左右どちらに出すか。デフォルトは左
  side?: 'left' | 'right';
  children: React.ReactNode;
}

export default function SpeechBubble({
  character,
  name,
  side = 'left',
  children,
}: SpeechBubbleProps) {
  const isRight = side === 'right';

  return (
    <div
      className={`my-6 flex items-start gap-3 ${
        isRight ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {character && (
        <div className="flex shrink-0 flex-col items-center">
          <Image
            src={character}
            alt={name ?? ''}
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />
          {name && (
            <span className="mt-1 text-xs text-[var(--muted-foreground)]">
              {name}
            </span>
          )}
        </div>
      )}

      <div className="relative mt-2 max-w-prose">
        {/* 吹き出しのしっぽ（キャラ側を指す三角形） */}
        <span
          className={`absolute top-4 h-0 w-0 border-y-8 border-y-transparent ${
            isRight
              ? 'right-[-7px] border-l-8 border-l-slate-100 dark:border-l-slate-800'
              : 'left-[-7px] border-r-8 border-r-slate-100 dark:border-r-slate-800'
          }`}
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm leading-relaxed dark:border-slate-700 dark:bg-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}
