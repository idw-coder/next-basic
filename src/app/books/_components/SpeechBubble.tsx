import Image from 'next/image';

interface SpeechBubbleProps {
  character?: string;
  name?: string;
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
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
          />
          {name && (
            <span className="mt-1 text-[11px] font-medium text-muted-foreground">
              {name}
            </span>
          )}
        </div>
      )}

      <div className="relative mt-2 max-w-prose">
        <span
          className={`absolute top-4 h-0 w-0 border-y-8 border-y-transparent ${
            isRight
              ? 'right-[-7px] border-l-8 border-l-blue-50 dark:border-l-slate-800'
              : 'left-[-7px] border-r-8 border-r-blue-50 dark:border-r-slate-800'
          }`}
        />
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3.5 py-2 text-[13px] leading-relaxed shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}
