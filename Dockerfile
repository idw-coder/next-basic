FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_ADSENSE_CLIENT_ID
ARG NEXT_PUBLIC_ADSENSE_SLOT
ARG NEXT_PUBLIC_GOOGLE_AUTH_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
ARG NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package*.json ./
# データ移行スクリプト。サーバーにはリポジトリを配置していないため、
# 本番でスクリプトを流すにはイメージに同梱する必要がある。
# 実行例: docker compose -f docker-compose.prod.yml exec nextjs node scripts/<name>.mjs
COPY --from=builder /app/scripts ./scripts

RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
