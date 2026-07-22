# ccxt-mcp — design & decision log

This document records what the official CCXT MCP server learned from prior art, the constraints that shaped it, and the decisions with their rationale. It is contributor-facing; user docs live in `README.md`.

## Goals / non-goals

**Goals:** keys stay local and invisible to the model; trivial install (`npx -y ccxt-mcp`); ALL ccxt exchanges (crypto + prediction), never a hardcoded subset; full read coverage of the unified API; user-owned opt-in gates for everything ccxt can do (orders, funds moves, raw endpoints); responses sized for LLM context windows.

**Non-goals (v1):** remote/hosted deployment (a remote server would have to custody keys), WebSocket streaming (v1.1 — see below), MCP resources/prompts (tools + server instructions cover the need until hosts standardize resource UX).

## Prior art (analyzed 2026-07-21)

Six community CCXT MCP servers plus the wider ecosystem (official Kraken/OKX/Coinbase MCP servers, single-exchange servers, MCP directories):

| Project | Stars | Stack | Tools | Keys | Coverage | Rails |
|---|---|---|---|---|---|---|
| doggybee/mcp-server-ccxt (`@mcpfun/mcp-server-ccxt`, most popular ~511 dl/mo) | 140 | TS, stdio | 24, 1:1 methods | **apiKey/secret as required per-call tool params** | 24 hardcoded | none |
| lazy-dinosaur/ccxt-mcp (`@lazydino/ccxt-mcp`) | 91 | TS, stdio + deprecated SSE | 20 + 8 resources | plaintext JSON config, **named multi-account** | all, dynamic | none |
| Nayshins/mcp-server-ccxt | 62 | Py, stdio | 7 read-only | none (public only) | 10 hardcoded | safe by omission |
| pcriadoperez/ccxt-mcp | 3 | Py FastMCP, stdio | 9 + prompts | env vars (name-mismatch bug), no passphrase | all, dynamic | per-call `testnet` bool defaulting to live |
| PelleNybe/Crypto-MCP-Hub | 8 | Py FastMCP, HTTP on 0.0.0.0 | 11 | env vars, no passphrase | all, dynamic | allowlist + notional cap + human approval queue, **bypassable at execution** |
| pedrobraiti/Valet | 12 | Py FastMCP, stdio | 16 semantic verbs | env only (good) | **1 exchange per process** | best-in-class: dry-run default, live-ack, caps, intent journal |

### Recurring failures this design explicitly avoids

1. **Credentials in model context** (doggybee): every private call carries apiKey/secret as tool arguments → secrets in transcripts. Here: structurally impossible — no tool schema has a credential parameter.
2. **Hardcoded exchange subsets** (doggybee 24, Nayshins 10): here everything validates against `ccxt.exchanges` at runtime.
3. **No response-size management** (all six): raw `fetchMarkets`/`fetchTickers` dumps are hundreds of KB–MB. Hosts cap tool results (~25k tokens Claude Code, ~150k chars claude.ai/Desktop) and silently replace over-cap results with a file pointer. Here: projections, `info` stripped, per-tool caps derived from those limits, in-band truncation notices, and no list-all-markets tool at all (search instead).
4. **Rails not at the execution point** (PelleNybe validates in a pre-flight tool; the execution tool re-checks nothing): here `guardOrder()` runs inside the write handler, under a per-account mutex.
5. **Per-call instance construction** (Nayshins closes all instances after every call; PelleNybe constructs per call; doggybee's trading path rebuilds + re-loads markets per order): defeats ccxt's token-bucket rate limiter and re-pays the markets cold start. Here: pooled instances for the process lifetime + disk-cached markets (24h TTL) + in-flight load dedup.
6. **stdout corruption** (pcriadoperez `print()`s in a stdio server): here `console.*` is rerouted to stderr before any import, and `exchange.log`/`verbose` are overridden (ccxt's `Exchange.log` defaults to `console.log`, and verbose mode prints signed request headers).
7. **README/tool drift** (doggybee documents ~10 tools that don't exist): here a schema test asserts the registered tool list, and the README lists tools from that same source of truth.

### Ideas adopted from prior art

- Named multi-account config + public-vs-authenticated instance pools (lazy-dinosaur).
- Trimmed DTOs, uniform `{ok, data|error}` envelope, intent-before-dispatch journal, explicit live-ack (Valet).
- Fail-closed symbol allowlist + notional cap from a live quote (PelleNybe) — enforced at execution here.
- Field-trimmed, paginated market search (pcriadoperez's `fetch_markets` was the one tool anywhere with the right instinct).
- Tiered capability posture (Kraken's official MCP: market/no-keys → read-only → opt-in trading).

## Constraints from MCP / Claude guidance

- **stdio, not localhost HTTP**: the MCP spec recommends stdio for local servers; a localhost HTTP port is reachable by other local processes and DNS-rebinding pages — pure attack surface for a key-holding server.
- **Tool count**: schemas are injected into model context every turn; 1–15 is the sweet spot, 30+ demands search+execute. Hence the hybrid: ~12 always-on tools, and higher tiers only registered when activated (max 28).
- **Read/write split is a hard review rule**: a catch-all `method`-param tool that can both read and write is rejected. `call_read_method`'s `^(fetch|load)` + not-`watch*`/`*Ws` gate makes the generic read tool *provably* read-only (every mutating unified method starts with `create|cancel|edit|withdraw|transfer|set|borrow|repay|close|sign`; prediction's `ethRpc`/`sendEvmTransaction` don't match either). Writes have dedicated tools.
- **Anthropic directory rejects money-moving connectors** — so the trading/funds tiers are npx/MCPB-installed, never directory-listed; a read-only listing remains possible.
- **Elicitation** (native confirm forms) shipped in Claude Code ≥ 2.1.76 but not all hosts: confirmation is elicitation-first with a preview + single-use HMAC confirm-token fallback (60s TTL, bound to the exact canonicalized payload).

## Decision log

| Decision | Rationale |
|---|---|
| TypeScript + official `@modelcontextprotocol/sdk`, stdio only | ccxt's source of truth is TS; npx is the lowest-friction install; stdio per spec security guidance |
| `mcp/` dir in the monorepo mirroring `cli/` (own npm package `ccxt-mcp`, manual publish, git tracks `ts/` only) | the `cli/` sub-package pattern already exists and works; in-repo keeps the server version-locked to ccxt metadata (`has`, `features`, JSDoc) |
| Deviations from `cli/`: `NodeNext` + `strict` tsconfig, config in the per-OS *config* dir (not cache dir), no cwd `keys.json` scanning | SDK needs NodeNext subpath resolution; greenfield code should be strict; an MCP host's cwd is unpredictable, so silently absorbing a credentials file from cwd is a security surprise (`CCXT_MCP_CONFIG` replaces it; the loader still accepts the legacy per-exchange shape) |
| Dual ccxt import (`import('ccxt')` → Function-eval `../../ts/ccxt`) | same trick as the CLI: published dep for users, live TS for contributors, tsc never crawls the monorepo |
| Tri-state `trading`/`funds`: `false` \| `true` (sandbox/demo only) \| `"live"` | `true` on a live account is a plausible accident; the string `"live"` cannot be produced accidentally and doubles as the explicit live-ack. Live additionally requires a user-authored cap decision (`maxOrderValue`/`maxTransferValue`: number or explicit `null`) — the default is *you must choose*, not a magic number |
| Everything ccxt offers is exposed behind user-owned switches; the only hard exclusions are structural | maintainer decision: it's the user's account and responsibility; the server provides gates, confirmation, and an audit trail rather than vetoes. Structurally impossible forever: credentials as tool params/output, config editing from the conversation, disabling rate-limiting or enabling `verbose` |
| `call_write_method` allowlist excludes batch order placement | `createOrders` would bypass the per-order notional caps; orders go through `create_order` one at a time |
| Implicit API: GET via always-on `call_implicit_get`, non-GET via opt-in `call_implicit_write` | the HTTP verb is encoded in ccxt's implicit method names (first camel verb token after the API-section prefix), so GET-gating keeps the always-on tool honestly `readOnlyHint`; raw writes can't be validated, so they compensate with mandatory confirmation + journaling |
| Deposit addresses gated behind the funds tier | transcript-visible addresses invite address-substitution scams; near-zero value below that tier |
| `cancel_order` is non-destructive, never confirmed | cancels reduce risk; friction there pushes agents to leave stale orders live |
| Journal: append-only monthly JSONL, fsync'd intent-before-dispatch, no auto-delete | crash-safe audit trail; the rolling-24h daily-cap accumulator derives from it, so caps survive restarts; a 50 MB warning doubles as a runaway-loop detector |
| Doc manifest built by a small JSDoc parser over `ts/src/*.ts` (not jsdoc2md) | the doclets follow the repo's strict convention; a dependency-free parser at publish time ships 98 exchanges of per-method `params.*` docs + `@see` links in the tarball, with runtime introspection as fallback |
| Caps: search_markets 200, tickers 50 symbols, orderbook 100 levels/side, ohlcv 500 candles, trades/orders 200, global 80k-char truncation guard | each derives from the ~25k-token binding host cap (≈100k chars) with envelope headroom; the failing case is the host silently swapping the payload for a file pointer |
| No MCP resources/prompts in v1 | host resource UX is uneven (manual attachment in Desktop); everything a `ccxt://exchanges` resource would hold is served on demand by discovery tools; conventions ship once per session via server `instructions` |

## Review hardening (pre-release adversarial review, 2026-07-22)

A four-perspective adversarial review (security, ccxt correctness, MCP-spec usage, agent DX) with independent verification of every finding produced 19 confirmed issues, all fixed before release. The ones that are now load-bearing rules:

- **`params.cost`/`params.quoteOrderQty` are rejected by `guardOrder`** — ccxt market orders read a quote-side size from params, which would execute at that size while the caps valued only the positional amount. Quote-side spend must go through the top-level `cost` parameter, which `guardCost` values. Enforced at the guard, so `edit_order` is covered too.
- **Elicitation failure fails closed** — on an elicitation-capable host, a failed/timed-out human prompt returns `CONFIRM_UNAVAILABLE` and never falls back to the model-redeemable confirm token (which would let the model confirm its own write). The token flow is reserved for hosts without elicitation. Elicitation gets a 5-minute timeout (humans reading withdrawal previews are slower than the SDK's 60s default), and an accept-with-`confirm:false` counts as an explicit decline.
- **Address-material gating is a pattern, not an allowlist** — `/deposit.?address|withdraw.?address|withdrawal.?whitelist/i` gates both unified reads (`call_read_method`) and raw GET endpoints (`call_implicit_get`) behind the funds tier; an enumeration of method names would silently fall behind ccxt.
- **`maxDailyValue` is the combined rolling cap** over orders *and* fund moves (the journal accumulator counts both, so both are bound by it).
- **Valuation correctness**: inverse (coin-margined) contracts are valued `amount × contractSize` (price-independent); prediction outcomes are valued `amount × price` in USD (all prediction venues settle in USD-pegged collateral) — without this, any numeric `maxOrderValue` made prediction trading impossible since live trading *requires* a cap decision.
- **Sell-by-cost is refused** where the exchange lacks `createMarketSellOrderWithCost` — the buy-side emulation convention would sell `cost` units of *base*.
- Symbol allow/deny lists apply to every symbol-bearing write (`set_leverage`, `set_margin_mode`, `call_write_method` position/margin ops), not just orders; `isImplicitMethod` requires own-property status so verb-shaped base helpers (`handlePostOnly`, …) aren't callable; the stderr reroute passes through the redactor; two-phase confirm payloads are built from raw args so identical re-calls digest identically.

## First-time-agent DX passes (three rounds)

Three independent fresh agents drove the server through the wire interface only (tool list + JSON responses, no source), each hunting for what the prior rounds missed. Verdicts 8.5 → 7.5 → 8.0; safety held airtight in every round (notional cap unbypassable even via a `params` override, funds allowlist, tier-gated tool existence, token binding, zero credential leakage). Load-bearing fixes that came out of them:

- **`toContent` output is always valid JSON.** Oversized array data is tail-dropped; an oversized non-array payload (a raw implicit-endpoint response) has its `data` replaced by a `{truncated:true}` marker with `meta.truncated` — a byte-cut that yields unparseable JSON is never emitted. This is the single most important robustness invariant: an agent must always be able to `JSON.parse` a result.
- **No silent-wrong-answer traps at the input boundary**: malformed `since` → `BAD_REQUEST` (not a silently-defaulted recent window); a `marketType` that conflicts with an explicit symbol → `meta.notice` (not the wrong market's data); order-book levels normalized to the unified `[price, amount]` (some venues append a per-level timestamp an agent could misread); `includeInfo` dropped on multi-symbol calls says so.
- **Discovery isn't blind to the long tail**: `describe_method` keyword search defaults to binance's complete surface and matches on whitespace-split tokens, so "open interest" / "funding rate" resolve.
- **Envelope/hint consistency**: private-read error envelopes carry the account's `exchange`; no error ships an empty `hint`; `hasMore` is always a real boolean.

## WebSocket plan (v1.1)

MCP hosts surface no model-visible push today, but the stdio server is long-lived — so the portable shape is **subscribe + poll**: `watch_subscribe` (validates `watch*` against `has`, starts a background loop accumulating into ccxt.pro's bounded caches), `watch_read` (drain since cursor, projected + capped), `watch_unsubscribe` + idle TTL auto-expiry (`unWatch*`/client close) so abandoned streams can't leak. Genuinely better than REST polling for private event streams (`watchOrders`/`watchMyTrades`). Deferred from v1 because subscription lifecycle is the one piece with real state-management risk.

## Also planned

- **v1.1**: signed `.mcpb` bundle (MCPB `user_config` with `sensitive: true` fields → OS keychain — the best desktop secret store; sandbox checkbox defaults ON, trading checkbox maps to the tri-state; funds/implicitWrites stay config-file-only), MCP registry `server.json` (`io.github.ccxt/ccxt-mcp`), path-filtered CI workflow, `.claude/skills/ccxt-mcp/` usage skill, `wiki/MCP.md`, Claude Code plugin bundling the existing ccxt skills.
- **v2**: MCP resources if host UX matures, portfolio aggregation across accounts, `tools: "extended"` mode if hosts standardize tool deferral.
