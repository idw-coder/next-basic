'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Headphones, Pause, Play } from 'lucide-react';

interface AudioNarrationProps {
  src: string;
  title: string;
  // VOICEVOX の利用規約でクレジット表記が必要（例: "VOICEVOX:ずんだもん"）
  credit: string;
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// 章の音声解説カード。
// 見た目は自作だが、再生そのものは <audio> 要素に任せる。
// <audio> で再生していれば、タブ切り替え・アプリ切り替え・画面ロック中も再生が続く
// （Web Audio API で鳴らすとモバイルで止まりやすいので使わない）。
export default function AudioNarration({ src, title, credit }: AudioNarrationProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  // ロック画面・通知のボタンから操作できるよう Media Session に登録する
  const registerMediaSession = () => {
    const audio = audioRef.current;
    if (!audio || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = new MediaMetadata({
      title,
      artist: credit,
      artwork: [{ src: '/images/books/voicevox-link-bg.png', sizes: '1731x909', type: 'image/png' }],
    });
    ms.setActionHandler('play', () => audio.play());
    ms.setActionHandler('pause', () => audio.pause());
    ms.setActionHandler('seekbackward', () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
    ms.setActionHandler('seekforward', () => {
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
    });
    ms.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) audio.currentTime = details.seekTime;
    });
  };

  useEffect(() => {
    // ハイドレーション前に loadedmetadata が発火済みだと onLoadedMetadata を取りこぼすため、ここで読み直す
    const audio = audioRef.current;
    if (audio && audio.readyState >= 1) setDuration(audio.duration);

    // ページを離れたら Media Session の登録を外す
    return () => {
      if (!('mediaSession' in navigator)) return;
      navigator.mediaSession.metadata = null;
      for (const action of ['play', 'pause', 'seekbackward', 'seekforward', 'seekto'] as const) {
        navigator.mediaSession.setActionHandler(action, null);
      }
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <aside className="not-prose relative my-6 overflow-hidden rounded-xl border border-emerald-200 shadow-sm dark:border-emerald-800">
      <Image
        src="/images/books/voicevox-link-bg.png"
        alt=""
        fill
        sizes="(min-width: 768px) 720px, 100vw"
        className="object-cover object-center"
      />
      {/* 左側の文字を読みやすくするための白いグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10" />

      <div className="relative flex items-center gap-4 px-5 py-5 sm:py-6">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? '一時停止' : '再生'}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition hover:scale-105 hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          {playing ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
        </button>

        <div className="min-w-0 flex-1 text-slate-800">
          <p className="m-0 flex items-center gap-1 text-[11px] font-semibold tracking-wide text-emerald-700">
            <Headphones aria-hidden="true" className="h-3.5 w-3.5" />
            ずんだもんで聞く
          </p>
          <p className="m-0 mt-0.5 text-[15px] font-bold leading-snug">{title}</p>

          <div className="mt-2 flex max-w-xs items-center gap-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={(e) => {
                if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
              }}
              aria-label="再生位置"
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-emerald-500"
              style={{
                background: `linear-gradient(to right, rgb(16 185 129) ${progress}%, rgb(203 213 225) ${progress}%)`,
              }}
            />
            <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
              {formatTime(current)} / {formatTime(duration)}
            </span>
          </div>

          <p className="m-0 mt-1.5 text-[10px] text-slate-500">{credit}</p>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          registerMediaSession();
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </aside>
  );
}
