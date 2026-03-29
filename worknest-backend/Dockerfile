FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache curl \
  && addgroup -S nodejs \
  && adduser -S nodeuser -G nodejs

RUN mkdir -p /app/logs && chown -R nodeuser:nodejs /app/logs

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV PORT=5000

USER nodeuser
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:5000/health/live || exit 1

CMD ["node", "index.js"]
