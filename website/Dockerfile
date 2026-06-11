# CCXT Fumadocs — containerized Next.js server (standalone output).
# Build: docker build -t ccxt-fumadocs website
# Run:   docker run -d --restart=always -p 127.0.0.1:3005:3005 --name ccxt-docs ccxt-fumadocs

FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN npm ci
# served under /v2 behind nginx; absolute site URL for sitemap/canonical.
# NEXT_PUBLIC_AI_ENABLED shows the "Ask AI" button; the OPENROUTER_API_KEY is provided
# at RUNTIME (docker run -e ...), never baked into the image.
ENV NEXT_BASE_PATH=/v2 \
    NEXT_PUBLIC_SITE_URL=https://docs.ccxt.com \
    NEXT_PUBLIC_AI_ENABLED=true \
    NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3005 \
    HOSTNAME=0.0.0.0
# standalone bundle (flat, thanks to outputFileTracingRoot) + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# public/ holds the CCXT logo assets used by the homepage hero
COPY --from=builder /app/public ./public
EXPOSE 3005
CMD ["node", "server.js"]
