# Egress allowlist proxy. The allowlist is generated FROM CCXT's own exchange
# URLs at build time, so it permits exactly the exchange API hosts (+ OpenRouter
# for the AI assistant) and denies all other outbound traffic.

# Stage 1 — derive the allowlist from CCXT.
FROM node:24-bookworm-slim AS allowlist
WORKDIR /gen
ARG CCXT_VERSION=4.5.56
RUN npm init -y >/dev/null 2>&1 && npm i --no-audit --no-fund "ccxt@${CCXT_VERSION}" >/dev/null 2>&1
COPY generate-allowlist.mjs .
RUN node generate-allowlist.mjs > allowlist.txt && echo "allowlist rules: $(wc -l < allowlist.txt)"

# Stage 2 — squid with the baked allowlist.
FROM ubuntu/squid:latest
COPY squid.conf /etc/squid/squid.conf
COPY --from=allowlist /gen/allowlist.txt /etc/squid/allowlist.txt
EXPOSE 3128
