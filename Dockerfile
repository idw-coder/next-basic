FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_ADSENSE_CLIENT_ID
ARG NEXT_PUBLIC_ADSENSE_SLOT
ARG NEXT_PUBLIC_GOOGLE_AUTH_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# .next/cache はビルド用のwebpack/SWCキャッシュ（約1GB）で実行時には不要。
# 本番ステージへコピーすると巨大レイヤーになりGHCRへのpushが失敗しやすくなるため、ここで削除する。
RUN npm run build && rm -rf .next/cache

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# server.js は HOSTNAME で待ち受ける。Docker は HOSTNAME にコンテナIDを入れるため、全インターフェースを明示する
ENV HOSTNAME=0.0.0.0

# output: 'standalone'（next.config.ts）で集めた実行用ファイルだけをコピーする。
# 以前は npm ci --only=production + npm start で、起動時に next.config.ts を読むための typescript がなく、
# Next.js がその場でインストールして1回目の起動が落ちていた（restart で2回目に動いていた）。
# standalone では設定はビルド時に読み込み済みのため、typescript も npm ci も要らない。
# static と public は standalone に含まれないので別にコピーする（Next.js 公式の with-docker と同じ）
# .next/cache（ISRなど）を実行時に書くので、node ユーザーの持ち物にする
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node

EXPOSE 3000

CMD ["node", "server.js"]
