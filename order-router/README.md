# order-router

Smart order router built on [ccxt](https://github.com/ccxt/ccxt). Discovers every ccxt.pro
exchange, loads their markets, and subscribes to the *routable* symbol universe — every symbol
tradable on 2+ exchanges — over WebSocket. Caches live L2 order books in-process and serves
best-execution price lookups that account for order size (book-walking, not just top-of-book) and
taker fees.

This is a standalone service that *depends on* ccxt as a library — it does not modify `ts/src/**`
and is not part of the ccxt build/transpile pipeline.

## Architecture

```
Fastify API (reads in-process cache only, no network hop on the read path)
        │
OrderBookCache + FeeRegistry (in-memory, EventEmitter-based)
        │
        ├── single-process mode (ORDER_ROUTER_SHARD_COUNT=1): ExchangeConnector × N in this process
        │
        └── sharded mode (ORDER_ROUTER_SHARD_COUNT>1): child_process per shard, each running its
            own ExchangeConnector × N, relaying book/health/fee writes to the parent over IPC
```

- **In-memory is the hot path.** The API's read path is always a plain in-process `Map` lookup —
  see `src/cache/orderBookCache.ts`. In sharded mode, a shard's connector writes cross a process
  boundary via IPC (same-host pipe, no external DB, no request-time cost — see "Why single-process
  Node..." below), but the API's *reads* never do, whether sharded or not.
- **Asset-to-asset addressing.** Callers say what they hold (`from`) and what they want (`to`); the
  router derives the market, the direction, and any bridge hop. `USDT -> BTC` is a *buy* of
  `BTC/USDT` while `BTC -> USDT` is a *sell* of the same market — deriving that server-side removes
  the step callers most often get backwards.
- **Book-walking, not best-bid/ask.** `/route` walks each
  exchange's cached book to your actual size, computing the volume-weighted average price plus taker fee —
  because for any non-trivial order size, the venue with the best top-of-book price is not
  necessarily the venue with the best price for your actual size.
- **Per-exchange isolation.** Each `ExchangeConnector` owns its own WS connection(s) and
  reconnects with exponential backoff (plus jitter — see below) independently; one exchange
  misbehaving never affects others or the API.
- **Push-on-change, not polling.** `OrderBookCache` extends `EventEmitter` and emits
  `update:<symbol>` whenever a book changes; `/stream/route` subscribes to every market its route
  depends on instead of
  polling on a fixed interval, coalescing bursts into at most one computed result per event-loop
  tick via `setImmediate`.

### Discovery: only subscribe where routing has value

A symbol listed on exactly one exchange has nothing to route between — subscribing to it costs a
WS subscription, memory, and CPU for zero comparative value. Measured directly across just 5
exchanges (Kraken, Coinbase, KuCoin, Bitget, Gate): **9,412 unique unified symbols, of which only
2,102 (22%) trade on 2+ of those exchanges.** The other 78% are single-exchange noise for a router.

`ORDER_ROUTER_DISCOVER_ALL=true` turns this on: `src/discovery/exchangeDiscovery.ts` lists every
ccxt.pro exchange with `has.watchOrderBook` (76 out of 80 exchange classes, checked locally with no
network calls), `src/discovery/symbolUniverse.ts` loads markets for all of them (bounded
concurrency, tolerant of individual failures — one geo-blocked exchange doesn't abort discovery),
and builds a `symbol -> Set<exchangeId>` index. Only symbols meeting `ORDER_ROUTER_MIN_EXCHANGES_PER_SYMBOL`
(default 2) become subscriptions.

### Subscription mechanics — what actually broke in testing, and the fixes

Naively spawning one independent `watchOrderBook(symbol)` loop per routable symbol (the original
v1 design) does not survive contact with real exchanges once the symbol count gets large. Live
testing against Kraken/Coinbase/KuCoin/Bitget/Gate with their full routable symbol sets (up to
~1,700+ symbols on one exchange) surfaced three distinct failures, each with a specific fix:

1. **Reconnect storms.** With N independent per-symbol loops, any shared-connection hiccup fails
   all N simultaneously; with identical backoff timers they all retry in lockstep, repeatedly
   re-triggering exchange-side rate limits. Observed: 1,000–2,500+ reconnects within 15 seconds on
   KuCoin/Bitget. Fix: **prefer `watchOrderBookForSymbols(symbols)`** (one batched subscription)
   over per-symbol loops wherever the exchange supports it (24 of the exchanges checked do,
   including all of Kraken/Coinbase/KuCoin/Bitget in this test set — only Gate in this set falls
   back to per-symbol), and add **full jitter to backoff** so loops that failed together don't
   retry together.
2. **Per-message/per-connection subscription caps.** Even batched, sending hundreds of symbols in
   one `watchOrderBookForSymbols` call trips server-side limits — observed directly: Bitget
   (`"subscribe over limit, max:1000"`), KuCoin (rejects an overlong comma-joined topic string).
   Fix: **chunk into `ORDER_ROUTER_MAX_SYMBOLS_PER_SUBSCRIPTION`-sized groups** (default 50), each
   its own independent watch loop, with staggered startup (`LOOP_START_STAGGER_MS`) so chunks
   don't all subscribe in the same instant either.
3. **Session-wide caps that chunking alone can't fix.** Coinbase rejected the connection outright
   with `"too many L2 streams requested in a single session"` even with message-size chunking,
   because the cap is on *total concurrent channels for the whole session*, not per message — many
   chunks running concurrently still open that many channels cumulatively. Fix:
   **`ORDER_ROUTER_MAX_SYMBOLS_PER_EXCHANGE`**, a per-exchange total-symbol cap (format
   `"coinbase:25,other:100"`) applied before chunking, truncating (with a logged warning) rather
   than subscribing past a known session limit.

None of these limits are documented anywhere reliable per-exchange — they were found empirically,
the same way `skip-tests.json` accumulates exchange quirks in the main ccxt repo. Expect to tune
`ORDER_ROUTER_MAX_SYMBOLS_PER_EXCHANGE` further per exchange under real production load; this is
not a solved, closed problem, it's a starting point validated against live connections.

### Why single-process Node instead of splitting collector (TS) and API (e.g. Rust) via Redis

Considered and rejected for now: a dedicated TS/ccxt collector process publishing to Redis, with a
separate Rust API layer reading from Redis for speed. The math doesn't favor it:

- An in-process `Map` read is ~100ns. Even a local (same-host) Redis read is ~0.1–0.3ms once you
  count the round trip and (de)serialization — 1,000–3,000x slower — and that cost lands on every
  request if the API queries Redis synchronously.
- The gain from a Rust HTTP/serialization layer over Node's (Fastify) is on the order of tens of
  µs per request. That's dwarfed by the Redis tax you'd introduce to get it, and both are dwarfed
  by exchange WS round-trip time (tens of ms) — the actual latency floor.
- Splitting also means two more language runtimes, two more build/deploy pipelines, and a
  cross-language wire protocol, for a net-negative latency change.

Redis becomes worth it only for **horizontal scaling across hosts**, not raw speed — and even then,
each API replica should keep its own in-memory copy of the cache, updated **asynchronously** via
Redis pub/sub in the background (never queried synchronously per-request). This service's own
sharding (below) already establishes that pattern using Node's built-in IPC instead of Redis, since
sharding today is same-host; swapping the transport for cross-host Redis pub/sub later, keeping the
same "write path is async, read path is always local" shape, is a natural extension, not a rewrite.

### Scaling: connection count vs. message throughput vs. single-thread CPU

- **Connection count is not the bottleneck.** ccxt.pro multiplexes: most exchanges get one WS
  connection per exchange. Node's event loop handles thousands of concurrent outbound sockets fine
  since I/O is async (epoll-backed); the real ceiling is OS file descriptors (`ulimit -n`),
  trivially raised, not thread count.
- **Aggregate message throughput on a single JS thread is the real risk once the routable symbol
  count is large.** Every WS message still gets JSON-parsed and diff-merged on one thread. At full
  discovery scale (76 exchanges, thousands of routable symbols) this plausibly exceeds one
  process's comfortable throughput budget.
- **Fix: process sharding.** `ORDER_ROUTER_SHARD_COUNT>1` splits the discovered/routable exchange
  list across `child_process` workers (`src/sharding/`), load-balanced by symbol count (a rough
  proxy for message rate — no per-symbol throughput data exists yet to balance more precisely).
  Each shard runs its own connectors and cache; the parent process merges book/health/fee updates
  from all shards via IPC into the cache the API reads from. A CPU spike in one shard's connector
  doesn't add latency to another's (separate OS processes, not `worker_threads` sharing one event
  loop). Not benchmarked yet against real per-shard throughput — see Known gaps.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | liveness — is the process alive |
| GET | `/ready` | readiness — can it actually route yet. 503 until enough books are fresh, using the same staleness cutoff routing uses. Point deploy gates and load balancers here, not at `/health`: `/health` returns 200 from the first millisecond of boot, before any websocket has connected. Unauthenticated, like `/health`; reports counts, never venue names. |
| GET | `/version` | which commit is deployed — build provenance baked in at build time (authenticated) |
| GET | `/metrics` | Prometheus exposition (authenticated — it carries the venue list) |
| GET | `/exchanges/status` | per-exchange WS health: connected, last update age, update/reconnect counts |
| GET | `/symbols` | symbols currently cached |
| GET | `/orderbook/:exchange/:symbol` | cached L2 book snapshot (symbol URL-encoded, e.g. `BTC%2FUSDT`) |
| GET | `/route?from=&to=&amountIn=\|amountOut=` | book-walked, fee-adjusted route between two assets; multi-venue and multi-hop, optionally constrained to `balances` you hold. **503 `cache_cold`** while the process is not ready (see below) |
| POST | `/route` | the identical route, with the identical parameters, in a JSON body. **Use this when sending `balances`.** This service scrubs holdings from its own two logs, but a URL does not stay inside this process — nginx, an ALB and a CDN all log the full request line by default, and so do browser history and client-side tracing. None of that is reachable from here. GET stays the right call when you are not sending holdings. |
| WS | `/stream/route?from=&to=&amountIn=\|amountOut=` | the same route, pushed on book change (event-driven, not polled). Refuses to open while the cache is cold: one `cache_cold` frame, then close `1013` |

#### `503 cache_cold` — refusing to route on a half-filled cache

A restart rebuilds the entire order book cache, and for the minutes that takes the router holds
some of its venues and not others. It used to answer `/route` with a confident `200` throughout:
the venues that had connected were ranked, the winner returned, and nothing in the body said the
comparison was made against a fraction of the market. A caller could not tell that answer from a
warm one, so every deploy silently degraded execution instead of failing visibly.

`/route` (GET and POST) and `/stream/route` now refuse while the service is not ready — the exact
condition `/ready` reports, `freshCount < ORDER_ROUTER_MIN_FRESH_BOOKS_FOR_READY`, evaluated from
the same counters, so the probe and the router can never disagree:

```json
{
  "error": "the order book cache is still warming up; no route can be ranked yet",
  "reason": "cache_cold",
  "bookCount": 12, "freshCount": 0, "staleCount": 12,
  "minFreshBooksForReady": 1, "staleBookMs": 5000
}
```

HTTP `503` with `retry-after: 1`; the stream sends the same body as one frame and closes with
`1013` (try again later) rather than `1008`, because nothing is wrong with the request. Branch on
`reason`, not on the status: `cache_cold` means re-ask in a moment, unlike a `404` (wrong ticker)
or a `400` (bad request).

Three things deliberately stay outside the gate. `/health`, `/ready` and `/metrics` keep answering
— gating them would leave the service unable to report that it is not ready, and would take the
dashboards down during the one window an operator is watching them. Request validation still wins:
a malformed request gets its `400` cold or warm, because telling a caller to retry a typo is a
retry loop that can never succeed. And `/orderbook/:exchange/:symbol` is **not** gated: what makes
a cold `/route` wrong is that it *ranks across* the cache, where a missing venue silently changes
the winner; a single book is returned verbatim with its own `receivedAt`, and a half-filled cache
cannot make that answer wrong.

### Using `/route`

```bash
# "I want 1 BTC — spend as little USDT as possible, splitting across up to 3 venues"
curl -H "x-api-key: $KEY" \
  "$BASE/route?from=USDT&to=BTC&amountOut=1&strategy=split_capped&maxVenues=3"

# "I have 50,000 USDT — how much BTC do I end up with?"
curl -H "x-api-key: $KEY" "$BASE/route?from=USDT&to=BTC&amountIn=50000"

# "Convert SOL to BTC" — bridged automatically when no SOL/BTC market exists
curl -H "x-api-key: $KEY" "$BASE/route?from=SOL&to=BTC&amountIn=100"
```

There is no `side` parameter. Direction is derived: `from=USDT&to=BTC` is a buy of `BTC/USDT`,
`from=BTC&to=USDT` is a sell of the same market.

Supply **exactly one** of `amountIn` (how much of `from` you spend) or `amountOut` (how much of
`to` you want). Both, or neither, is a `400` — silently preferring one would turn a caller's typo
into a confidently wrong route. The two are genuinely different book traversals, not a unit
conversion: `amountIn` on a buy walks until the *money* runs out, `amountOut` walks until the
*size* is reached.

The response is a list of hops:

```jsonc
{
  "from": "USDT", "to": "BTC",
  "amountIn": 104812.4,      // what the route actually spends
  "amountOut": 1,            // what it actually produces
  "requestedAmount": 1,      // what you asked for
  "exactSide": "out",
  "effectiveRate": 9.541e-6, // BTC per USDT, after all fees and hops
  "hops": [{
    "pair": "BTC/USDT", "side": "buy", "base": "BTC", "quote": "USDT",
    "amountIn": 104812.4, "amountOut": 1,
    "legs": [ { "exchangeId": "binance", "amount": 0.7, "averagePrice": 104780.1, "takerFeeRate": 0.001, ... } ],
    "feeCost": 104.8, "feeCurrency": "USDT",
    "fullyFillable": true, "freshVenueCount": 41,
    "quotes": [ /* every venue considered, incl. stale ones — the "why these?" diagnostic */ ]
  }],
  "fullyFillable": true, "fillRatio": 1, "unroutableReason": null, "warnings": []
}
```

Three things to check before trading on a response:

- **`fillRatio` before `effectiveRate`.** On a partial fill the rate prices only the filled
  portion; reading it as the rate for your full size badly misprices the order.
- **`unroutableReason`.** An empty `hops` with a reason is a deliberate refusal to quote, not an
  error. `all_books_stale` is common on the illiquid tail at full-discovery scale.
- **`hops.length`.** More than one means the route was bridged: separate orders, separate
  execution risk, and fees reported per hop in that hop's own currency. There is no cross-hop fee
  total on purpose — adding USDT fees to BTC fees would be a meaningless number.

Bridged routes are solved **sequentially**, not jointly: hop 1's split is chosen without knowing
what hop 2 would prefer. That yields a good route, not a provably optimal one; joint optimisation
is a min-cost flow over the asset graph and is deliberately out of scope.

### Bridges are compared, not guessed

When more than one market path exists, the router solves **all** of them — the direct market plus
one two-hop route per asset in `bridges` — and takes the best. USDT is usually the deepest
intermediary, but "usually" is not "always", and a thin direct pair can easily be worse than going
around it. `pathsConsidered` reports every candidate with its output and its score, so the choice
is auditable the same way `quotes[]` makes the venue choice auditable.

A longer path must beat a shorter one by more than `hopPenaltyBps` per extra hop (default 5, capped
at 10000). A second order is a second chance for the price to move between fills, and that risk is
not in any order book — so a bridge that wins by a hair is not actually the better trade. Set
`hopPenaltyBps=0` to compare purely on rate.

Ranking never falls back to listing order. Because the penalty is a multiplicative discount clamped
at zero, a large enough penalty collapses every multi-hop score to exactly 0 — at which point score
alone cannot order anything. `comparePaths` therefore ranks on fillability, then on whether a path
produced anything at all, then score, then hop count, then raw output. The middle criterion is not
theoretical: without it a *dead* direct market tied a live bridged one at a high penalty, won on
listing order, and the whole request came back unroutable while `pathsConsidered` sat there listing
the working alternative.

### A bridged route never strands capital

If an early hop can consume everything you offered but a later hop cannot absorb what it produces,
the router cuts the earlier hop back to what the next one actually takes. Otherwise it would
recommend selling 10 SOL to buy 0.01 BTC and leaving 99 USDT parked in the bridge asset — a trade
nobody wants — and then report `fillRatio: 1` and `unfilledAmount: 0`, because only the pinned side
was ever measured. With the trim, the same request returns `amountIn: 0.1`, `fillRatio: 0.01`, and a
`partial_fill` warning whose percentage matches the numbers beside it.

The comparison costs real time: at full-discovery scale a single-candidate bridged route is 0.54ms
of compute, and two compared candidates 1.10ms. Both are far below the HTTP round trip, but the
work is not free, and `bridges=` (explicitly empty) turns it off entirely.

### Routing what you can actually fund

`balances` constrains the route to the money you hold, so what comes back is a plan you can
execute rather than one you would have to fund first.

```bash
# "I hold 40k USDT on binance and another 1k somewhere I haven't said — route 50k of it"
curl -H "x-api-key: $KEY" \
  "$BASE/route?from=USDT&to=BTC&amountIn=50000&balances=binance.USDT:40000,USDT:1000"
```

Entries are comma-separated `[<exchangeId>.]<ASSET>:<amount>`. The venue prefix is **optional**: a
bare `USDT:1000` is spendable anywhere ("I have not told you where it sits"), a qualified
`binance.USDT:40000` funds only binance's legs. Per-venue qualification is the point — you cannot
sell BTC on kraken because your BTC is on binance, and an asset-only constraint would keep
returning five-venue splits nobody can execute while looking like it had been checked.

It does two things, both **inside** the path solver:

- **Caps the source.** `amountIn` is clamped to what you hold before any candidate path is scored.
- **Budgets each venue.** During the book walk every venue can spend only what you have there, in
  that hop's spend asset — quote on a buy, base on a sell.

Both happen before `comparePaths` ranks, and that ordering is the whole feature. A size a thin
market could not absorb may be *fully fillable* once clamped, and a fully-fillable path outranks a
partial one — so the constraint changes **which path wins**, not just how big the winner is.
Applying it to the finished answer could only mutilate that answer; it could never reach back and
change the ranking. This is the same mistake the `comparePaths` tie-breaks above were added to
undo.

A shortfall **clamps** by default and `balanceMode=require` refuses instead, with
`unroutableReason: insufficient_balance` — the polarity matches `requireFullFill` being the opt-in
flag for "refuse rather than shrink". The ask itself is never rewritten: request 50,000 while
holding 40,000 and you get `requestedAmount: 50000`, `fillRatio: 0.8`, `fullyFillable: false` and
`balanceCapAmountIn: 40000`. Folding the clamp into `requestedAmount` would have made `fillRatio`
report a full fill on a route that leaves 10,000 of your intent unmet.

`require` covers every way the wallet can come up short, not only the one a whole-wallet total can
see before a book is walked: too little of the asset, the right total sitting on venues that do not
quote the pair (or that `exchanges` excludes), and the same on the `amountOut` side. It does not
second-guess the market — a shortfall caused by thin books is depth, not funding, and
`requireFullFill` is the flag for refusing that.

`requireFullFill` is measured against **your** number too. The clamp rewrites the size before any
book is walked, so a hop can fill its reduced target exactly while your request goes unmet; that
refuses as well, reported as `insufficient_balance` rather than `insufficient_depth` because the
wallet is the half you can do something about.

Three more things worth knowing:

- **Verify the echo before you execute.** `/route` declares its query type to Fastify with no JSON
  schema, so a server that predates this feature *ignores* `balances` and answers byte-identically
  to one that never received it. `balancesApplied` echoes back what was applied, canonicalised and
  key-sorted; a client that does not check it can trade a plan computed against a portfolio the
  server never saw.
- **Bounds reject, they do not truncate.** At most 64 entries and 4096 characters, and a duplicate
  key is a `400` rather than last-wins — a silently dropped entry is a route you cannot fund, which
  is the exact failure this exists to prevent. An explicitly empty `balances=` means you hold
  *nothing*, the same polarity `exchanges=` and `bridges=` already use; omit it for no constraint.
- **Nothing is logged.** The access line's URL is redacted and the audit record keeps the entry
  count, the mode and a truncated hash of the normalised string — never the amounts.

Per hop you get `fundedVenueCount` beside `venueCount` and `freshVenueCount` (a venue you hold
nothing on was neither filtered out nor stale, so folding it into either would make that counter
lie), and per leg `balanceLimited`, which separates a leg capped by your wallet from one capped by
the book. `fundedVenueCount` counts only venues a wallet could actually have funded — fresh, and
with depth on the side being traded — so it equals `freshVenueCount` when you send no balances.
Money on a stale venue is not funded capacity, and counting it as such made the router blame the
market for a wallet problem.

**What it deliberately does not do: seed a bridge.** Holdings in an intermediary asset are not
treated as extra supply at hop 2. Two independent reasons. A `RouteResult` carries one scalar
`amountIn` and defines `effectiveRate = amountOut / amountIn`, which is meaningless with two inputs
in different assets. And it collides head-on with the backward trim above, which re-solves hop 1
against what hop 2 actually took: the seeded amount would be attributed to hop 1's production and
cut hop 1 back for delivering it, possibly to zero. If you hold bridge inventory, ask for a second
route starting from that asset.

`/stream/route` **refuses** `balances` outright, closing with `1008`. A socket is held open for
minutes and there is no message channel on it to update the holdings it was opened with, so every
frame after the first would price a portfolio you may already have traded away. Refusing is honest;
silently pricing stale holdings is not.

### Price impact

Every hop reports `referencePrice` — the best fee-adjusted price available on **any** fresh
permitted venue for an infinitesimally small order — and `impactBps`, how much worse your actual
size executes. The route reports the end-to-end `referenceRate` and `impactBps` across all hops.

```jsonc
"hops": [{
  "pair": "BTC/USDT", "side": "buy",
  "referencePrice": 104780.1,   // best price anywhere, for a dust-sized order
  "impactBps": 3.1              // what your size actually cost you, in bps
}]
```

Positive always means worse, on both sides — no branching on `side` to interpret it. Fees and the
staleness penalty appear in *both* halves of the comparison and cancel, so what is left is purely
the cost of consuming depth. That is the number that answers "should I split this order, or shrink
it?" without walking the book yourself.

The benchmark is deliberately the best price *anywhere*, not the chosen venue's own top of book.
Using the latter would report zero impact for an order that demonstrably paid more than the best
available price, simply because the cheapest venue was too thin to use.

### Streaming

`GET /stream/route` takes the same query parameters as `GET /route` (bar `balances`, which it
refuses — see above) and pushes exactly the same body, recomputed whenever any market the route depends on moves — every leg of every candidate
path, so a bridged route does not miss half the price changes that alter its answer.

```bash
websocat "$BASE/stream/route?from=USDT&to=BTC&amountOut=1" -H "x-api-key: $KEY"
```

Both endpoints share one query parser, so they cannot disagree about what is valid. That is not a
tidiness choice: when they had separate parsing the streaming path skipped amount validation
entirely, and `amount=abc` became a `NaN` that defeated the book walk's termination check and
traversed every level of every book — repeatedly, on every update.

## Security

### API keys

Multiple named keys per user, stored hashed, created and revoked from the web console, with every
request in the log attributable to the key that made it.

One key per real consumer, named after it — the name is what shows up in every log line, so it
should identify who is calling, not what you hoped would call.

**Day to day, keys are managed in the dashboard** (`/router/dashboard`): create names a key and
shows its plaintext exactly once; revoke takes effect within about 10 seconds. Postgres holds the
rows; the router reads a projected snapshot and never holds a database credential. Both actions are
recorded in `admin_audit` with the actor, the key's display id and the client address.

The CLI covers only what a web UI cannot: the first admin account, before any login exists to
create one with, and the first key, before a dashboard session exists to mint one with.

```bash
npm run admin -- create-admin --email ops@example.com --password '<at least 12 chars>'
npm run admin -- create-key --email ops@example.com --name acme-desk --note "issued 2026-08-23"
  id    k_7f3a91c2ab34
  key   or_live_kQ8vN2pR7wZ3xL9mT4bY6cF1hJ5sD0aG8nV2eU7iO3x7Qa
  ! Shown once. Stored only as a digest.

npm run admin -- project               # force a projection, for debugging the router's snapshot
```

There is deliberately no `revoke` command: with Postgres holding the rows, a second writer to them
is a lost-update problem, and revocation is one click in the dashboard. To revoke a leaked key
without a browser, set `revoked_at` on its row and run `npm run admin -- project`.

`npm run admin -- project` prints which file it wrote, because the service takes that path from an
env file an interactive shell does not source — without that line an operator can administer a store
the running service never reads, and every key they mint looks fine while the API keeps returning
401. Set `ORDER_ROUTER_KEYS_FILE` in your shell to match the unit, or pass it inline.

Keys live in `keys.json` (`ORDER_ROUTER_KEYS_FILE`, mode 0600, atomic `rename` writes). Only the
SHA-256 digest is stored, so a leaked file yields no usable credential. A change is picked up
within 10 seconds by an mtime poll, or instantly with `systemctl reload order-router` — creating or
killing a key never costs a restart, which at discovery scale would rebuild the whole book cache
and degrade `/route` for minutes.

#### Retiring the shared key

`ORDER_ROUTER_API_KEY` is a migration bridge: it is loaded as a synthetic `k_legacy` record so the
old and new schemes work at once. It has no row in `api_keys` — the projector cannot select it, and
so cannot revoke it either. To retire it without a restart, write the tombstone into the key file:

```bash
# on the box, against ORDER_ROUTER_KEYS_FILE
jq '.keys += [{"id":"k_legacy","keyUuid":"","userId":"","name":"legacy-shared-key",
  "hash":"'"$(printf 0%.0s {1..64})"'","last4":"","note":"retired","rateLimitMax":null,
  "wsMaxConnections":null,"createdAt":"'"$(date -Is)"'","createdBy":"operator",
  "revokedAt":"'"$(date -Is)"'","lastUsedAt":null}]' /opt/order-router/keys.json > /tmp/keys.json
mv /tmp/keys.json /opt/order-router/keys.json
```

The router drops the key on its next 10-second poll, and the projector carries the tombstone across
its own rewrites rather than erasing it. Unsetting the variable in `/opt/order-router/env` is the
other half — do both, or the next restart brings the key back.

**Why unsalted SHA-256 and no KDF.** This looks wrong to password-storage instincts and isn't. The
secret is 256 CSPRNG bits, not a human-chosen password, so the offline-guessing attack a KDF
defends against does not exist; bcrypt would cost milliseconds against a ~300µs route computation.
More importantly a per-key salt would be actively harmful: salted hashes can't be looked up, forcing
an O(N) loop that reintroduces a "which key matched" timing signal and hands an attacker a
CPU-amplification lever. Unsalted digests are what make the lookup one hash and one `Map.get` —
constant-time by construction, flat in key count, and ~3x cheaper than the single-key `safeCompare`
it replaced (0.334µs vs 1.006µs).

**Why there is a CLI *and* an HTTP console.** This section used to argue that key creation must
never be an HTTP endpoint — that an admin endpoint has no non-circular answer to its own credential,
and is permanent privilege-escalation surface on :443. The console shipped anyway, and the argument
was answered rather than ignored, so here is what actually resolves it.

The circularity is broken by keeping exactly one credential out of band: `npm run admin --
create-admin` over SSH mints the first operator account, and every subsequent privilege comes from
a session on that account. Nothing on :443 can create an admin. The escalation surface is real and
is bounded deliberately: `/router/dashboard` mints and revokes keys **scoped by the `user_id` on the
session**, never by anything in the request body — taking the owner from the form would be a
textbook IDOR — and `/router/admin` is gated on `is_admin`, which only the CLI can set. Both
mutating routes are CSRF-checked and Origin-checked, and both write to `admin_audit`, because
minting a credential is one of the two events an incident review starts from.

The CLI is still the break-glass path and is the only way in when the database is reachable but the
console is not: `create-admin`, `create-key`, `project` (force a key projection) and `erase-user`.
The honest cost of the console existing is that a stolen operator session cookie now mints API keys,
where before it needed SSH. Session cookies carry the `__Host-` prefix and the admin page is gated
separately for that reason, but this is a trade the beta made in exchange for self-serve signup, not
a risk that was designed away.

Per-key overrides: `--rate-limit N` (own rate-limit bucket size) and `--ws-max N` (own concurrent
stream cap). Rate-limit buckets are keyed by the stable key id, never by the secret, so the secret
never lands in the limiter's LRU and a bucket survives key rotation.

**Revocation reaches live sockets.** A stream authenticates once, at upgrade, so revoking a key
closes its open `/stream/route` connections with 1008 rather than letting the feed run until the
client hangs up.

### Attribution

Every log line for a request carries `keyId` and `keyName`, bound in `childLoggerFactory` so they
appear on Fastify's own lines too.

**Two streams, two knobs.** Every record in the table below goes to the *audit* stream, which has
its own level (`ORDER_ROUTER_AUDIT_LOG_LEVEL`, default `info`) and is unaffected by `LOG_LEVEL`.
Everything else — connector chatter, reconnects, warnings — goes to the diagnostic stream that
`LOG_LEVEL` governs. The production box runs `LOG_LEVEL=warn` because a misbehaving exchange once
wrote 930MB of retry chatter, and quieting that must not silence the record of who called what.

The two used to be entangled: the per-request child logger was forced up to the audit level, which
also raised Fastify's built-in `incoming request` / `request completed` pair, so `LOG_LEVEL=warn`
reduced per-request volume by nothing at all. It is no longer levelled up, so `warn` now genuinely
quiets the diagnostic stream while every row below still lands.

Logs must be JSON for any of the queries below to work, which means `NODE_ENV=production` (otherwise
`pino-pretty` engages). Worth asserting in a deploy check. `keyId: null` on an unauthenticated request is deliberate — it
makes failed auth greppable as a first-class thing rather than as an absent field.

| Event | Emitted on |
|---|---|
| `request` | every request, including `/health`, 401s and 404s |
| `route_recommendation` | every `/route` answer **and every frame `/stream/route` pushes**, self-contained for a billing or "why there?" dispute. On a stream each pushed frame is its own record under its own `requestId`, matching the `requestId` in the frame the caller received; pushes are floored by `ORDER_ROUTER_WS_MIN_PUSH_INTERVAL_MS`, so the rate is bounded at 1/floor per socket |
| `stream_open` / `stream_close` | WS lifecycle, with `durationMs` |

Every row above goes to the **audit** file, `ORDER_ROUTER_AUDIT_LOG_FILE`. Read the queries below
against that path, not the diagnostic log: with the audit file configured — which the deployment
sets — none of these events is in `router.log` at all, so the same commands pointed there return
nothing and read as "this key made no requests", which is the most misleading answer available.

```bash
# every request a key made, last 7 days
zcat -f "$ORDER_ROUTER_AUDIT_LOG_FILE"* \
  | jq -c 'select(.keyId=="k_7f3a91c2" and .event=="request")'

# who is hammering us
zcat -f "$ORDER_ROUTER_AUDIT_LOG_FILE"* \
  | jq -r 'select(.event=="request") | .keyName // "unauthenticated"' | sort | uniq -c | sort -rn
```

With no audit file set the router falls back to the single diagnostic stream, and the same queries
work against `/var/log/order-router/router.log*` instead.

The raw key never reaches the logs. That's enforced four ways: nothing retains the plaintext past
the digest, pino redacts `x-api-key` and `authorization`, 401 bodies never echo what was presented,
and a test drives every endpoint with a known key and asserts the captured output contains neither
it nor its hash. No `keyId` label goes on any Prometheus series — that's the same unbounded
cardinality trap the codebase already avoids for `/orderbook/:exchange/:symbol`.

### Still not an identity system

No scopes, no expiry, no quotas. Signup is self-serve, and an account is one undifferentiated
level of access with exactly one exception: `is_admin`, which only the CLI can grant.

The *API* is read-only — every endpoint an API key reaches is a GET that computes a recommendation
and places no orders — so there is nothing for key scopes to separate yet, and a
stored-but-unenforced `scopes` field would be worse than none (the loader rejects one outright
rather than ignoring it). The *console* is not read-only: a session cookie mints and revokes API
keys at `/router/dashboard`, and an admin session reads every user's email, plan and usage at
`/router/admin`. Those are session-authenticated routes, not key-authenticated ones, which is why
key scopes would not constrain them anyway — the missing granularity there is a role model, and
there are two roles. See `docs/product-plan.md` for the design the
service actually implements, and `docs/auth-plan.md` for the reasoning behind the key format and
the lookup path — its storage decisions were replaced by product-plan §3, and its header says so.

## MCP server (`src/mcp/`)

A separate process (`npm run mcp` / `npm run mcp:dev`) exposing the same public endpoints as MCP
tools over the [Streamable HTTP transport](https://modelcontextprotocol.io/), so an MCP client
(Claude Code, Claude Desktop, etc.) can query the router directly. It's a thin proxy — `src/mcp/tools.ts`
just calls the router's own REST API (`ORDER_ROUTER_API_URL`, default `http://localhost:8080`) —
not a second implementation of the routing logic, so its behavior is exactly the REST API's
behavior. Runs on its own port (`ORDER_ROUTER_MCP_PORT`, default `8081`) and its own process,
decoupled from the router's hot path — an MCP client's traffic never touches the router's
in-memory cache or event loop directly.

| Tool | Maps to |
|---|---|
| `get_health` | `GET /health` |
| `get_exchanges_status` | `GET /exchanges/status` |
| `list_symbols` | `GET /symbols` |
| `get_order_book` (`exchange`, `symbol`) | `GET /orderbook/:exchange/:symbol` |
| `route_order` (`from`, `to`, `amountIn`\|`amountOut`, …) | `GET /route?from=&to=&…` |

Run both together:

```bash
npm run build
node dist/index.js &                          # router on :8080
ORDER_ROUTER_API_URL=http://localhost:8080 node dist/mcp/server.js &  # MCP on :8081
```

or `docker compose up --build`, which starts both as separate containers on the same network
(the MCP container points `ORDER_ROUTER_API_URL` at the router container's Docker DNS name).

To connect from an MCP client: add an HTTP MCP server pointed at `http://<host>:8081/mcp`. Verified
live end-to-end (real `Client`/`StreamableHTTPClientTransport` from `@modelcontextprotocol/sdk`
against a running router with live exchange data) during development — not just the unit tests.

## Config (env vars)

| Var | Default | Notes |
|---|---|---|
| `PORT` | `8080` | |
| `ORDER_ROUTER_DISCOVER_ALL` | `false` | `true` = dynamically discover all exchanges/routable symbols (see Discovery above). `false` = use the explicit lists below. |
| `ORDER_ROUTER_EXCLUDE_EXCHANGES` | (none) | Comma-separated exchange ids to skip, discovery or explicit mode. |
| `ORDER_ROUTER_MIN_EXCHANGES_PER_SYMBOL` | `2` | Discovery mode only — symbol must trade on this many exchanges to be routable. |
| `ORDER_ROUTER_LOAD_MARKETS_CONCURRENCY` | `8` | Discovery mode only — bounded concurrency for the loadMarkets() fan-out. |
| `ORDER_ROUTER_MAX_SYMBOLS_PER_SUBSCRIPTION` | `50` | Max symbols per `watchOrderBookForSymbols` chunk. |
| `ORDER_ROUTER_MAX_SYMBOLS_PER_EXCHANGE` | (none) | Per-exchange total-symbol cap, e.g. `"coinbase:25"`. See Subscription mechanics above. |
| `ORDER_ROUTER_SHARD_COUNT` | `1` | `>1` forks that many child-process shards across the (discovered or explicit) exchange list. |
| `ORDER_ROUTER_EXCHANGES` | `kraken,coinbase,kucoin,bitget,gate` | Explicit mode only. |
| `ORDER_ROUTER_SYMBOLS` | `BTC/USDT,ETH/USDT` | Explicit mode only. |
| `ORDER_ROUTER_STALE_BOOK_MS` | `5000` | Quotes from books older than this are excluded from ranking. |
| `ORDER_ROUTER_API_KEY` | (none) | Legacy single shared key, honoured as `k_legacy` for migration. There is no longer a default: the old `dev-local-key-change-me` fallback is **refused** unless a caller explicitly opts in, because a deployment that forgot to set a key used to start and serve happily. |
| `ORDER_ROUTER_RATE_LIMIT_MAX` | `600` | Requests per window, per API key. |
| `ORDER_ROUTER_RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window. |
| `ORDER_ROUTER_WS_MAX_CONNECTIONS_PER_KEY` | `50` | Max concurrent `/stream/route` sockets per API key. Overridable per key with `--ws-max`. |
| `ORDER_ROUTER_WS_MIN_PUSH_INTERVAL_MS` | `100` | Floor between two pushes on one stream socket. |
| `ORDER_ROUTER_KEYS_FILE` | `./data/keys.json` | API key store. Digests only; mode 0600. |
| `ORDER_ROUTER_KEYS_RELOAD_POLL_MS` | `10000` | How often to stat the key file for changes. |
| `ORDER_ROUTER_AUDIT_LOG_LEVEL` | `info` | Level for the audit stream — the `request`, `route_recommendation`, `stream_open` and `stream_close` records. Independent of `LOG_LEVEL`, which governs the diagnostic stream only. |
| `ORDER_ROUTER_WS_IDLE_TIMEOUT_MS` | `30000` | Heartbeat interval; a socket that misses two beats is terminated. Must stay below the reverse proxy's `proxy_read_timeout`. |
| `ORDER_ROUTER_TRUST_PROXY` | `0` | How many reverse-proxy hops sit in front of this service. `0` trusts no `X-Forwarded-For` at all; `1` (also spelled `true`) believes only the address your own edge appended; `2` for a CDN in front of nginx. Never set it higher than the number of proxies you actually control — each extra hop hands one more entry of a client-written header to the rate limiter and the audit log. See "Deploying behind nginx". |
| `ORDER_ROUTER_ALLOW_DEV_KEY` | `false` | Arms the built-in development API key (`dev-key`). Off unless set to `true`, on every host, regardless of `NODE_ENV` — a deployment that forgets to set `NODE_ENV=production` must not thereby publish an unauthenticated door. Local development only. |
| `ORDER_ROUTER_MIN_FRESH_BOOKS_FOR_READY` | `1` | Fresh books `/ready` insists on before reporting the process able to route. `1` rather than `0` because `0` makes it a second liveness probe; raise it if "ready" should mean most of your coverage. |
| `ORDER_ROUTER_MAX_BOOK_DEPTH` | `500` | Levels kept per side. Also what the connector asks the VENUE for, so on venues with a depth-limited channel the rest is never sent. A venue that refuses the limit is subscribed to without one. |
| `ORDER_ROUTER_TOP_SYMBOLS` | `50` | Discovery mode only — how many symbols to keep, ranked by the liquidity reference below. |
| `ORDER_ROUTER_LIQUIDITY_REFERENCE` | `binance,okx` | Discovery mode only — venues whose volume ranks the symbol universe. |
| `ORDER_ROUTER_STALENESS_PENALTY_BPS` | `1` | Score penalty per unit of book age, in bps. |
| `ORDER_ROUTER_HOP_PENALTY_BPS` | `5` | Score penalty per extra hop, in bps — what stops a bridge winning on paper by a margin smaller than its own execution risk. |
| `ORDER_ROUTER_REBALANCE_AFTER_MS` | `0` | One-shot shard rebalance this long after boot. `0` = off, which is the default because on, it stopped every shard two minutes in — including shards whose assignment had not changed — and `/route` answered `all_books_stale` until the cache rewarmed. |
| `ORDER_ROUTER_REBALANCE_MIN_IMBALANCE` | `1.5` | Ratio between the busiest and quietest shard below which a rebalance is not worth the reconnect. |
| `ORDER_ROUTER_SHARD_START_CONCURRENCY` | `2` | How many exchanges start concurrently **within one shard**. Not the number of shards, which is `ORDER_ROUTER_SHARD_COUNT`: raising this on that reading rebuilds the startup memory peak the heap ceiling exists to hold. |
| `ORDER_ROUTER_SHARD_MAX_OLD_SPACE_MB` | `1024` | `--max-old-space-size` for each shard child process. |
| `ORDER_ROUTER_AUDIT_LOG_FILE` | (none) | Where the per-request audit stream is written. Required for the Postgres ingester to have anything to ship. Rotate it with `create`, **not** `copytruncate` — see the ingester's warning. |
| `DATABASE_URL` | (none) | Postgres, for usage records and the key/user tables. The ROUTER never holds this: only the ingester, the key projector and the web console connect. |
| `ORDER_ROUTER_DB_POOL_MAX` | `10` | Postgres pool size. |
| `ORDER_ROUTER_INGEST_INTERVAL_MS` | `5000` | How often the audit log is shipped into Postgres. |
| `ORDER_ROUTER_KEY_PROJECTION_INTERVAL_MS` | `5000` | How often the key file is re-projected from Postgres. |
| `ORDER_ROUTER_WEB_PORT` | `8090` | Web console port. |
| `ORDER_ROUTER_WEB_HOST` | `127.0.0.1` | Web console bind address. Loopback by default: put the console behind the same proxy as the API rather than exposing it. |
| `ORDER_ROUTER_WEB_BASE` | `/router` | Path prefix the console is mounted at. |
| `ORDER_ROUTER_WEB_SECURE_COOKIES` | `true` | `Secure` on the session cookie. Only set `false` for local HTTP development. |
| `ORDER_ROUTER_WEB_ORIGINS` | `https://docs.ccxt.com` | Origins accepted on console form POSTs — the second CSRF leg, alongside the token. |
| `ORDER_ROUTER_CSRF_SECRET` | (random per boot) | Signs console CSRF tokens. Unset means forms in flight across a restart are rejected; set it to keep them valid, and to keep multiple console processes agreeing. |
| `LOG_LEVEL` | `info` | Level for the diagnostic stream: connector chatter, reconnects, warnings, and Fastify's own per-request pair. Does **not** affect the audit records — see `ORDER_ROUTER_AUDIT_LOG_LEVEL`. |

## Run

```bash
npm install
npm run dev        # tsx watch, explicit exchange/symbol list (fast local iteration)
# or
npm run build && npm start
# or full discovery + sharding, e.g. 4 shards:
ORDER_ROUTER_DISCOVER_ALL=true ORDER_ROUTER_SHARD_COUNT=4 npm start
# or
docker compose up --build
```

Sharding (`ORDER_ROUTER_SHARD_COUNT>1`) forks compiled `dist/sharding/shardWorker.js` — build first
(`npm run build`) before using it; `npm run dev` (tsx) does not support sharding today.

## Testing

```bash
npm test    # node:test via tsx, no network required
```

All offline — no live exchange connections, no mocked `fetch` (HTTP-touching code is tested
against real local fixtures: `node:http` servers for the MCP proxy layer, Fastify's `inject()` for
the REST API, a scripted pool for the console's database reads). `npm test` prints the count; a
number written down here would be wrong within a week, and the one that used to be here was wrong
by 6x. What matters is the coverage, and `src/docs.test.ts` asserts this table names every test
file that exists — so a new area cannot be added without a row.

| Area | File | What's covered |
|---|---|---|
| Book-walking / fee ranking | `src/routing/route.test.ts` | VWAP across levels, fee-adjusted ranking beats raw-price ranking, partial fills, buy vs. sell side, stale-book exclusion |
| Path selection | `src/routing/pathSelection.test.ts` | direct vs. bridged routes, hop penalties, unroutable pairs |
| Price impact | `src/routing/impact.test.ts` | impact in bps against the reference price, per-hop and whole-route |
| Balance-capped routing | `src/routing/balances.test.ts` | the balances grammar, entry/character caps, cap vs. require modes |
| Market resolution | `src/routing/market.test.ts` | symbol parsing, market lookup, base/quote orientation |
| In-memory cache | `src/cache/orderBookCache.test.ts` | get/set, per-symbol event scoping, health lifecycle, unknown-exchange no-ops |
| Fee registry | `src/cache/feeRegistry.test.ts` | fallback, per-(exchange,symbol) scoping, event emission (used for shard IPC) |
| Symbol universe filtering | `src/discovery/symbolUniverse.test.ts` | the ≥N-exchange routability rule, threshold edge cases, empty input |
| Connector helpers | `src/connectors/exchangeConnector.test.ts` | `chunkSymbols`/`normalizeLevels`, permanent vs. recoverable errors, crossed books, resync backoff, orphan reaping |
| Shard load-balancing | `src/sharding/orchestrator.test.ts` | every exchange assigned exactly once, greedy balance, shard-count edge cases |
| Bounded connector startup | `src/connectors/startConcurrently.test.ts` | the admission limit that bounds the startup memory peak, in both single-process and shard mode |
| Shard IPC backpressure | `src/sharding/ipcSend.test.ts` | idempotent snapshots dropped on a full pipe, rare messages never dropped, flush recovery |
| Single-process startup | `src/index.startup.test.ts` | that the default (unsharded) path applies the same startup-concurrency and depth limits the shard path has |
| Shard lifecycle | `src/sharding/shardWorker.lifecycle.test.ts` | the disconnect handler is registered before any connector starts |
| REST API | `src/api/server.test.ts` | every HTTP route via Fastify `inject()` against a real in-memory cache |
| Query parsing | `src/api/routeQuery.test.ts` | the parser both /route verbs share: types, caps, repeated parameters, enum flags |
| Authentication | `src/api/auth.test.ts`, `src/api/auth.integration.test.ts` | key lookup, 401 shapes, no key or hash in any log line |
| Key store | `src/api/keyStore.test.ts` | the snapshot file: atomic writes, digests only, mtime reload |
| Rate limiting | `src/api/rateLimiter.test.ts` | per-key buckets, `/health` exemption |
| Key projection | `src/db/keyProjection.test.ts` | revocation vs. a lost database, Postgres outages leaving the snapshot intact |
| Usage ingest | `src/db/ingest.test.ts` | cursor handling, unparseable addresses, partition rollover, paired records |
| Admin audit | `src/db/adminAudit.test.ts` | what is written, `inet` safety, a failed write never failing the action |
| Schema migrations | `src/db/migrations.test.ts` | numbering, an edited migration refused, a database ahead of the build refused, rollback on failure |
| Ingest/projector runner | `src/db/runner.test.ts` | the key projector still running with no audit log configured, a throwing projection counted rather than swallowed |
| Ingest health | `src/db/ingestHealth.test.ts` | staleness budgets, a stopped projector reported while ingest succeeds, `/health` 503 naming the stale loop |
| Erasure | `src/db/erasure.test.ts` | scrub-then-delete ordering across the event tables, all-or-nothing rollback |
| Backup pruning | `src/cli/backup.test.ts` | dump naming, the retention floor, never deleting another service's dumps |
| Web console | `src/web/home.test.ts`, `src/web/reveal.test.ts`, `src/web/keyAudit.test.ts`, `src/web/authGuards.test.ts` | security and cache headers, the one-time key reveal, key-lifecycle audit rows, cookie prefixes |
| Metrics | `src/metrics.test.ts` | every gauge's label set and collect path |
| Config | `src/config.test.ts`, `src/config.docs.test.ts` | parsing and defaults, and that every env var is documented |
| Docs and packaging | `src/docs.test.ts`, `src/openapi.test.ts`, `src/packaging.test.ts` | README/CLI/systemd/workflow drift, the OpenAPI spec's two /route verbs, the Dockerfile's COPY set |
| Exchange metadata | `src/exchangeMeta.test.ts` | the certified-venue list and its shape |
| MCP proxy layer | `src/mcp/tools.test.ts` | URL construction, error propagation, against a real local HTTP fixture |
| MCP protocol | `src/mcp/server.test.ts` | real `Client`/`McpServer` over `InMemoryTransport` — tool listing, tool calls, Zod input validation surfacing as MCP tool errors |

Not covered by unit tests (needs live exchanges, covered by manual verification during
development instead — see git history / PR description): `ExchangeConnector`'s actual WS
lifecycle (reconnect/backoff/jitter against a real socket), discovery's `loadMarkets()` network
calls, and sharding's actual `child_process` IPC (verified live, not by an automated test, since
that requires spawning real subprocesses with real network access).

## Deploying behind nginx on a VPS

nginx terminates TLS, so the service does not do TLS itself and there is no certificate handling in
this codebase.

**The config that runs is [`docs/deploy/nginx/docs.ccxt.com-router.conf`](docs/deploy/nginx/docs.ccxt.com-router.conf).**
Read that file rather than reconstructing a server block from the prose below: it is the real path
layout, with the comments explaining why each location is shaped the way it is. What was here
before was a plausible-looking `server_name router.example.com` block with `location /` and
`location /stream/`, and production has never had that shape — an operator who pasted it got a
router on a hostname that does not exist, proxying paths the app does not serve.

The service does not own a hostname. It lives under `docs.ccxt.com`, on a VM whose nginx also
fronts CCXT's own site and two other deploy pipelines, so the router's config is an **include**
inside that shared server block, not a server block of its own. The practical consequence is worth
stating plainly: `nginx -t` failing on the router's snippet takes those two unrelated deploys down
with it. Test before every reload.

The paths, per [`docs/product-plan.md`](docs/product-plan.md) §2:

| Public path | Upstream | Prefix handling |
|---|---|---|
| `docs.ccxt.com/router/` | console, `127.0.0.1:8090` | passed through — the app serves its own `/router` prefix (`ORDER_ROUTER_WEB_BASE`) |
| `docs.ccxt.com/router/api/` | router, `127.0.0.1:8080` | **stripped** — the API is mounted at the root of its process |
| `docs.ccxt.com/router/api/stream/` | router, `127.0.0.1:8080` | stripped, plus the WS upgrade headers |

Getting those two prefix rules backwards is the easy mistake, and it fails asymmetrically: every
console link 404s while every API route quietly resolves one segment deep.

Three things must be configured or the deployment is subtly broken.

**1. Bind to loopback.** Set `HOST=127.0.0.1` (default is `0.0.0.0`). Otherwise the service is
reachable directly on port 8080, bypassing nginx and therefore bypassing TLS — the API key would
cross the wire in cleartext to anyone who skips the proxy.

**2. Set `ORDER_ROUTER_TRUST_PROXY=1`.** The rate limiter buckets failed-auth attempts by client
IP. Behind a proxy every request arrives from nginx's address, so without this **all
unauthenticated traffic shares one bucket** and one abuser throttles every other client's
legitimate retries.

The value is a **hop count, not a boolean**, and that distinction is the whole security property.
`X-Forwarded-For` is a list, appended to left-to-right, so its leftmost entry is whatever the
original client wrote and its rightmost entries are what each proxy observed. Trusting the list as
a whole — which is what Fastify's `trustProxy: true` does — returns that leftmost, client-authored
entry as `request.ip`, so a caller sending `X-Forwarded-For: 1.2.3.4` mints a fresh rate-limit
bucket per request and writes its own identity into the audit log. A hop count instead walks back
exactly N entries from the right, landing on the address *your own edge* appended. Set it to the
number of proxies you actually control: `1` for nginx alone, `2` for a CDN in front of nginx, `0`
(the default) when nothing is in front. `true` is still accepted and means `1`.

nginx must also overwrite the header rather than pass a client value through
(`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`, as the shipped config does).

**3. Keep the WS heartbeat under `proxy_read_timeout`.** nginx closes an idle upstream connection
on its own timer (default 60s). `ORDER_ROUTER_WS_IDLE_TIMEOUT_MS` now defaults to 30s for that
reason, and the shipped config sets `proxy_read_timeout 120s` on the stream location. If you raise
one, raise the other. This bug hides on liquid pairs — a busy book keeps the connection full of
real data — and only appears on quiet symbols, where the stream silently drops about once a minute.

**4. The readiness gate.** The shipped config runs an `auth_request` subrequest against the app's
own `/ready` in front of `/router/api/` and `/router/api/stream/`, so a cold instance is taken out
of rotation instead of served through — with more than one instance behind the upstream, that is
the difference between a slow deploy and a degraded one. nginx OSS has no active health checks, so
this is the mechanism available; the subrequest is a loopback call to a handler that reads two
counters. `auth_request` turns any non-2xx that is not 401/403 into a `500`, so the config catches
that with `error_page 500 = @router_cache_cold` and re-shapes it into the same `503 cache_cold`
body the app returns (`proxy_intercept_errors` is off by default, so a real `500` from the app is
passed through untouched). `/router/api/health`, `/ready` and `/metrics` are exact-match locations
with `auth_request off`: the probes must answer while the gate is refusing everything else.

**No IP allowlist on `/metrics`.** This section used to suggest one (`allow 10.0.0.0/8; deny all;`)
and it cannot be used as written: `/metrics` is authenticated in the app like every other
non-`/health` route, the CI live-integration job asserts against it from GitHub-hosted runners with
no fixed egress range, and there is no scraper network on this box to allow. The key is the access
control. Add the allowlist if and when a scraper runs off-box from a stable address — one that has
to be widened to `0.0.0.0/0` during the first incident is worse than none, because it reads like
protection.

nginx also gives you a second, IP-level rate limit (`limit_req_zone`, commented into the shipped
config) in front of the app's per-key limit, and can enforce client certificates if you want a
second factor. What it does **not** solve is anything about identity inside the app: see
"Still not an identity system" for what per-key auth does and does not give you.

## Deploying from CI

`.github/workflows/order-router.yml` deploys to the VPS behind `docs.ccxt.com` on every push to
`master` that touches `order-router/**`, and on `workflow_dispatch`. Four jobs, in order:

| Job | Runs when | What it does |
|---|---|---|
| `build-and-test` | every push, PR and dispatch | `npm ci`, `npm run build`, `npm run check:ccxt-pin`, `npm test`, then boots the real router and MCP processes and asserts over HTTP |
| `deploy` | **only** dispatch, or a push to `master`, and only in the repo that owns the VM | builds an arm64 release, **runs `npm test` on that tree**, tars it over ssh into a per-run staging directory and renames that into `/opt/order-router/releases/<sha>`, swaps the `current` symlink, restarts the unit, waits for `/ready`, smoke-tests it on loopback, and auto-rolls-back if the smoke fails |
| `live-integration` | after `deploy` | runs `scripts/live-integration.mjs` against the **public** URL — through nginx and TLS, exactly as a customer reaches it |
| `rollback` | only if `deploy` succeeded and `live-integration` failed **on its assertions** (`verdict == failed`) | puts `/opt/order-router/previous` back, restarts, and fails the run |

`deploy` runs the suite a second time on purpose. `build-and-test` runs on x64; `deploy` rebuilds
from scratch on arm64 and it is *that* tree which is packed and shipped, so without it the artifact
reaching production is one no test has ever touched.

`rollback` keys on the verdict `live-integration` publishes, not on whether that job went red. A
missing, rotated or revoked `ORDER_ROUTER_SMOKE_API_KEY` fails every authenticated check in the
script while saying nothing about the release; rolling back on it reverts a healthy deploy and
restarts the router twice, each restart rebuilding the whole book cache. The script exits **2** for
that case (see below) and the job records `verdict=misconfigured`; the run still goes red, and the
box is left alone.

`deploy` and `rollback` share a `concurrency` group so that two runs never mutate the box at once.
It is declared **on those two jobs**, not on the workflow: a workflow-level group would queue every
PR's `build-and-test` behind a production deploy, and GitHub cancels a *pending* run when a newer
one queues into an occupied group — a PR would show a cancelled required check it never got to run.

`rollback` checks the repository out even though it builds nothing. The workflow sets
`defaults.run.working-directory: order-router`, and a `run:` step whose working directory does not
exist fails before bash starts, so without the checkout every step in that job — the rollback
included — dies at the OS level while the run stays red for the earlier failure.

Re-deploying a SHA that is already live is safe: the tarball is unpacked into
`releases/.incoming-<run id>` and renamed over the release directory, so the tree the running unit
is executing from is never deleted before its replacement exists. `previous` is not repointed when
it would land on the release being deployed — a rollback that cannot move says so instead of
reporting success while the bad build stays up.

**The deploy job never runs on a `pull_request`.** The workflow triggers on PRs, so the guard is
what keeps the deploy key off that path:

```yaml
if: >-
  github.repository == 'pcriadoperez/ccxt' &&
  (github.event_name == 'workflow_dispatch' ||
   (github.event_name == 'push' && github.ref == 'refs/heads/master'))
```

GitHub also withholds secrets from fork PRs, but that is a property of the platform rather than of
this file. Note the repository name — a fork that copies `ccxt/ccxt` from the sibling deploy
workflows gets a deploy job that silently never runs. A push to `main` builds but does not deploy;
`master` is the deploy branch.

### Why tar over ssh and not a container

The other two deploy workflows in this repo (`deploy-playground.yml`, `docs-fumadocs.yml`) build an
image, push it to GHCR and have the box pull it. This service cannot use that flow yet: it runs as a
**systemd unit**, not a container. (The Dockerfile builds again — it was missing `COPY openapi`
and `COPY scripts`, which `copy-assets` and `build:info` read — but the box runs the unit, not an
image.) The box also has no `rsync`. `tar czf - | ssh 'tar xzf -'` needs nothing on the far end but `ssh` and `tar`.

`node_modules` ships **with** the tarball, pruned to production deps. The runner is
`ubuntu-24.04-arm`, the same architecture as the box, so the tree is portable — and the box (7.5 GB,
shared with the docs and playground containers) never has to run an install.

### GitHub secrets you must create

Five repository secrets in **`pcriadoperez/ccxt`** (Settings → Secrets and variables → Actions →
New repository secret). Forks do **not** inherit secrets from upstream, so the `DOCS_DEPLOY_*` names
that appear in the other deploy workflows have no values here — these must be created fresh even
though the box is the same one.

| Secret | What it is | How to produce it |
|---|---|---|
| `ORDER_ROUTER_DEPLOY_SSH_KEY` | **Private** ssh key authorised on the box. Deploy-only, not your personal key. | `ssh-keygen -t ed25519 -C order-router-deploy -f ~/.ssh/order-router-deploy -N ''` then append the **public** half to the box: `ssh-copy-id -i ~/.ssh/order-router-deploy.pub root@<host>`. Upload the private half: `gh secret set ORDER_ROUTER_DEPLOY_SSH_KEY -R pcriadoperez/ccxt < ~/.ssh/order-router-deploy` |
| `ORDER_ROUTER_DEPLOY_KNOWN_HOSTS` | The box's host key, pinned. **Not optional** — it is what makes the connection MITM-resistant instead of trusting whatever answers. | `ssh-keyscan <host> \| gh secret set ORDER_ROUTER_DEPLOY_KNOWN_HOSTS -R pcriadoperez/ccxt` (run it from a network you trust, once, and verify the fingerprint against `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the box) |
| `ORDER_ROUTER_DEPLOY_HOST` | Hostname or IP of the VM. | The address `docs.ccxt.com` resolves to — `dig +short docs.ccxt.com A` |
| `ORDER_ROUTER_DEPLOY_USER` | SSH user. `root` works; a dedicated `deploy` user with `NOPASSWD` sudo limited to `systemctl restart order-router` is strictly better, and the remote script already falls back to `sudo` when it is not uid 0. | — |
| `ORDER_ROUTER_SMOKE_API_KEY` | A router API key used **only** by the two post-deploy test steps. | Mint a dedicated one in the dashboard, or on the box: `node /opt/order-router/current/dist/cli/admin.js create-key --email <admin-email> --name ci-smoke`. Copy the `or_live_…` it prints once: `gh secret set ORDER_ROUTER_SMOKE_API_KEY -R pcriadoperez/ccxt` |

**Do not put the production shared key (`ORDER_ROUTER_API_KEY` in `/opt/order-router/env`) in GitHub.**
Mint a dedicated one instead: only its SHA-256 digest is stored, revoking it from the dashboard
takes effect within ~10s with no restart (which at discovery scale would rebuild the whole book
cache), and the blast radius of a leaked Actions secret is then one revocable key rather than every
caller's credential. Box-only secrets
stay box-only — the same rule the playground and docs deploys follow for their own API keys.

Nothing else is a secret. The base URL the live tests hit (`https://docs.ccxt.com/router/api`) is
in the workflow in the clear, because it is the address customers already use.

### One-time setup on the box

**The files are in the repo: [`docs/deploy/`](docs/deploy/).** The three units, an env-file
template, the nginx snippet, the logrotate config and the Prometheus scrape and rules all live
there as real files. What follows quotes the load-bearing lines of them inline, because an operator
pasting a unit onto a box should not have to open a second file to learn which lines matter — but
`docs/deploy/` is the source of truth, and the copies here are checked against it by
`src/docs.test.ts`.

Be clear about what versioning them does and does not buy. It makes a config change reviewable: it
gets a diff and a reviewer instead of being an ssh session nobody saw. It does **not** make a
rollback restore config — the release tarball is still code only, and the activate step still
installs nothing — so a rollback restores `dist` and leaves whatever is in `/etc/systemd/system`
untouched, and a change made directly on the box still drifts silently from what is here.
[`docs/deploy/README.md`](docs/deploy/README.md) has the exact workflow change that would close
that.

The deploy assumes a release-dir layout and a `current` symlink. Create it once, **before** the
first CI deploy, or the swap and the rollback have nothing to swap:

```bash
mkdir -p /opt/order-router/releases
# move whatever is deployed today into a release dir and point `current` at it
mv /opt/order-router/dist /opt/order-router/releases/bootstrap/dist   # + node_modules, package.json
ln -sfn /opt/order-router/releases/bootstrap /opt/order-router/current
```

Then repoint the unit at the symlink and pin every piece of **state** to a path outside the release
dir — anything living inside a release is silently discarded on the next deploy:

```ini
# /etc/systemd/system/order-router.service
WorkingDirectory=/opt/order-router/current
ExecStart=/usr/bin/node /opt/order-router/current/dist/index.js
EnvironmentFile=/opt/order-router/env
# The crash handlers log, flush and exit non-zero ON PURPOSE, on the assumption that something
# restarts the process. Without this line that assumption is false and the first unhandled
# rejection ends the service until someone notices.
Restart=on-failure
RestartSec=2
# What makes `systemctl reload order-router` a key reload rather than an error: the process
# reloads keys.json on SIGHUP (src/index.ts). Without it, reload fails and the only way to pick
# up a revocation early is a restart, which rebuilds the whole book cache.
ExecReload=/bin/kill -HUP $MAINPID
```

```bash
# /opt/order-router/env — SHARED by all three units. keys.json defaults to ./data/keys.json, i.e.
# inside the release, so it is pinned outside; and the three processes have to agree on the path or
# the projector writes a file the router never reads.
ORDER_ROUTER_KEYS_FILE=/opt/order-router/keys.json
ORDER_ROUTER_AUDIT_LOG_FILE=/var/log/order-router/audit.log
DATABASE_URL=postgres://order_router@localhost/order_router
```

### The other two units

The shipped system is **three** processes, not one, and the deploy restarts all three
(`EXTRA_SERVICES` in the workflow). The router alone cannot authenticate a single request: it reads
a projected key snapshot, and the process that WRITES that snapshot is the ingest runner. A box
built from the router unit alone answers 401 to every caller and nothing in the logs explains why.

```ini
# /etc/systemd/system/order-router-web.service — the console at /router: signup, login, key
# minting and revocation. Needs DATABASE_URL; the router deliberately does not have it.
WorkingDirectory=/opt/order-router/current
ExecStart=/usr/bin/node /opt/order-router/current/dist/web/index.js
EnvironmentFile=/opt/order-router/env
Restart=on-failure
RestartSec=2
```

```ini
# /etc/systemd/system/order-router-ingest.service — audit ingest AND key projection. This is the
# one that makes a minted key work and a revoked key stop working; without it the router's snapshot
# is whatever it was when the file was last written by hand.
WorkingDirectory=/opt/order-router/current
ExecStart=/usr/bin/node /opt/order-router/current/dist/db/ingestRunner.js
EnvironmentFile=/opt/order-router/env
Restart=on-failure
RestartSec=2
```

Bootstrap order matters — each step needs the one before it:

```bash
npm run db:migrate                 # creates the schema; every other step reads or writes it
npm run admin -- create-admin --email ops@example.com --password '<at least 12 chars>'
systemctl daemon-reload
systemctl enable --now order-router order-router-web order-router-ingest
```

Then confirm `curl -H "x-api-key: …" localhost:8080/version` answers. The deploy keeps the last five releases, so
a manual rollback is `ln -sfn /opt/order-router/releases/<sha> /opt/order-router/current && systemctl restart order-router`.

Two things the bootstrap above does not install, and should be done in the same sitting rather than
after the first incident: `docs/deploy/logrotate/order-router` into `/etc/logrotate.d/` (this box
has 7.5 GB and two other production deploys on it), and `docs/deploy/nginx/docs.ccxt.com-router.conf`
into the shared nginx config — `nginx -t` before reloading, because that reload is not only yours.
See "Metrics" for the scrape and alert rules, which are the third.

### Post-deploy live tests

`scripts/live-integration.mjs` asserts against a **running** deployment. It is read-only — every
request is a GET against `/health`, `/version`, `/symbols`, `/route` or `/metrics`, and it never
places, edits or cancels an order.

```bash
ROUTER_BASE_URL=https://docs.ccxt.com/router/api \
ROUTER_API_KEY=or_live_... \
node scripts/live-integration.mjs          # or: npm run live:integration
```

CI is not a privileged caller: it sets the same two env vars, plus `ROUTER_EXPECT_COMMIT=${{ github.sha }}`.
Run it by hand before trusting the pipeline, and after any manual intervention on the box.

| Env var | Default | Purpose |
|---|---|---|
| `ROUTER_BASE_URL` | — (required) | base URL, no trailing slash |
| `ROUTER_API_KEY` | — (required) | a key that is accepted; the 401 checks synthesise their own bad key |
| `ROUTER_EXPECT_COMMIT` | unset | the 40-char SHA the deployment must report. Unset relaxes it to "present and not `unknown`" |
| `ROUTER_MAX_UPTIME_SEC` | `900` | how long the process may have been up and still count as *this* deploy. Only enforced when `ROUTER_EXPECT_COMMIT` is set |
| `ROUTER_FROM` / `ROUTER_TO` / `ROUTER_AMOUNT_OUT` | `USDT` / `BTC` / `0.01` | the probe route |
| `ROUTER_WARMUP_MS` | `180000` | how long `/route` may take to answer while the book cache rebuilds after a restart |
| `ROUTER_TIMEOUT_MS` | `30000` | per-request timeout |

Exit codes: **0** everything passed, **1** at least one assertion failed against the deployment,
**2** the run was misconfigured — no URL/key, or a key the deployment rejects while authenticating
everything else correctly. `2` is not a lesser `1`: it means nothing was learned about the release,
which is why CI rolls back only on `1`.

What it asserts, and why each one earns its place:

1. **`/version` reports the expected commit, and the process is young enough to be that build.**
   The single most important assertion. Every other check here passes against the *previous* build —
   `/health`, auth, `/route` and `/metrics` all answer identically from a process the deploy failed
   to replace. A deploy that silently no-ops (tarball never unpacked, symlink never swapped, unit
   never restarted) is only visible here. The commit alone is not enough when the SHA is
   **unchanged**: Node resolves module realpaths, so a survivor process keeps reading its own
   release's `build-info.json` and reports the expected commit even after `current` moved. The
   `uptimeSec` bound (`ROUTER_MAX_UPTIME_SEC`, default 900s) is what separates "the new build is
   answering" from "the old one never went away".
2. `/health` returns `ok`.
3. `/route` returns non-empty hops, every hop with at least one venue leg, and `fillRatio > 0`.
4. `effectiveRate` is sane — bounded against the route's **own** `referenceRate`, never a hardcoded
   price (BTC moves; a test that needs editing when it does is a test that gets deleted). It may not
   beat frictionless, may not be more than 1000 bps worse, and must agree with `amountOut/amountIn`
   to within a rounding epsilon — which catches a rate computed from the wrong side of the pair.
5. **`balances=` end to end**: half the required funds must come back clamped, with `balancesApplied`
   echoing the canonical spec and `balanceCapAmountIn` binding `amountIn`. The echo is the whole
   point — `/route` takes an untyped querystring, so a server that predates the feature *ignores*
   `balances` and answers byte-identically to one that honoured it.
6. Auth is enforced: no key → 401, wrong key → 401, supplied key → 200.
7. A malformed request (both `amountIn` and `amountOut`) → 400.
8. `order_router_exchange_crossed_books_total` is present in `/metrics`. Presence, not value: the
   counter is legitimately 0 on a healthy day, so `> 0` would be a coin flip. Presence proves the
   guarded build — the one that rejects a crossed book rather than ranking on it — is the one live.

Every assertion is named, prints its observed value, and a failure exits non-zero with a summary.
There is no "warn" tier and nothing is skipped: a live test that goes green against a broken service
is worse than no live test at all.

## OpenAPI spec

`openapi/openapi.yaml` (OpenAPI 3.1) — importable into Postman, Insomnia, Swagger UI, or
any client generator. Validated against the live deployment: `RoutingResult` and
`RoutingQuote` match the real response field-for-field.

It documents the two behaviours callers most often get wrong: `best` can be `null` (a
deliberate refusal to quote books older than the staleness threshold — common at full
discovery scale, and not an error), and `fullyFillable: false` means `averagePrice`
covers only the portion that filled.

## Metrics

`GET /metrics` serves Prometheus text format. **Authenticated like every other non-`/health` route**
— it exposes the venue list, traffic volume and internal health, which is exactly the
reconnaissance an attacker would want, so scrapers must send the API key.

Values are **derived from cache state at scrape time** rather than incremented alongside it. The
cache already owns the authoritative counters, and mirroring them into separate Prometheus counters
would create two sources of truth that can drift, where a missed increment is invisible. Reading
through a `collect()` callback makes disagreement with `/exchanges/status` structurally impossible.
The trade-off is that cumulative series are Gauges whose values happen to be monotonic rather than
Counters — `rate()`/`increase()` still work, and a restart resets to 0 exactly as a Counter would.

| Metric | Why it's here |
|---|---|
| `order_router_exchange_last_update_age_seconds` | **The most important alert.** An exchange can hold an open socket while its subscription is silently dead — `connected` stays 1, nothing errors, and the router keeps ranking on rotting data. Connection state alone will not catch this. An exchange that has *never* updated reports process uptime rather than 0, so a connector that never produced a message is loud instead of indistinguishable from one that just updated. |
| `order_router_stale_books` | How much of the cache is currently too old to rank with — i.e. actively degrading answer quality. |
| `order_router_exchange_reconnects_total` | Reconnect storms were a real failure in live testing (1,000–2,500 in 15s); this is the signal that they have returned. |
| `order_router_exchange_connected` / `_updates_total` | Per-exchange liveness and throughput; a flat update count on a connected exchange is a dead subscription. |
| `order_router_cached_books` / `_cached_symbols` | Coverage — a drop means discovery or subscriptions regressed. |
| `order_router_ws_stream_connections` | Open `/stream/route` sockets, to watch pressure against the per-key cap. |
| `order_router_http_request_duration_seconds` | Latency histogram; its `_count` doubles as the request counter. Buckets are tuned sub-10ms because reads are in-memory map lookups. |
| `order_router_shard_event_loop_utilization` | **The saturation signal.** Fraction of wall-clock each shard's loop spent active, 0..1. Sustained >0.9 means no headroom and books will silently rot. Starvation is otherwise invisible: a saturated shard keeps its sockets open, logs nothing, and simply stops delivering updates — CPU%, load average and `stale_books` all fail to show it cleanly (`stale_books` is dominated by the illiquid tail and reads ~75% on a healthy system). |
| `order_router_shard_loop_report_age_seconds` | Distinguishes "shard is busy" from "shard is gone" — a dead shard reports nothing at all. |
| `order_router_nodejs_*` | Default process metrics. **Event loop lag** matters most — it is the first thing to degrade when WS message volume outruns the single thread. |

Histogram labels use the **route template** (`/orderbook/:exchange/:symbol`), never the raw URL.
Labelling by concrete symbol would mint one series per symbol across a ~10k routable universe and
blow up Prometheus cardinality.

### Scraping and alerting

Nothing scraped this endpoint for as long as it has existed, so the instrumentation was real and
the monitoring was not: a dead exchange subscription was found by a caller, not by us. The scrape
config and the alert rules are now in the repo —
[`docs/deploy/prometheus/scrape.yml`](docs/deploy/prometheus/scrape.yml) and
[`docs/deploy/prometheus/order-router.rules.yml`](docs/deploy/prometheus/order-router.rules.yml).

Two things about them worth knowing before you install them.

**The scraper needs a key of its own.** `/metrics` is authenticated like everything else, and the
API accepts `Authorization: Bearer <key>`, which is what Prometheus can express natively. Mint a
dedicated key (`npm run admin -- create-key --email ops@example.com --name prometheus`) rather than
reusing the CI smoke key: they rotate on different schedules, and a scraper that goes dark because
someone rotated a CI secret is an outage you learn about from the *absence* of alerts.

**No threshold in that file has been validated against real series**, because there are none yet.
They are written against the semantics in `src/metrics.ts`, have not been through `promtool check
rules` (run it before installing), and every constant should be treated as a starting point for the
first fortnight. One correction is already in
there: the suggestion this section used to carry, `stale_books / cached_books > 0.2`, was wrong by
construction — that ratio reads about **0.75 on a healthy system**, because the cache is dominated
by an illiquid tail that legitimately does not tick, as the `shard_event_loop_utilization` row
above says two paragraphs earlier. It would have fired from the first scrape and been silenced
within a day. The shipped rule uses `> 0.9` sustained for 15 minutes, which is a guess with the
right shape rather than a measured baseline; the honest long-term form is a deviation from a
rolling median, which cannot be written before the median exists.

The rules file also names what it *cannot* cover: the ingest runner has no HTTP listener at all, so
a stopped ingest runner — which is a silent authentication outage, since it is the process that
projects `keys.json` — is invisible to Prometheus. `systemctl status order-router-ingest` on the
box is the only check today, which is to say there is no check.

### Log volume and rotation

`/metrics` is not the only thing that goes unwatched on a 7.5 GB box shared with two other
production deploys. The audit log is a file (`ORDER_ROUTER_AUDIT_LOG_FILE`) that nothing rotated;
the diagnostic stream goes to journald, which defaults to taking 10% of the filesystem — and
`LOG_LEVEL=warn` exists precisely because one misbehaving exchange wrote 930MB of retry chatter.

[`docs/deploy/logrotate/order-router`](docs/deploy/logrotate/order-router) rotates the audit log and
carries the journald caps as comments. It uses `create`, never `copytruncate`: under
`copytruncate` the file keeps its inode and drops to zero length, which puts the ingest runner's
committed byte offset past the end of the file — `src/db/ingest.ts` reads that as "nothing new" and
the cursor never advances again, silently, forever. Under `create` the rotated file keeps its inode
and the ingest runner looks it up *by* inode, drains it, and only then follows the new one.

The writer side is not finished, and the config says so where an operator will see it: pino opens
the audit destination once and holds the fd, so after rotation the router keeps appending to the
renamed inode. `SIGHUP` is already the key-reload signal, so the postrotate block restarts the
units instead — which for the router costs a full book-cache rebuild, which is why the schedule is
monthly-with-a-size-guard rather than daily. `docs/deploy/README.md` has the small `SIGUSR2`
reopen handler that would replace it.

## Continuous integration

`.github/workflows/order-router.yml` runs on any change under `order-router/` (and nothing else —
this service is not part of ccxt's transpile pipeline). On Node 22 it runs `npm ci`, `npm run build`
(type-check), `npm test` (the offline suite), then two smoke steps that boot the real processes and
assert over HTTP that `/health` is reachable unauthenticated, that a protected route returns `401`
without a key and `200` with the right one, that a *wrong* key is still rejected, and that the MCP
endpoint rejects an unauthenticated JSON-RPC call. Those smoke assertions were verified locally
before being committed.

### The ccxt pin

`dependencies.ccxt` is an **exact** version, not a range: the box installs nothing at deploy time,
and a router that silently picks up new exchange implementations on every `npm ci` is not
reproducible. The cost is that library fixes do not arrive on their own — the pin once sat thirteen
patch releases behind the ccxt repository this service lives inside, and no job, test or review step
could see it.

`npm run check:ccxt-pin` (a step in `build-and-test`, and an assertion in the offline suite) closes
that. It compares `dependencies.ccxt` against the root `package.json` version and fails unless the
lag currently accepted is written down in `ccxtPin.acknowledgedRepoVersion`, with a reason. It does
not bump anything: raising the pin is a behaviour change and gets its own reviewed commit. What it
guarantees is that the gap is never invisible — when the repo moves past the acknowledged version,
CI goes red until someone either upgrades or consciously re-acknowledges.

On a push to `master` (and on `workflow_dispatch`) the same workflow then deploys and live-tests the
result — see [Deploying from CI](#deploying-from-ci) for the job graph, the five secrets you must
create, and the one-time box setup. `concurrency: cancel-in-progress: false` is deliberate: the swap
is a symlink move followed by a `systemctl restart`, and a run cancelled between the two would leave
the box pointing at a release nothing is serving.

## Benchmarks

### `npm run bench:multi-connect` — simultaneous multi-exchange connections

Answers "does this actually hold N live exchange connections at once", which no unit test can.
Connects to each candidate exchange, holds for a set duration, reports message counts and failures.

**Measured from this sandbox — 34 attempted, 28 connected simultaneously, 75s hold:**

| | |
|---|---|
| Connected | **28 / 34** |
| Total messages | 28,518 (~380 msg/s aggregate) |
| Errors | 0 on 27 of 28 connected exchanges (lbank: 3) |
| Peak RSS | 230 MB |
| Heap used | 62 MB |

Highest-volume: kucoin (14,809 msgs), poloniex (7,500), gate (1,791), htx (676), bitget (563),
coinbase (493). Median time-to-first-message ~1.8s.

The 6 failures are all explainable, none are router bugs (`mexc` has since been fixed by adding
`protobufjs`, verified live — 104 bids / 108 asks — so the reachable count is now 29):

| Exchange | Reason |
|---|---|
| `cex`, `luno` | require API credentials even for public WS |
| `okx`, `binanceus`, `independentreserve` | no data within 20s — the same egress geo-restriction that blocks Binance/Bybit from this sandbox |

Note this is 28 exchanges × 1 symbol. It validates *connection* concurrency, not the full
55k-subscription symbol load — that still needs unrestricted infra (see Known gaps).

### `npm run bench:load` — REST API load test

`autocannon` against a **running** router, so numbers include real auth, rate limiting, book
walking and serialization. Raise `ORDER_ROUTER_RATE_LIMIT_MAX` for the run or you'll measure the
limiter instead of the service.

**Measured: 50 connections, 8s per scenario, 5 live exchanges cached, 0 non-2xx on every
authenticated path:**

| Scenario | req/s | p50 | p90 | p99 | max |
|---|---|---|---|---|---|
| `/health` (baseline, no auth, no cache read) | 13,779 | 3ms | 5ms | 9ms | 244ms |
| `/symbols` (iterates whole cache) | 8,138 | 5ms | 7ms | 11ms | 28ms |
| `/orderbook/:ex/:sym` (map lookup + serialize full book) | 6,628 | 7ms | 9ms | 13ms | 209ms |
| `/route` small order (walks every exchange book) | 6,397 | 7ms | 9ms | 12ms | 254ms |
| `/route` large order (walks deeper) | 4,302 | 11ms | 13ms | 18ms | 292ms |

These predate the cache symbol index and the engine restructure below; the routing compute inside
them is now several times cheaper, so the HTTP overhead dominates even more than it did.
| unauthenticated (expect 401) | 13,693 | 3ms | 4ms | 6ms | 179ms |

### Routing cost at full-discovery scale

`benchmark/route-scale.mjs` isolates the compute from HTTP and the network, against a cache the
size of full discovery (60 exchanges x 702 symbols x 50 levels = 42,120 books):

| Route | p50 | p95 | p99 |
|---|---|---|---|
| single hop, small order | 0.22ms | 0.76ms | 1.01ms |
| single hop, deep order | 0.27ms | 0.90ms | 1.09ms |
| single hop, notional (`amountIn`) | 0.33ms | 1.11ms | 1.42ms |
| bridged, one candidate | 0.54ms | 1.33ms | 1.50ms |
| bridged, two candidates compared | 1.10ms | 2.32ms | 2.74ms |
| direct + one bridge compared | 0.80ms | 1.71ms | 2.00ms |

This was **10.8ms** before the cache gained a symbol index. `getBooksForSymbol` scanned every
cached book on every call, and routing calls it once per venue considered — so cost scaled with
the product of total books and venues, and the router got slower as discovery widened. Indexing
symbol -> venue -> book made it proportional to the venues on that one symbol: 27x faster, and
now flat in cache size.

Two things worth reading off this: the routing work itself is cheap (best-price with a large order
still clears 4.3k req/s), and **auth rejection is as cheap as `/health`** — so an unauthenticated
flood costs the server roughly nothing per request and isn't a DoS amplifier.

Caveat: single machine, client and server sharing CPU, so absolute throughput is a floor rather
than a ceiling, and the `max` outliers (~250ms) include client-side scheduling noise.

### `npm run bench:ws` — per-exchange WS latency and book depth

Measures WS update rate, message latency, and cached book depth per exchange.

#### Results from this dev sandbox — read the caveats before trusting these numbers

1. **Binance, Bybit, OKX were unreachable from this sandbox.** Binance/Bybit REST calls returned
   `451`/`403` geo-compliance blocks; OKX's WS connection timed out. This is specific to this
   container's egress IP, not a ccxt limitation. These three are typically the deepest/fastest
   venues in production and **must be re-benchmarked from the actual deployment host** before
   finalizing the exchange list.
2. **Absolute latency figures are unreliable.** Several exchanges reported negative
   exchange-timestamp-to-receipt latency, meaning this container's clock is not NTP-synced against
   exchange time sources. Re-run with `chrony`/NTP synced on the benchmark host for trustworthy
   absolute numbers. Update frequency and book depth (below) don't depend on clock sync and are valid.

| Exchange | Updates / 30s | Book depth (levels) |
|---|---|---|
| KuCoin | 14,432 (~480/s) | 60–245 |
| Kraken | 3,219 (~107/s) | 10 (fixed) |
| Gate | 944 (~31/s) | 50 (fixed) |
| Coinbase | 483 (~16/s) | 1,070–1,103 (near-full L2) |
| Bitget | 281 (~9/s) | 500 (fixed) |

Takeaway: Kraken/Gate cap streamed depth at 10/50 levels, which limits how large an order can be
routed confidently before you'd need a periodic REST depth-snapshot fallback for those venues.
Coinbase streams close to the full book.

## Production readiness

**It is exposed publicly**, at `https://docs.ccxt.com/router/`, with self-serve signup, on the
same VM as CCXT's docs and two other deploy pipelines. This section used to open with "Not ready to
expose publicly", which stayed there through the deploy that exposed it — so the table below was
read as a list of reasons it had not shipped, when it is a list of things that are true of
something serving real traffic.

Read it as the beta's risk register. Nothing in the Open rows is a blocker anybody is waiting on;
they are the known ways this can fail in production right now:

| Blocker | Status |
|---|---|
| No authentication | **Closed** — per-user named keys in Postgres, projected to `keys.json`, created and revoked from the dashboard, with per-key rate and WS-connection caps and live socket termination on revocation. **Still open:** no scopes, no expiry, no quotas (see Security) |
| No rate limiting | **Closed** — per-key limiting, tested, `/health` exempt |
| Never load tested | **Closed** — see Benchmarks; 4.3k–13.8k req/s depending on endpoint |
| Never run against many exchanges at once | **Closed for connection concurrency** — 28 simultaneous live exchanges verified. **Still open for full symbol load** (55k subscriptions) |
| Not in CI | **Closed** — build + tests + boot/auth smoke tests on every change |
| Binance/Bybit/OKX never live-tested | **Open** — geo-blocked from every environment available here |
| No TLS, runs plain HTTP | **Closed** — nginx terminates TLS on `docs.ccxt.com`; the real snippet is `docs/deploy/nginx/`, with loopback binding, `trustProxy` and the WS timeout pitfall documented above. Still no TLS if run without a proxy. |
| No soak testing | **Open** — longest continuous run is minutes, not hours/days |
| No metrics/alerting | **Closed for instrumentation and for the config** — Prometheus `/metrics`, plus a scrape config and alert rules in `docs/deploy/prometheus/`. **Still open:** nothing has installed them on the box yet, so nothing scrapes it in production; and no threshold in the rules has been validated against real series, because there are none. The ingest runner exports no metrics at all, so its liveness is uncovered. |
| No HA/failover | **Open** — a dead process is an outage |
| Deploy restores code but not config | **Open** — `docs/deploy/` versions the units, env template, nginx snippet, logrotate and Prometheus rules, so a config change is now reviewable. The release tarball is still code only and the activate step installs none of it, so a rollback does not roll config back and on-box edits still drift. `docs/deploy/README.md` has the workflow change. |
| No log rotation | **Closed for the config, open on the box** — `docs/deploy/logrotate/order-router`, `create` not `copytruncate` for the reasons in Metrics. It is not installed yet, and completing a rotation currently costs a service restart until an audit-log reopen signal exists. |
| Unbounded WS connections (finding #4b) | **Closed** — per-key concurrency cap + heartbeat reaper, regression-tested |

## Known gaps / next steps

- Re-run the benchmark from unrestricted, NTP-synced infra, including Binance/Bybit/OKX, and at
  full discovery scale (76 exchanges) rather than the 5-exchange subset reachable from this sandbox.
- Soak test: hours-to-days continuous run with `process.memoryUsage()` tracked, to find leaks and
  slow connection drift that a 75-second test can't.
- `ORDER_ROUTER_MAX_SYMBOLS_PER_EXCHANGE` needs real per-exchange tuning under production load —
  the value used in testing (`coinbase:25`) got that one exchange stable but is a starting point,
  not a researched limit. KuCoin also still showed a nonzero (but much reduced, ~30 vs ~1,500
  before the fixes) reconnect rate at ~680 routable symbols that wasn't fully root-caused.
- Shard load-balancing is by symbol count only (a proxy for message rate) — no real per-symbol
  throughput data exists yet to balance more precisely; revisit once shards are under real load.
- Order *execution* is client-side, in the `OrderRouter` class, and the service itself never holds
  a trading credential or places an order. `execute()` has no live coverage against a real venue
  yet: every strategy is exercised against stub venues in all six languages, which is not the same
  as having placed one order on one exchange.
- `execute()` idempotency is **in-process only**. A plan already executed is refused by a ledger held
  on the `OrderRouter` instance, and each order carries a deterministic `<planId>-<stepIndex>` client
  order id so a venue that honours client order ids rejects the duplicate. Neither covers a restart
  mid-route: the ledger dies with the process, and a venue that silently drops the parameter gives no
  rejection at all. Durable idempotency needs a persistent store keyed by plan id plus a "what did
  the venue already see?" reconciliation on resume.
- Which venues honour a client order id — and under which name (`clientOrderId`, `newClientOrderId`,
  `clOrdId`, `client_oid`) — is unmapped. Until it is, the venue-side half of the guarantee above
  cannot be relied on per exchange.
- The re-execution check-then-write is not atomic: two `execute()` calls racing on the same instance
  can both pass the ledger check before either writes. In-process only, and it wants the durable
  design above rather than a local lock.
- No Redis/cross-host story yet — sharding today is same-host via IPC only (see Architecture).
- Depth-limited exchanges (Kraken, Gate, others with capped WS depth) should fall back to REST
  `fetchOrderBook` snapshots when a requested `amount` exceeds cached depth, rather than silently
  reporting `fullyFillable: false`.
- The companion units (`order-router-web`, `order-router-ingest`) are restarted by the deploy but
  are not covered by its smoke test — only the router's `/health`, `/version` and `/route` are
  asserted before the release is promoted.
- Every deploy job is gated on `github.repository == 'pcriadoperez/ccxt'` (see "Why the deploy job
  is gated"). That is deliberate — a fork must not deploy to this box — but it means merging this
  directory upstream stops deploys with no failure to notice. Change the gate in the same commit as
  any such move.

**Done since this list was first written**, kept here because the entries described the service
people were reading about: per-client API keys with rotation and revocation replaced the shared key
(see "Authentication"), TLS termination in front is documented under "Deploying behind nginx", and
`/metrics` is a real Prometheus endpoint rather than the `/exchanges/status` stand-in.
