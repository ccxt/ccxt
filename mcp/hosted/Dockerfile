# syntax=docker/dockerfile:1.7
# The hosted CCXT MCP server. Build from the mcp/ directory (the shared code lives there):
#   docker build -f hosted/Dockerfile -t ccxt-mcp-hosted .
# or with compose from mcp/hosted: docker compose build
#
# Stage 1 installs the workspace and bundles everything into dist/server.mjs; stage 2 is
# that one file on a slim Node 22, as a non-root user, with nothing to write: it runs on a
# read-only root filesystem.
ARG NODE_IMAGE=node:22-bookworm-slim

FROM ${NODE_IMAGE} AS build
WORKDIR /src/mcp
# manifests first, so the dependency layer is cached until a lockfile changes
COPY package.json package-lock.json ./
COPY hosted/package.json hosted/
# A build machine behind a TLS-intercepting proxy can hand its CA in as a build secret
# (docker build --secret id=extra_ca,src=/path/ca.pem ...); it is never stored in a layer
RUN --mount=type=secret,id=extra_ca,required=false \
    if [ -f /run/secrets/extra_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; fi; \
    npm ci --ignore-scripts --no-audit --no-fund
COPY ts ts
COPY hosted hosted
ARG BUILD_ID=docker
RUN BUILD_ID=${BUILD_ID} node hosted/scripts/build.mjs

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080
WORKDIR /app
# the bundle is the whole application: no node_modules, no npm at run time
COPY --from=build --chown=root:root /src/mcp/hosted/dist/server.mjs /app/server.mjs
# the exchange reachability check (README: operations), same ccxt build as the server
COPY --from=build --chown=root:root /src/mcp/hosted/dist/check-exchanges.mjs /app/check-exchanges.mjs
# the image's unprivileged "node" user (uid 1000); the app owns nothing it could modify
USER node
EXPOSE 8080
STOPSIGNAL SIGTERM
# liveness only (the process answers HTTP); readiness (/readyz, markets warm) is for the
# deploy step and the reverse proxy, not a reason to restart the container
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 8080) + '/healthz').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "/app/server.mjs"]
