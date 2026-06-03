# CCXT Fumadocs — containerized Next.js server (standalone output).
# Build: docker build -t ccxt-fumadocs website
# Run:   docker run -d --restart=always -p 127.0.0.1:3005:3005 --name ccxt-docs ccxt-fumadocs

FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN npm ci
# served under /v2 behind nginx; absolute site URL for sitemap/canonical
ENV NEXT_BASE_PATH=/v2 \
    NEXT_PUBLIC_SITE_URL=https://docs.ccxt.com \
    NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3005 \
    HOSTNAME=0.0.0.0
# standalone bundle (flat, thanks to outputFileTracingRoot) + static assets
# (no public/ dir in this app)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3005
CMD ["node", "server.js"]
