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
| Views | `show_chart`, `show_orderbook`, `show_tickers` (MCP Apps views, versioned `ui://ccxt/<view>.<hash>.html`) |
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
- **Smoke test of the bundle:** `npm run smoke`, using the official MCP client in both protocol eras. Add `-- --live` to call real exchanges.

## Configuration

All configuration comes from environment variables. [`.env.example`](.env.example) lists every variable with its default. The ones that matter most:

| Variable | Default | Meaning |
|---|---|---|
| `PUBLIC_BASE_URL`, `MCP_PATH` | `https://docs.ccxt.com`, `/mcp` | Together they form the canonical MCP URL. It is also the phase-2 OAuth resource, the input of Claude's `ui.domain` hash and the registry URL: never change it once published. |
| `HOST`, `PORT` | `127.0.0.1`, `8080` | Listening address. Compose sets `0.0.0.0` inside the container. |
| `ALLOWED_HOSTS` | public host + `localhost`, `127.0.0.1`, `[::1]` | `Host` header allowlist. Any other host gets 403 (DNS-rebinding protection). |
| `TRUSTED_PROXY` | `none` | Where the client IP comes from: `none` (socket peer), `nginx-x-real-ip`, or a hop count `N` for `X-Forwarded-For` (read N entries from the right; the leftmost is never used). Headers are believed only from a loopback or private peer. Compose sets `nginx-x-real-ip`. |
| `CORS_ALLOWED_ORIGINS` | empty | Browser origins allowed to read responses. Empty means no CORS headers: MCP hosts call from their servers, and the `Origin` header is not used to reject anyone. |
| `EXCHANGES` | `binance,bitfinex,bitget,bitstamp,bybit,coinbase,gate,kraken,kucoin,okx` | The allowlist. Run the reachability check (below) on the machine first. |
| `MARKETS_REFRESH_MINUTES` | `360` | Background markets refresh, with ±10% jitter. Markets live in memory only. |
| `READY_GRACE_MS` | `120000` | `/readyz` waits for every exchange. After this long, one warm exchange is enough, and cold ones answer `EXCHANGE_WARMING`. |
| `REQUEST_DEADLINE_MS` | `20000` | Per-call deadline. Waiting work ends with a `TIMEOUT` tool error, never a hung socket. |
| `MAX_CONCURRENT_REQUESTS` | `64` | Global cap. Beyond it: 503 + `Retry-After`. |
| `UPSTREAM_CONCURRENCY_PER_EXCHANGE`, `UPSTREAM_QUEUE_PER_EXCHANGE` | `4`, `16` | Requests in flight to, and waiting for, one exchange. Beyond that: `RATE_LIMITED` + `retryAfterSeconds`. |
| `MAX_UPSTREAM_CALLS_PER_TOOL` | `10` | Cache misses one tool call may cause, which bounds the per-symbol fan-out. |
| `BREAKER_*` | 3 failures / 60 s, 30 s cooldown (max 10 min) | Circuit breaker per exchange. |
| `RATE_LIMIT_PER_MINUTE`, `RATE_LIMIT_BURST` | `60`, `30` | Per-client token bucket. A tool call costs 1; list and read requests cost 0.25. |
| `HOST_RATE_LIMIT_PER_MINUTE`, `HOST_RATE_LIMIT_BURST` | `3000`, `600` | Budget for Anthropic's and OpenAI's egress addresses, which all their users share. |
| `UI_WHEN_UNKNOWN` | `attach` | What a `show_*` result does when the client did not state its capabilities: attach the view payload, or omit it. |
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
- **Circuit breaker.** It opens after three `DDoSProtection`, `RateLimitExceeded` or `ExchangeNotAvailable` errors, or HTTP 429 responses, within a minute. It opens at once on 418 (IP ban) or 451 (geo-block). After the cooldown it lets one probe through.
- **Per-client limits.**
  - Clients are keyed by IP, taken from the trusted proxy header.
  - `_meta["openai/subject"]` is the key instead, but only on requests from OpenAI's published connector ranges. From anywhere else it is just a string the caller chose.
  - Anthropic's (`160.79.104.0/21`, `153.61.208.0/20`) and OpenAI's ranges get the higher host budget.
  - The OpenAI list is a dated snapshot in `src/data/openai-egress.ts`. Refresh it with `node scripts/refresh-egress-ranges.mjs` and review the diff.
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
| `GET /healthz` | no | Liveness. Used by the container health check. |
| `GET /readyz` | no | 200 once the allowlist is warm. Reports each exchange's state, market count, breaker and last error, plus telemetry status. 503 while warming or draining. |

**Phase 2 seam.** `verifyBearer()` in `src/app.ts` is the one place a bearer token would become `AuthInfo`. In phase 1 it returns `undefined`, and an `Authorization` header is ignored. Everything downstream, from the factory and `ctx.http.authInfo` to the request scope, already carries it.

## Deploy (Hetzner VM, Docker Compose, nginx)

**One-time setup on the VM** (Docker with the compose plugin; nginx already serves docs.ccxt.com):

```bash
git clone https://github.com/ccxt/ccxt.git /srv/ccxt && cd /srv/ccxt/mcp/hosted
cp .env.example .env && chmod 600 .env    # set EXCHANGES, OPENAI_APPS_CHALLENGE, POSTHOG_PROJECT_TOKEN, CLIENT_HASH_SECRET
docker compose build
docker compose run --rm hosted node /app/check-exchanges.mjs   # reachability from THIS machine
# drop every exchange the check reports as unreachable from EXCHANGES in .env, then:
docker compose up -d
curl -s http://127.0.0.1:8080/readyz | head -c 400
```

**nginx.**

- Copy [`deploy/nginx-docs.ccxt.com.conf`](deploy/nginx-docs.ccxt.com.conf). The `upstream` block goes in the `http {}` context. The `location` blocks go inside the existing `server {}` for docs.ccxt.com.
- Then run `nginx -t && systemctl reload nginx`.
- It proxies only `/mcp` and the two reserved `/.well-known` paths, with these settings:
  - `proxy_buffering off`;
  - a 300 s read timeout;
  - `Host` passed through;
  - `X-Real-IP` overwritten with `$remote_addr`;
  - a 256 KB body cap.

**Check from outside:**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://docs.ccxt.com/mcp        # 405 (GET)
claude mcp add --transport http ccxt https://docs.ccxt.com/mcp && claude mcp list
```

**The container** (`docker-compose.yml`):

- read-only root filesystem, no tmpfs needed;
- runs as the non-root `node` user, with all capabilities dropped and `no-new-privileges`;
- 1.5 GB memory limit, `NODE_OPTIONS=--max-old-space-size=1024`;
- `restart: unless-stopped`;
- port bound to `127.0.0.1:8080` only.

The image is the single bundle on `node:22-bookworm-slim`, with no `node_modules`.

## Upgrading

```bash
cd /srv/ccxt && git pull
cd mcp/hosted && BUILD_ID=$(git rev-parse --short HEAD) docker compose up -d --build
docker compose logs --tail 20 hosted && curl -s http://127.0.0.1:8080/readyz | head -c 400
```

- `docker compose up` sends SIGTERM to the old container. It then:
  - stops accepting MCP requests (503 + `Retry-After: 5`, and `/readyz` reports `draining`);
  - lets in-flight calls finish within `DRAIN_TIMEOUT_MS`;
  - flushes telemetry, then exits 0.
- `stop_grace_period` is 30 s.
- There is a short gap while the new container warms its markets, typically 2–10 s. Hosts retry on 503.
- A zero-downtime switch needs a second container behind the same nginx upstream. That is not built.
- **New ccxt version:** `npm update ccxt` in `mcp/`, commit the lockfile, and rebuild.
- **Changed views:** their URIs change by content hash on their own.

## Operations

**Logs.** Each line is one JSON object on stdout (`docker compose logs -f hosted`), with:

- one `request` line per HTTP request, carrying `request_id`, method, tool, exchange, status, `error_code`, duration, cache outcome and protocol era;
- `markets loaded` / `refreshed` / `failed` lines;
- `breaker_open` warnings;
- `draining` / `drained` lines.

Lines are also mirrored to PostHog Logs when a token is set (see Telemetry). nginx's `$request_id` arrives as `X-Request-Id`, so nginx and app lines join on it. An incoming `X-Request-Id` is used only under the same rule as the client-IP headers (`TRUSTED_PROXY` set and a loopback or private peer); otherwise the server makes its own, because the id also becomes the analytics session id.

**Readiness.** `curl -s 127.0.0.1:8080/readyz | jq`. Per exchange it shows:

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
- **A ban or geo-block** (418, 451, or a CloudFront 403): remove the exchange from `EXCHANGES` and restart.

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
| `POSTHOG_CONTEXT` | `1` | Adds a `context` argument to every tool and records the model's stated intent. |
| `POSTHOG_CAPTURE_MODEL` | `0` | Adds an `llm_model` argument. |
| `POSTHOG_CONVERSATION_ID` | `0` | Adds a `conversation_id` argument and an extra result block. Keep it off. |
| `POSTHOG_TOOLS_LIST_EVENT` / `POSTHOG_INITIALIZE_EVENT` / `POSTHOG_EXCEPTIONS` | `1` | Turn individual event types off. |
| `POSTHOG_EXPECTED_ERROR_CODES` | empty | Extra tool error codes that should not produce `$exception`. |
| `CLIENT_HASH_SECRET` | random per process | HMAC key for `client_hash`. Set it, and use the same value on every instance. |
| `SERVICE_NAME` / `DEPLOYMENT_ENV` / `LOG_LEVEL` / `SERVER_BUILD` | `ccxt-mcp-hosted` / `development` / `info` / unset | Labels and log verbosity. |

**Verifying a deployment.**

- **At start-up:** the server checks the token and its region once (`POST /flags?v=2`) and logs the outcome. HTTP 200 from a capture endpoint proves nothing.
- **At any time:** `/readyz` reports `telemetry.analytics` (`off`, `unverified`, `ok` or `error`) and `telemetry.logs` (`off`, `ok` or `error`).
- **In PostHog** (EU):
  - events: filter `$mcp_source = posthog_mcp_analytics` and `deployment`;
  - logs: filter `service.name = ccxt-mcp-hosted`;
  - joining: a log line and its events share `request_id`, and `posthogDistinctId` matches the events' `distinct_id`.

**Shutdown.** Both queues are flushed within the shutdown deadline. A hung PostHog cannot hold the process past it.
