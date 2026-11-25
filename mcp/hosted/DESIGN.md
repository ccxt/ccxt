# Hosted CCXT MCP server — design

Status: **phase 1 in progress** (anonymous, public market data). Phase 2 (sign-in, server-stored exchange keys, account tools) is designed for here but not built.

The local stdio server (`mcp/`, npm package `ccxt-mcp`) stays and keeps its users. Both servers share one codebase: the hosted server is a second entry point over the same tool registrations, with a stricter tool profile and a multi-tenant runtime around it. Background research, with sources, is summarised in the PR description.

## Goals

- **One URL** that users add to Claude (web, desktop, mobile, Claude Code) and ChatGPT (web, desktop, mobile, Codex). No install, no Node.js, no API keys.
- **Phase 1:** public market data from an allowlist of exchanges, interactive views (MCP Apps) inside the chat, and a clear answer when a user asks for account data or trading: that needs the local server today and the hosted server later.
- **Observability** from day one: PostHog MCP analytics and server logs in PostHog Logs.
- **Distribution** as a plugin/connector in the Claude and OpenAI directories, and by direct URL before any listing.
- **Phase 2 is additive:** nothing in phase 1 has to be undone to add accounts.

## Non-goals for phase 1

Accounts, stored keys, private endpoints, trading, WebSocket streams (`watch_*`), generic method executors (`call_read_method`, `call_implicit_get`, `describe_method`), order routing (`fetch_route`, `execute_route`), and browser-side signing of exchange requests.

## Endpoint and URL layout

- **Canonical MCP URL:** `https://docs.ccxt.com/mcp` (config `PUBLIC_BASE_URL` + `MCP_PATH`). It is also the phase-2 OAuth resource identifier (RFC 8707 audience), the input of Claude's `_meta.ui.domain` hash and the MCP Registry `remotes[].url`, so it must not change once submitted to a directory.
- docs.ccxt.com is served by nginx. That nginx proxies these paths to the MCP service and nothing else:
  - `/mcp` — the MCP endpoint (POST only; GET and DELETE answer 405 as the spec allows).
  - `/.well-known/openai-apps-challenge` — OpenAI directory domain verification (plain-text token from config).
  - `/.well-known/oauth-protected-resource/mcp` — reserved for phase 2 (Protected Resource Metadata, RFC 9728); 404 in phase 1.
- Health (`/healthz`) and readiness (`/readyz`) are served on the service's port but not proxied publicly.

## Protocol, SDK and framework

- **MCP TypeScript SDK v2** (`@modelcontextprotocol/server`, `@modelcontextprotocol/hono`) for both servers, with zod 4 (already on master). SDK v1 is the maintenance line: it speaks protocol revisions up to 2025-11-25 only and is guaranteed support only until about 2027-01. The stdio server moves to `serveStdio` with the legacy handshake, so existing hosts keep working.
- **Hono** on `@hono/node-server`, using the SDK's official Hono integration.
- **Stateless Streamable HTTP.** `createMcpHandler(factory, { legacy: 'stateless' })` serves current-revision (2026-07-28) clients and 2025-era clients that still send `initialize`. No protocol sessions, no GET stream, no resumability, so any instance can answer any request and nothing per-client lives in memory. Cross-call state, if ever needed, is a server-minted handle passed as an ordinary tool argument, as the 2026-07-28 revision prescribes.
- **One `McpServer` per request** from a cheap factory that closes over process-wide shared state: exchange instances, markets, caches, limiters, analytics client. Nothing expensive is built per request.
- **JSON-RPC batches are rejected**, so every limit counts tool calls rather than HTTP requests.

## Tool surface (hosted profile)

An explicit allowlist, pinned by a test so that a tool added to the stdio server is never exposed on the hosted server by accident.

| Group | Tools | Behaviour on hosted |
|---|---|---|
| Market data | `list_exchanges`, `describe_exchange`, `search_markets`, `get_tickers`, `get_orderbook`, `get_ohlcv`, `get_trades` | Public data from the exchange allowlist |
| Views | `show_chart`, `show_orderbook`, `show_tickers` | Same as market data, with an MCP Apps view |
| Account (read) | `get_balance`, `get_orders`, `get_positions`, `get_my_trades` | Listed; return `ACCOUNT_REQUIRED` with a pointer to the local server. Phase 2 gates the same tools by sign-in instead. |
| Write, funds, streams, executors, routing | everything else | Not registered |

- Every tool carries a `title` and explicit `readOnlyHint`, `destructiveHint` and `openWorldHint` booleans (both directories check them), an `outputSchema` when it returns `structuredContent`, a name of 64 characters or fewer, and a deterministic position in `tools/list`.
- The list is the same for every caller. The 2026-07-28 revision forbids list results that vary per connection, and phase 2 relies on it: signing in changes what a tool does, not which tools exist.
- **Trading is not offered on the hosted endpoint.** Both directories exclude it as written (Anthropic review criteria: connectors that "transfer money, cryptocurrency, or other financial assets" are not accepted; OpenAI plugin guidelines §5.2.b: no "execution of money transfers, crypto transfers, or investment trades"). If hosted trading is ever built, it lives on a separate URL added as a custom connector, never in the directory listing.

## Input hardening

This is shared code, so the stdio server benefits too.

- `marketType` becomes an enum. Today it is a free string that ends up in a cache file name; on a public server that is a path-traversal write.
- Caps on `limit`, symbol lists, string lengths, request body size (256 KB) and JSON depth.
- `params` (free-form exchange parameters) is not accepted on the hosted server. Everywhere, keys that look like credentials are rejected with a clear error instead of being forwarded to the exchange.
- No file path is ever derived from request input. The hosted server keeps markets in memory only and runs on a read-only filesystem.
- Upstream errors are sanitised before they reach the caller: no URLs, no response bodies, truncated messages.

## Protecting the exchanges (the main abuse surface)

Every caller shares the server's IP addresses at each exchange. One abusive client could otherwise get those addresses rate-limited or banned for everyone.

- **Exchange allowlist** (config). Markets are loaded at start-up and refreshed in the background; `/readyz` stays unready until the allowlist is warm. Callers cannot force a reload.
- **One public instance and one throttler per (exchange, market type)**, sized to the allowlist.
- **Response cache with in-flight coalescing**, keyed by normalised arguments, with a TTL per method: about 2 s for tickers and trades, 1 s for order books, a fraction of the candle length for OHLCV, hours for markets and exchange descriptions. Most traffic is the same few tickers and charts.
- **Bounded queue per exchange.** When it is full the tool fails fast with `RATE_LIMITED` and a retry-after hint rather than queueing for minutes.
- **Circuit breaker per exchange** on DDoS-protection, rate-limit, 418 and 451 responses. Rate-limit errors are never retried automatically.
- **Per-call deadline** of about 20 s, and upstream work is aborted when the client disconnects.
- **Per-client limits.** The key is `_meta["openai/subject"]` when ChatGPT sends it, otherwise the client IP from the trusted proxy header. Documented host egress ranges (Anthropic `160.79.104.0/21`; OpenAI's published connector ranges) get higher budgets, because all Claude users arrive from them. A global concurrency cap sits on top.
- **Geo-blocking.** Some exchanges block some datacenter regions. Reachability of every allowlisted exchange is checked from the production machine before launch, and an exchange that cannot be reached is removed from the allowlist rather than left failing.

## Interactive views (MCP Apps)

- Same views as the stdio server: candlestick chart, order-book depth and ladder, price board. They are self-contained HTML with no network access and no external assets.
- **Versioned URIs** (`ui://ccxt/chart.<content-hash>.html`), because hosts cache views by URI; ChatGPT for up to an hour.
- **Capability detection.** Current-revision requests carry the client's capabilities; 2025-era stateless requests do not. When capabilities are unknown, the hosted server attaches the view payload (config `UI_WHEN_UNKNOWN`, default on). The payload is kept compact, because a host that does not render views may pass it to the model instead of the text summary.
- `_meta.ui.domain` differs per host: Claude derives it from a hash of the exact connector URL, and ChatGPT requires its own unique value for directory submission. It is set per host once tested in each.

## Observability

- **PostHog MCP analytics** (`@posthog/mcp`, version pinned while the product is in beta), instrumenting each per-request server. EU host. The project token comes from the environment and is never committed.
  - **Redaction** in `beforeSend`: a denylist of credential-like keys, argument values capped, tool responses dropped on success (the response size is recorded instead).
  - **Identity:** no person profiles for anonymous traffic. An `auth_state` property is sent from day one so dashboards survive phase 2.
  - **Correlation and volume:** a `request_id` on every event, and a sampling knob for success events.
- **Logs** go over OTLP to PostHog Logs (`/i/v1/logs`): one wide line per request plus error lines, never payloads, correlated by `request_id` and `posthogDistinctId`.
- Both are flushed on shutdown, and the service runs without them when no token is configured.

## Deployment

- A Docker image (Node 22, non-root, read-only root filesystem, memory limit) and a compose file for the Hetzner machine.
- An nginx snippet for docs.ccxt.com (proxy `/mcp` with buffering off and a read timeout above the hosts' 240 s tool limit; pass `Host` through).
- Graceful drain on SIGTERM.
- Deployment automation is added once the machine's credentials are available. The Hetzner region is chosen after the exchange reachability check above.

## Phase 2 (designed for, not built)

- **OAuth.** The MCP server is an OAuth 2.1 resource server. The authorization server is a separate service. Protected Resource Metadata at the reserved path; Client ID Metadata Documents preferred; tokens bound to the canonical URL as audience.
- **Same tools, gated.**
  - A call to an account tool without a token gets HTTP 401 with `WWW-Authenticate` and `resource_metadata`. Claude uses this for "lazy authentication" and retries with the new token.
  - Every tool also declares `securitySchemes` (`noauth` or `oauth2`), and a gated result carries `_meta["mcp/www_authenticate"]`. This is what ChatGPT uses.
- **Plumbing exists from phase 1.** The verified token reaches tools through the SDK's `ctx.http.authInfo` and an `authInfo` field on the server context. Phase 2 swaps account resolution from the local config file to the signed-in user without touching tool bodies.
- **Keys and exchange instances.** Keys are entered on a CCXT web page, never in the chat (OpenAI guideline §4.2.b and the MCP spec both forbid collecting secrets through forms), and stored with envelope encryption. Each user gets their own exchange instances; authenticated instances are never shared.
- **Confirmations** for any write use the protocol's multi-round-trip input requests, not a held-open connection.

## Distribution

- **Plugins.** A remote-server plugin for Claude Code (`.mcp.json` with `"type": "http"`) and for OpenAI (`mcp.json` with `"type": "streamable-http"`). They are listed next to the existing local plugin in the repo's marketplaces, under a different name so local users are not switched silently.
- **Before any listing:**
  - Claude: add as a custom connector; claude.ai has a documented prefill link.
  - ChatGPT: add a custom MCP server.
  - Claude Code: `claude mcp add --transport http`.
  - Codex: a URL entry in its config.
- **Directory policies to clear first** (quoted from each policy):
  - Anthropic: "We do not generally allow cryptocurrency software in our directory." A listing needs Anthropic's written permission.
  - OpenAI: §3.5.b "We cannot approve plugins that primarily function as unofficial connectors to third-party services, including pass-through intermediary software layers", and §5.2.b.5 on crypto offerings "involving speculation". Generic executors are not allowed either (§6.2.b), which is one reason the hosted profile drops them.
- **Listing prerequisites:** privacy policy, terms of service, support and website URLs, a verified OpenAI organisation, domain verification, review test cases, and a demo video and screenshots.
