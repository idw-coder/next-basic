// Next.js のファイルベースメタデータ規約で "twitter-image" が正式な名前。
// X（旧Twitter）も <meta name="twitter:image"> を引き続き使用しているため、この命名で正しく動作する。
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'ウェブエンジニア問題集 | HTML/CSS/React/Node.js 無料学習サイト';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '60px 80px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            maxWidth: '90%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: 700,
              }}
            >
              W
            </div>
            <div style={{ fontSize: '28px', color: '#6b7280', fontWeight: 500 }}>
              ウェブエンジニア問題集
            </div>
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#111827',
              textAlign: 'center',
              lineHeight: 1.3,
              marginBottom: '20px',
            }}
          >
            HTML / CSS / React / Node.js
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            4択クイズで学べる無料学習プラットフォーム
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
