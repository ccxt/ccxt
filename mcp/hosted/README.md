# Hosted CCXT MCP server

The public, anonymous, read-only CCXT MCP server served at **`https://docs.ccxt.com/mcp`**. Anyone can add that URL to Claude, ChatGPT, Claude Code or Codex. There is nothing to install and no API key to provide.

- **Phase 1 (this code):** public market data from an exchange allowlist, plus interactive views (MCP Apps) in the chat. Account tools are listed, but they answer `ACCOUNT_REQUIRED` with a pointer to the [local server](https://docs.ccxt.com/docs/mcp).
- **Phase 2 (designed, not built):** sign-in and server-stored exchange keys. See [DESIGN.md](DESIGN.md).

It shares its tools with the local stdio server in `mcp/` (npm `ccxt-mcp`). It adds a stricter tool profile and a multi-tenant runtime around them. `DESIGN.md` is the contract.

<!-- Everything above "## Telemetry" belongs to the hosted runtime; the Telemetry section is maintained with src/telemetry/. -->

## What it serves

| Group | Tools |
|---|---|
| Market data | `list_exchanges`, `describe_exchange`, `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades` |
| Views | `show_chart`, `show_orderbook`, `show_tickers` (MCP Apps views, versioned `ui://ccxt/<view>.<hash>.html`), and `live_update`, the app-only tool a view on screen polls to stay live (hidden from the model where the host supports it) |
| Account (stubs) | `get_balance`, `get_orders`, `get_positions`, `get_my_trades`. They return `ACCOUNT_REQUIRED` and never call an exchange. |

- **The list is pinned** by `test/profile.test.ts`, against the table in `DESIGN.md`. A tool added to the local server never appears here unless that list changes.
- **No `params`, `reload` or `prediction` arguments.** No hosted tool takes free-form exchange parameters. The schemas are strict, so a stray `params` gets a validation error that names the key instead of being dropped silently.
- **No prediction markets** on the default allowlist. Their tools (`search_events`, keyless by-address reads) are not part of the hosted profile, and both directories scrutinise speculation offerings.

## Run it locally

Node 22.22 or later. The hosted server is an npm workspace of `mcp/`, so install from there:

```bash
cd mcp
npm ci
npm run build -w hosted              # -> hosted/dist/server.mjs (+ dist/check-exchanges.mjs)
cd hosted
EXCHANGES=kraken,coinbase,okx PORT=8080 node dist/server.mjs
curl -s localhost:8080/readyz        # 200 once the markets are loaded
claude mcp add --transport http ccxt-local http://127.0.0.1:8080/mcp
```

- **Without building:** `npm run dev` runs `src/main.ts` under tsx.
- **Behind a proxy:** set `NODE_USE_ENV_PROXY=1` so Node's fetch honours `HTTPS_PROXY`.
- **Tests:** `npm test`, offline (a fake exchange module, real HTTP on loopback).
- **Smoke test of the bundle:** `npm run smoke`, using the official MCP client in both protocol eras. Add `-- --live` to call real exchanges (kraken, coinbase and okx by default, set `EXCHANGES` to change them).

## Configuration

All configuration comes from environment variables. [`.env.example`](.env.example) lists every variable with its default. The ones that matter most:

| Variable | Default | Meaning |
|---|---|---|
| `PUBLIC_BASE_URL`, `MCP_PATH` | `https://docs.ccxt.com`, `/mcp` | Together they form the canonical MCP URL. It is also the phase-2 OAuth resource, the input of Claude's `ui.domain` hash and the registry URL: never change it once published. |
| `HOST`, `PORT` | `127.0.0.1`, `8080` | Listening address. Compose sets `0.0.0.0` inside the container. |
| `HOST_PORT` | `8080` | Compose only: the loopback port on the machine the container is published on. nginx's upstream must match. |
| `ALLOWED_HOSTS` | public host + `localhost`, `127.0.0.1`, `[::1]` | `Host` header allowlist. Any other host gets 403 (DNS-rebinding protection). |
| `TRUSTED_PROXY` | `none` | Where the client IP comes from: `none` (socket peer), `nginx-x-real-ip`, or a hop count `N` for `X-Forwarded-For` (read N entries from the right; the leftmost is never used). Headers are believed only from a loopback or private peer. Compose sets `nginx-x-real-ip`. |
| `CORS_ALLOWED_ORIGINS` | empty | Browser origins allowed to read responses. Empty means no CORS headers: MCP hosts call from their servers, and the `Origin` header is not used to reject anyone. |
| `EXCHANGES` | `binance,bitfinex,bitget,bitstamp,bybit,coinbase,gate,kraken,kucoin,okx` | The allowlist. Run the reachability check (below) on the machine first. |
| `MARKETS_REFRESH_MINUTES` | `360` | Background markets refresh, with ±10% jitter. Markets live in memory only. |
| `READY_GRACE_MS` | `120000` | `/readyz` waits for every exchange. After this long, one warm exchange is enough, and cold ones answer `EXCHANGE_WARMING`. |
| `REQUEST_DEADLINE_MS` | `20000` | Per-call deadline. Waiting work ends with a `TIMEOUT` tool error, never a hung socket. |
| `MAX_CONCURRENT_REQUESTS` | `64` | Global cap. Beyond it: 503 + `Retry-After`. |
| `MAX_SUBSCRIPTIONS`, `MAX_LISTENS_PER_CLIENT` | `200`, `4` | Open `subscriptions/listen` streams, in total and per client. Each holds a socket here and two at nginx for as long as the client keeps it; this server never publishes list changes. Past the per-client cap: 429. |
| `REQUEST_READ_TIMEOUT_MS` | `15000` | Time to receive a whole request (headers at most 10 s). A client trickling its body is cut with 408 instead of holding a connection. |
| `UPSTREAM_CONCURRENCY_PER_EXCHANGE`, `UPSTREAM_QUEUE_PER_EXCHANGE` | `4`, `16` | Requests in flight to, and waiting for, one exchange. Beyond that: `RATE_LIMITED` + `retryAfterSeconds`. |
| `MAX_UPSTREAM_CALLS_PER_TOOL` | `10` | Cache misses one tool call may cause, which bounds the per-symbol fan-out. |
| `BREAKER_*` | 3 failures / 60 s, 30 s cooldown (max 10 min) | Circuit breaker per exchange. |
| `RATE_LIMIT_PER_MINUTE`, `RATE_LIMIT_BURST` | `60`, `30` | Per-client token bucket (an IPv4 address, or an IPv6 /64). A tool call costs 1; list and read requests cost 0.25. |
| `HOST_RATE_LIMIT_PER_MINUTE`, `HOST_RATE_LIMIT_BURST` | `3000`, `600` | Budget for Anthropic's and OpenAI's egress addresses, which all their users share. |
| `LIVE_STREAMS` | `on` | Live views: `on` lets the hub open shared ccxt.pro streams; `off` answers every `live_update` poll from REST (through the same guard, cache and limits). |
| `LIVE_IDLE_MS` | `60000` | A stream no view polled for this long is closed (unWatch where ccxt supports it; the WebSocket instance closes with its last stream). At least 45000 (the slowest poll, 30 s, plus a margin); less fails at start-up. |
| `LIVE_MAX_STREAMS`, `LIVE_MAX_STREAMS_PER_EXCHANGE` | `200`, `50` | Stream caps (one stream per exchange, market type, channel, symbol and timeframe), abandoned subscriptions included (below). At a cap, polls are served from REST and told to poll less often. The per-exchange cap may not exceed the global one. |
| `LIVE_MAX_STREAMS_PER_CLIENT`, `LIVE_STREAM_OPENS_PER_CLIENT_PER_MINUTE` | `30`, `20` | Per rate-limit identity (a ChatGPT user, an IP address; not a host egress address): streams it keeps alive, and stream opens per minute. Past them its polls are answered from existing streams or REST and renew nothing. 0 = no per-client limit. |
| `LIVE_MAX_ABANDONED_PER_INSTANCE` | `8` | Channels without unWatch (kraken, coinbase, bitget, gate for some channels) cannot unsubscribe one stream: a closed one stays subscribed on its socket. After this many, the WebSocket instance is recycled (live streams move to a new one, the old one closes). |
| `LIVE_STREAM_OPENS_PER_MINUTE` | `30` | Stream opens per exchange per minute; also refused while the exchange's breaker is not closed. |
| `LIVE_WS_FAILURE_THRESHOLD`, `LIVE_WS_COOLDOWN_MS` | `5`, `300000` | That many stream failures on one exchange within two minutes pause its streams for the cooldown; polls go to REST meanwhile. |
| `LIVE_STALE_MS` | `30000` | Stream data older than this is not served (REST is tried first). |
| `LIVE_POLL_STREAM_MS`, `LIVE_POLL_REST_MS` | `2000`, `5000` | The `nextPollMs` a view is given when served from a stream, or from REST/cache (never below the cache TTL; longer at a cap or under load; always 1–30 s). Each must be 1000–30000; anything else fails at start-up. |
| `LIVE_RATE_LIMIT_PER_MINUTE`, `LIVE_RATE_LIMIT_BURST` | `120`, `30` | Per-client bucket for `live_update` only, separate from the tool-call budget: four views at the 2 s stream cadence. Past it a poll gets the tool error `RATE_LIMITED` with `retryAfterSeconds` (HTTP 200), never a 429 that would stop the view. |
| `LIVE_HOST_RATE_LIMIT_PER_MINUTE`, `LIVE_HOST_RATE_LIMIT_BURST` | `12000`, `1200` | The same for a host egress address (all Claude users share Anthropic's). |
| `LIVE_MAX_CONCURRENT` | `32` | `live_update` calls in flight at once, beside `MAX_CONCURRENT_REQUESTS` (polls cannot take the tool calls' slots). |
| `LIVE_STATS_INTERVAL_MS` | `60000` | Period of the `live hub stats` log line (0 = never). Its counters are totals since start; `*_delta` fields are per interval. |
| `UI_WHEN_UNKNOWN` | `attach` | What a `show_*` result does when the client did not state its capabilities: attach the view payload, or omit it. |
| `UI_DOMAIN_OPENAI` | the `PUBLIC_BASE_URL` origin | ChatGPT's dedicated origin for the views (`_meta.ui.domain` on `resources/read`), sent only to requests from OpenAI's egress ranges. `off` sends none. |
| `CCXT_MCP_UI` | `auto` | View mode for `show_*` results: `auto` (follow the client's stated capabilities, else `UI_WHEN_UNKNOWN`), `always` (send the dataset to every client, reported as `displayed`) or `off`. Any other value falls back to `auto`. |
| `OPENAI_APPS_CHALLENGE` | unset | Token served at `/.well-known/openai-apps-challenge`. |
| `DRAIN_TIMEOUT_MS` | `25000` | How long in-flight calls get after SIGTERM. |

## How it protects the exchanges

Every caller shares this server's IP addresses at each exchange. One abusive client must not be able to get those addresses throttled or banned for everyone.

- **Allowlist and markets.**
  - Markets are loaded at start-up, a few exchanges at a time, and kept in memory only.
  - They are refreshed in the background. A caller can never load or reload markets.
  - There is one ccxt instance, and so one throttler, per (exchange, market type). Instances for other market types borrow the default instance's markets instead of loading their own.
- **Guarded calls** (`src/guard/`). The tools reach an exchange only through five read methods: tickers, order book, OHLCV, trades and markets. Every other network method on the instance is refused. Each call is answered in this order:
  1. From a short response cache: 2 s for tickers and trades, 1 s for order books, a tenth of the candle length for OHLCV (2–60 s).
  2. By joining an identical call already in flight.
  3. Only then by a new upstream request, which is subject to the exchange's circuit breaker, the call's upstream budget and a bounded queue.
- **Failures are fast and say what to do.**
  - A full queue or a spent budget answers `RATE_LIMITED`; an open breaker answers `EXCHANGE_UNAVAILABLE`. Both carry `retryAfterSeconds`.
  - Nothing is ever retried automatically, least of all a rate-limit answer.
  - Queued work whose caller disconnected or passed its deadline is dropped before it reaches the exchange.
  - A symbol must be one of the exchange's own markets and a timeframe one of its own timeframes, checked as own properties before the guard: `__proto__`, `constructor` and similar names are `BAD_SYMBOL` / `BAD_TIMEFRAME` and never reach an exchange (ccxt's plain property lookups would accept them).
- **Circuit breaker.** It opens after three `DDoSProtection`, `RateLimitExceeded` or `ExchangeNotAvailable` errors, or HTTP 429 responses, within a minute. A 404 does not count: it is about the request, not about our addresses. It opens at once on 418 (IP ban) or 451 (geo-block). After the cooldown it lets one probe through.
- **Per-client limits.**
  - Clients are keyed by IP, taken from the trusted proxy header: an IPv4 address, or an IPv6 /64 (one subscriber normally holds a whole /64 and could otherwise rotate addresses for fresh budgets).
  - `_meta["openai/subject"]` is the key instead, but only on requests from OpenAI's published connector ranges. From anywhere else it is just a string the caller chose.
  - Anthropic's (`160.79.104.0/21`, `153.61.208.0/20`) and OpenAI's ranges get the higher host budget.
  - The OpenAI list is a dated snapshot in `src/data/openai-egress.ts`. Refresh it with `node scripts/refresh-egress-ranges.mjs` and review the diff.
- **Live views** (`live_update`, see DESIGN.md "Live views"). Views on screen poll every few seconds; one shared ccxt.pro stream per market answers all of them, so a poll served from a stream sends nothing to the exchange. Stream instances are public (no keys) and separate from the REST instances, and get the warm markets instead of loading their own. A stream open is refused while the breaker is not closed and is rate-limited per exchange; stream errors that mean throttling feed the breaker. Whatever no stream can serve goes through the guarded REST path above, never around it. A view polls at the `nextPollMs` the server returns: 2 s from a stream (shown as "Live"), 5 s or more from REST or cache ("Delayed"), stretched under load or near the stream caps; it pauses while hidden, off screen or idle for 10 minutes. In hosts that cannot call tools from a view, the views stay static.
- **HTTP limits.**
  - Bodies are capped at 256 KB (413) and JSON nesting at 32 levels.
  - JSON-RPC batches are rejected, so every limit counts calls, not HTTP requests.
  - GET and DELETE answer 405. Answers carry `X-Request-Id`, `nosniff` and `no-store`.

## Endpoints

| Path | Proxied by nginx | Purpose |
|---|---|---|
| `POST /mcp` | yes | MCP over stateless Streamable HTTP: 2026-07-28 clients and 2025-era clients that still send `initialize`. A new `McpServer` is built for each request. No sessions. |
| `/.well-known/openai-apps-challenge` | yes | OpenAI domain verification. 404 when unset. |
| `/.well-known/oauth-protected-resource/mcp` | yes | Reserved for phase 2. Returns 404 today, which tells clients the server is authless. |
| `GET /healthz` | no | Liveness. Used by the container health check. 503 if `Object.prototype` gained a property since start-up (a polluted process answers everything wrongly and needs a restart). |
| `GET /readyz` | no | 200 once the allowlist is warm. Reports each exchange's state, market count, breaker and last error, plus telemetry status. 503 while warming or draining. |

**Phase 2 seam.** `verifyBearer()` in `src/app.ts` is the one place a bearer token would become `AuthInfo`. In phase 1 it returns `undefined`, and an `Authorization` header is ignored. Everything downstream, from the factory and `ctx.http.authInfo` to the request scope, already carries it.

## Deploy (docs.ccxt.com machine, GitHub Actions, Docker Compose, nginx)

Deploys are automated by [`.github/workflows/deploy-mcp-hosted.yml`](../../.github/workflows/deploy-mcp-hosted.yml). It runs after the `MCP` workflow passes on master, and on demand.

- It builds the image on the self-hosted `deploy` runner and pushes it to `ghcr.io/ccxt/ccxt-mcp-hosted:<short sha>`.
- It copies this release's `docker-compose.yml` and `deploy/` to `/srv/ccxt-mcp-hosted/releases/<short sha>` on the machine, then runs [`deploy/remote-deploy.sh`](deploy/remote-deploy.sh) there over SSH.
- It reaches the machine with the same repository secrets as the docs and playground deploys: `DOCS_DEPLOY_SSH_KEY`, `DOCS_DEPLOY_KNOWN_HOSTS`, `DOCS_DEPLOY_HOST`, `DOCS_DEPLOY_USER`. Nothing else is stored in GitHub.
- Finally it checks that `https://docs.ccxt.com/mcp` reports the new build as its `serverInfo.version`.

`remote-deploy.sh` switches without downtime, like the docs site's own deploy:

1. It starts the new build as a second compose project (`ccxt-mcp-<port>`) on the spare loopback port, 8098 or 8099.
2. It smoke-tests it there: `/readyz` turns 200, then MCP `initialize`, `tools/list` and one tool call.
3. It installs the release's nginx files with the upstream pointing at the new port, runs `nginx -t` and reloads gracefully.
4. It stops the old container, which drains its in-flight calls on SIGTERM.

A failed smoke test removes the new container. A failed `nginx -t` restores the previous nginx files. In both cases the live build is untouched.

**Rollback:** run the workflow by hand with `build_id` set to an earlier short sha. It redeploys that image from GHCR without building, using the current release's compose and nginx files. The machine keeps the last 5 release directories and 3 images.

**One-time setup on the machine** (as root; Docker with the compose plugin, `apt-get install docker-compose-v2` on Ubuntu; nginx already serves docs.ccxt.com):

```bash
install -d -m 700 /srv/ccxt-mcp-hosted
# the server's secrets and settings; never in git. Start from .env.example in this folder.
# Set EXCHANGES, POSTHOG_PROJECT_TOKEN, CLIENT_HASH_SECRET (openssl rand -hex 32) and, for
# the OpenAI directory, OPENAI_APPS_CHALLENGE. BUILD_ID and HOST_PORT are managed by the deploy.
# Compose expands $NAME in unquoted .env values: single-quote any value that contains a '$'
install -m 600 /dev/null /srv/ccxt-mcp-hosted/.env && "${EDITOR:-vi}" /srv/ccxt-mcp-hosted/.env
# once: let the docs site's HTTPS server block include the MCP locations, next to its own
#   include snippets/ccxt-docs-locations.conf;
#   include snippets/ccxt-mcp-locations.conf;
# in /etc/nginx/sites-available/docs (the deploy installs the snippet and the http{} part)
```

Before the first deploy, check which exchanges the machine can reach and drop the ones it cannot from `EXCHANGES`:

```bash
docker run --rm --env-file /srv/ccxt-mcp-hosted/.env ghcr.io/ccxt/ccxt-mcp-hosted:<short sha> node /app/check-exchanges.mjs
```

**By hand** (the same script, e.g. for a build you made on the machine with `docker compose build`, tagged `ccxt-mcp-hosted:<id>`):

```bash
IMAGE=ccxt-mcp-hosted BUILD_ID=<id> RELEASE_DIR=/srv/ccxt-mcp-hosted/releases/<id> bash /srv/ccxt-mcp-hosted/releases/<id>/deploy/remote-deploy.sh
```

`BUILD_ID` and the live port are recorded in `/srv/ccxt-mcp-hosted/.env` and `active-port`, and `current` links to the live release.

**nginx** ([`deploy/nginx/`](deploy/nginx/)):

- [`ccxt-mcp-http.conf`](deploy/nginx/ccxt-mcp-http.conf) goes in the `http {}` context (`/etc/nginx/conf.d/`): the upstream, the per-address `limit_conn` / `limit_req` zones (Anthropic's and OpenAI's egress ranges exempt: generated by `scripts/refresh-egress-ranges.mjs`, checked by `test/nginx.test.ts`), and the `ccxt_mcp` log format.
- [`ccxt-mcp-locations.conf`](deploy/nginx/ccxt-mcp-locations.conf) goes inside the existing `server {}` for docs.ccxt.com (`include /etc/nginx/snippets/ccxt-mcp-locations.conf;`). Add `client_header_timeout 10s;` to that server block too.
- The deploy installs both files, with the upstream port set to the live color, and runs `nginx -t` before every reload. `test/nginx.test.ts` loads both files in a real nginx and exercises them (CI installs nginx for it).
- It proxies only `/mcp` and the two reserved `/.well-known` paths, with these settings:
  - responses unbuffered (`proxy_buffering off`, for SSE), requests buffered (`proxy_request_buffering on`, `client_body_timeout 10s`): a client trickling a body holds an nginx connection, never one of the app's;
  - at most 20 open connections and 10 requests/s (burst 40) per client address, 429 beyond — except from the Claude and ChatGPT egress ranges, which carry every user of those hosts and are budgeted by the app per host (or per ChatGPT user);
  - a 300 s read timeout, `Host` passed through, `X-Real-IP` overwritten with `$remote_addr`, a 256 KB body cap;
  - its own access log, `/var/log/nginx/ccxt-mcp.log`, in a format without the client address (the privacy text promises no IP addresses in logs); `$request_id` joins it to the app's lines;
  - if the upstream is down, a JSON-RPC 503 with `Retry-After: 5` instead of nginx's HTML 502.
- **Capacity.** Every `subscriptions/listen` stream holds two nginx connections for as long as the client keeps it, next to the docs site's traffic. Keep `worker_processes` × `worker_connections` comfortably above 2 × `MAX_SUBSCRIPTIONS` plus the docs load: e.g. `worker_connections 4096;` and `worker_rlimit_nofile 8192;` in `nginx.conf` (Ubuntu's stock 768 per worker is too small).
- nginx's error log can still record a client address for a failed connection; rotate it accordingly.

**Check from outside:**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://docs.ccxt.com/mcp        # 405 (GET)
claude mcp add --transport http ccxt https://docs.ccxt.com/mcp && claude mcp list
```

**The container** (`docker-compose.yml`):

- read-only root filesystem, no tmpfs needed;
- runs as the non-root `node` user, with all capabilities dropped and `no-new-privileges`;
- 1.5 GB memory limit, `NODE_OPTIONS=--max-old-space-size=1024`;
- `restart: unless-stopped`, plus one `autoheal` container (compose project `ccxt-mcp-autoheal`), which restarts it when its health check fails (Docker itself never acts on an unhealthy status);
- port bound to loopback only: `127.0.0.1:${HOST_PORT:-8080}`. On the docs.ccxt.com machine the deploy alternates between 8098 and 8099 (8080 there belongs to the order router); `cat /srv/ccxt-mcp-hosted/active-port` shows the live one.

The image is the single bundle on `node:22-bookworm-slim`, with no `node_modules` and no package managers (npm, npx, corepack and yarn are removed).

## Upgrading

Merging to master is the upgrade: the workflow above builds and switches to the new build.

- **The old container drains.** On SIGTERM it stops accepting MCP requests (503 + `Retry-After: 5`, and `/readyz` reports `draining`), lets in-flight calls finish within `DRAIN_TIMEOUT_MS`, flushes telemetry and exits 0. `stop_grace_period` is 30 s. nginx has already moved to the new container by then, so callers see no gap.
- **Live views reconnect on their own.** A view's next `live_update` poll lands on the new container, which opens its own streams; the old one closes its streams when it exits.
- **Old images:** each is about 380 MB; the deploy keeps the last 3.
- **New ccxt version:** `npm update ccxt` in `mcp/`, commit the lockfile, and merge.
- **Changed views:** their URIs change by content hash on their own.

## Monitoring

Nothing in the container alerts anyone; an outage is otherwise reported by users. Set up:

- **An external uptime check** from outside the VM, every minute, alerting on anything but 200:

  ```bash
  curl -fsS -X POST https://docs.ccxt.com/mcp -H 'content-type: application/json' \
    -H 'accept: application/json, text/event-stream' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' >/dev/null
  ```

- **A readiness check on the VM** (cron, every minute): `curl -fsS http://127.0.0.1:$(cat /srv/ccxt-mcp-hosted/active-port)/readyz >/dev/null || <alert>`. It catches an allowlist that is entirely `failed` and a draining or polluted process.
- **Automatic restart** when the container health check fails: the `autoheal` service in `docker-compose.yml`. Without the Docker socket mount it needs, use a systemd timer that runs every minute: `[ "$(docker inspect -f '{{.State.Health.Status}}' ccxt-mcp-hosted-1)" = unhealthy ] && docker restart ccxt-mcp-hosted-1`.
- **PostHog log alerts** on `breaker_open`, `markets load failed` and `uncaught exception`, and on `/readyz` reporting `telemetry.analytics` as `error`.

## Operations

**Logs.** Each line is one JSON object on stdout (`docker compose logs -f hosted`), with:

- one `request` line per HTTP request, carrying `request_id`, method, tool, exchange, status, `error_code`, duration, cache outcome and protocol era;
- `markets loaded` / `refreshed` / `failed` lines;
- `breaker_open` warnings;
- `live hub stats` lines while views are live (streams per exchange, abandoned subscriptions, polls by source, failed polls by code, refused polls by reason, fallbacks; totals since start plus per-interval `*_delta` fields); `live_update` request lines are at `debug`, except failures that were not this server's own budget refusals (an exchange throttling this server stays at `warn`);
- `draining` / `drained` lines.

Lines are also mirrored to PostHog Logs when a token is set (see Telemetry). nginx's `$request_id` arrives as `X-Request-Id`, and the `ccxt_mcp` log format writes it to `/var/log/nginx/ccxt-mcp.log`, so nginx and app lines join on it. An incoming `X-Request-Id` is used only under the same rule as the client-IP headers (`TRUSTED_PROXY` set and a loopback or private peer); otherwise the server makes its own, because the id also becomes the analytics session id.

**Readiness.** `curl -s 127.0.0.1:$(cat /srv/ccxt-mcp-hosted/active-port)/readyz | jq`. Per exchange it shows:

- `state`: `cold`, `loading`, `warm` or `failed`;
- `markets`, `loadedAt` and the last `error`;
- `breaker`: `closed`, `open` or `half-open`.

**Exchange reachability.** `docker compose run --rm hosted node /app/check-exchanges.mjs [ids…]`:

- loads markets and fetches one BTC ticker per exchange, printing a table;
- exits 1 if any exchange fails.

Run it before launch, after moving the VM, and whenever an exchange's breaker keeps opening. An exchange that is unreachable from the machine comes off `EXCHANGES`; leaving it there means every caller gets an error. Example output from the development sandbox (binance and bybit are geo-blocked there):

```text
exchange  result  markets  loadMs  symbol    last      tickerMs  error
binance   FAIL    -        -       -         -         -         ExchangeNotAvailable: binance GET [url] 451 Unavailable For Legal Reasons …
bitstamp  ok      272      311     BTC/USDT  58347.66  231
bybit     FAIL    -        -       -         -         -         RateLimitExceeded: bybit GET [url] 403 Forbidden { error:The Amazon CloudFront distribution is configured to block access from your country }
kraken    ok      1436     1309    BTC/USDT  58493.5   1053
```

**An exchange starts failing for everyone.** Check `/readyz` and the `breaker_open` warnings.

- **Temporary throttling:** the breaker handles it.
- **A ban or geo-block** (418, 451, or a CloudFront 403): remove the exchange from `EXCHANGES` in `.env` and run `docker compose up -d` (it recreates the container; a plain `docker compose restart` keeps the old environment).

**Memory.** About 175 MB with four exchanges warm. Measured: kraken, coinbase, okx and bitstamp, 7,600 markets, read-only container.

## Telemetry

The server reports usage to PostHog when `POSTHOG_PROJECT_TOKEN` is set, and otherwise sends nothing anywhere. There are two parts:

- **MCP analytics:** events for tool calls, `tools/list` and `initialize`, plus `$exception` for unexpected failures.
- **Logs:** one wide log line per request, plus server events. Every log line is also printed to stdout as JSON, so `docker logs` works without PostHog.

[`src/telemetry/README.md`](src/telemetry/README.md) is the authoritative list of what is collected and what is never collected. It also gives the measured cost of each option.

| Variable | Default | Meaning |
|---|---|---|
| `POSTHOG_PROJECT_TOKEN` | unset | PostHog project token. Unset means telemetry is off. A personal (`phx_`) key is refused. |
| `POSTHOG_HOST` | `https://eu.i.posthog.com` | Ingestion host. The project is in the EU region. |
| `POSTHOG_SAMPLE_RATE` | `1` | Fraction of successful events kept. Errors are always kept. |
| `LIVE_TELEMETRY_SAMPLE_RATE` | `0.01` | The same for `live_update`, the views' refresh poll (one open view polls every few seconds). Errors are always kept. |
| `POSTHOG_CONTEXT` | `1` | Adds a required `context` argument to every tool and records the model's stated intent. With analytics off (no token) the tools still accept an optional `context`, so a host that cached a tools/list from an instance with analytics on keeps working. |
| `POSTHOG_CAPTURE_MODEL` | `0` | Adds an `llm_model` argument. |
| `POSTHOG_CONVERSATION_ID` | `0` | Adds a `conversation_id` argument and an extra result block. Keep it off. |
| `POSTHOG_TOOLS_LIST_EVENT` / `POSTHOG_INITIALIZE_EVENT` / `POSTHOG_EXCEPTIONS` | `1` | Turn individual event types off. |
| `POSTHOG_EXPECTED_ERROR_CODES` | empty | Extra tool error codes that should not produce `$exception`. |
| `CLIENT_HASH_SECRET` | random per process | HMAC key for `client_hash`. Set it, and use the same value on every instance. Generate it with `openssl rand -hex 32`; compose expands `$` in unquoted `.env` values, so single-quote any value that contains one. |
| `SERVICE_NAME` / `DEPLOYMENT_ENV` / `LOG_LEVEL` / `SERVER_BUILD` | `ccxt-mcp-hosted` / `development` (`.env.example` sets `production`) / `info` / unset (compose sets it from `BUILD_ID`) | Labels and log verbosity. |

**Verifying a deployment.**

- **At start-up:** the server checks the token and its region once (`POST /flags?v=2`) and logs the outcome. HTTP 200 from a capture endpoint proves nothing.
- **At any time:** `/readyz` reports `telemetry.analytics` (`off`, `unverified`, `ok` or `error`) and `telemetry.logs` (`off`, `ok` or `error`).
- **In PostHog** (EU):
  - events: filter `$mcp_source = posthog_mcp_analytics` and `deployment`;
  - logs: filter `service.name = ccxt-mcp-hosted`;
  - joining: a log line and its events share `request_id`, and `posthogDistinctId` matches the events' `distinct_id`.

**Shutdown.** Both queues are flushed within the shutdown deadline. A hung PostHog cannot hold the process past it.
