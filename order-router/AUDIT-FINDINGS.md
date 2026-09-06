# order-router — open audit findings

> **This file is scaffolding, not documentation. Delete it in the commit that closes the last
> open item, before this PR merges.** It exists so the remaining work is pickup-able by someone
> other than whoever started it.

An adversarial audit of this directory and of the six-language `OrderRouter` client produced 87
findings. Each one below was re-verified against the source before being acted on — a meaningful
fraction did not survive that, and those are recorded as `refuted` rather than deleted, so nobody
re-files them.

## How to work an item

1. **Verify it first.** Roughly one in three of these did not survive contact with the code. Read
   the cited file and decide for yourself; the evidence block is a claim, not a finding of fact.
2. **Write the test before the fix, and check it fails without the fix.** Every fix already landed
   was mutation-checked that way, and it caught two that only looked right.
3. **`OrderRouter` changes land in all six ports.** `ts/src/base/OrderRouter.ts` is the reference;
   `python/ccxt/base/order_router.py`, `php/OrderRouter.php`, `cs/ccxt/base/OrderRouter.cs`,
   `go/v4/exchange_order_router.go` and `rust/ccxt-base/src/order_router.rs` are hand-written
   ports, not transpiler output. They drift independently — six of the closed items below were
   single-port divergences nobody had noticed, and the shared fixture cannot see them because it
   covers the pure functions and these were all on the `execute` path. Run all six:
   `npm run test-order-router`.
4. **Service changes** live in `order-router/`; `npm test` from that directory.
5. When you close an item, move it to the Closed table with the commit sha. When the Open section
   is empty, delete this file.

## Open

Ordered by severity. The number is the item's index in the original audit set — keep it, so
that a reference in a commit message stays meaningful.

### 35. execute() has no idempotency of any kind — re-running it on the same plan re-places every order, including ones already filled

**Severity:** high &nbsp;·&nbsp; **estimated effort:** days

**Claimed evidence**

```
ts/src/base/OrderRouter.ts:1354-1355 builds fresh state on every call and never consults anything persistent:
```
1354:        const steps = this.cloneSteps (plan);
1355:        const report = this.emptyReport (plan, strategy, requestedStrategy, live, steps);
```
`grep -rn "clientOrderId\|idempot\|d
```

**Suggested fix** — a suggestion, not a verdict; verify before following it.

Derive a deterministic client order id per step — e.g. `clientOrderId = requestId + '-' + stepIndex` (plus an execute-call attempt number) — and inject it into orderParams in placeStep, so a re-run is rejected by the venue as a duplicate rather than filled. At minimum, refuse to execute a plan whose

### 44. Every deploy degrades /route for minutes with live traffic still being routed to the restarting process; /ready exists but nothing consumes it

**Severity:** medium &nbsp;·&nbsp; **estimated effort:** hours

**Claimed evidence**

```
The deploy's own smoke allows five minutes for recovery: .github/workflows/order-router.yml:403 — `for i in $(seq 1 60); do   # up to 5 min for the book cache to warm`, preceded by the comment at line 374 "A restart rebuilds the entire order-book cache and degrades /route for minutes". `activate()`
```

**Suggested fix** — a suggestion, not a verdict; verify before following it.

Have nginx (or a tiny second instance) gate on `/ready` and return 503 while the cache is cold, so callers see an unambiguous 'not ready' instead of a confident wrong answer; at minimum make `/route` return 503 with a distinct reason while `freshCount < minFreshBooksForReady` rather than a 200.

**Partially fixed.** The deploy-side half is done: the on-box smoke polls `/ready` (up to five
minutes) and fails if it never reports ready, and `live-integration.mjs` asserts `/ready` before it
routes — so the degraded window is waited out rather than served through, and `/ready` finally has
consumers. Still open: the traffic side. nginx does not gate on `/ready` (its config is unversioned,
see finding 12), and `/route` still answers a confident 200 while the cache is cold rather than a
503 naming the reason.

### 65. Go cannot read per-trade fees and carries the gross amount forward; the code comment claims this is conservative, and it is the opposite

**Severity:** medium &nbsp;·&nbsp; **estimated effort:** hours

**Claimed evidence**

```
go/v4/exchange_order_router.go:2120 `func routerOrderFeeInAsset(order Order, asset string) float64 { ... // DIVERGENCE ... the Go typed Order carries a single Fee and no Fees list, so unlike the other four ports this cannot sum per-trade fees. On a venue that reports fees only in that list, Go under
```

**Suggested fix** — a suggestion, not a verdict; verify before following it.

Either add a `Fees []Fee` field to the Order struct in go/v4/exchange_types.go (regenerating from ts/src/base/types.ts per CLAUDE.md §3) and sum it in routerOrderFeeInAsset, or fall back to summing `order.Trades[i].Fee` — Trades is already on the struct at exchange_types.go:446. Correct the comment

### 66. Fee netting — the one placeStep behaviour that resizes the next hop's order — is asserted only in the TypeScript suite

**Severity:** medium &nbsp;·&nbsp; **estimated effort:** days

**Claimed evidence**

```
ts/src/test/base/test.orderRouter.ts:1016 `test ('a fee charged in the acquired asset is netted out of what the next hop is sized on', ...)` asserts `step['grossOutAmount'] === 0.1`, `outAmount ≈ 0.099`, `step['feeCost'] === 0.001`, plus the counterpart at :1031. Grepping `feeCost|grossOutAmount` in
```

**Suggested fix** — a suggestion, not a verdict; verify before following it.

Port ts/src/test/base/test.orderRouter.ts:1016 and :1031 into python/ccxt/test/base/test_order_router.py, php/test/base/test_order_router.php, cs/tests/OrderRouterTest.cs, go/v4/exchange_order_router_test.go and rust/ccxt-base/src/order_router_selftest.rs, and add a stub-order section to ts/src/test

### 80. formatNumber tie-rounding differs between ports, so the balances query string is not byte-identical as the file claims

**Severity:** low &nbsp;·&nbsp; **estimated effort:** hours

**Claimed evidence**

```
go/v4/exchange_order_router.go:443 goes to the trouble of implementing JavaScript's rule exactly with big.Rat: `// ECMA-262 strips the sign BEFORE choosing n, so a tie rounds AWAY FROM ZERO on the magnitude: (-0.0001220703125).toFixed(12) is -0.000122070313, not -…312. strconv would round half to ev
```

**Suggested fix** — a suggestion, not a verdict; verify before following it.

Either port Go's routerToFixed12 (go/v4/exchange_order_router.go:443) into Python, PHP and Rust, or drop the JS-tie requirement and change Go to plain half-to-even so all six agree on the simpler rule. Add tie values (0.0001220703125, -0.0001220703125) to a formatNumber section of ts/src/test/base/f

## Closed

Kept so the same ground is not re-covered, and so a `wontfix` is not silently re-litigated.

| # | Sev | Finding | Resolution |
|---|---|---|---|
| 0 | blocker | Nothing in the deployed path sets NODE_ENV=production, which arms the published dev API key as a live credential | **fixed** — 6f88bfb3 dev key is opt-in via ORDER_ROUTER_ALLOW_DEV_KEY, never inferred from NODE_ENV |
| 1 | blocker | The deploy restarts only order-router.service; the public web console, ingest runner and key projector are never redeployed and their release trees are later deleted underneath them | **fixed** — 6f88bfb3 EXTRA_SERVICES names order-router-web and order-router-ingest |
| 2 | blocker | trustProxy: true trusts the whole X-Forwarded-For chain, so request.ip is attacker-chosen and every IP rate limit (including /login brute-force) is bypassable | **fixed** — 6f88bfb3 trustProxy is a hop count; nonsense values refuse to start |
| 3 | blocker | Respawned shards are never added to `children`, so `stop()` can never kill them — a rebalance forks a second generation alongside the survivors | **fixed** — 6f88bfb3 children.push moved inside spawn(); exit handler splices the corpse |
| 4 | blocker | Any caller can permanently wedge audit/usage ingestion with one header: X-Forwarded-For garbage → inet insert error → infinite rollback loop | **fixed** — 6f88bfb3 ipOrNull() validates with node:net, writes NULL for anything unparseable |
| 5 | blocker | The ingest runner exits with status 0 when Postgres is unreachable — systemd Restart=on-failure never restarts it, and key revocation stops working | **fixed** — 6f88bfb3 ref'd heartbeat + partition retry instead of a fatal boot |
| 6 | blocker | LOG_LEVEL cannot reduce per-request log volume — 507 bytes/request goes to the diagnostic log even at LOG_LEVEL=warn | **fixed** — 885afe73 child logger no longer levelled up; stream_open/close moved to the audit stream |
| 7 | blocker | Rust accepts the atomic_ish strategy, never checks pre-funding, and then skips the downstream resize on the strength of that unperformed check | **fixed** — 36e144bf assert_prefunded ported to Rust with a selftest |
| 8 | blocker | limit_protected: any throw after createOrder reports the step as `failed` with zero fill, leaves the order live and uncancelled, and makes the residual invisible to buildUnwindPlan | **fixed** — de933e55 known orderId -> status outcome_unknown, all six ports |
| 9 | blocker | Every production deploy job is gated on a fork's repo name — merging this PR upstream silently and permanently stops deploys to the live service | **wontfix** — af4ac591 deliberate: a fork must not deploy to this box. Recorded in README Known gaps so a future upstream merge changes the gate in the same commit. |
| 10 | high | Docker image cannot build: the Dockerfile never COPYs openapi/ or scripts/, yet the README documents `docker compose up --build` as a way to run the service | **fixed** — build stage COPYs openapi/ and scripts/, takes the commit as a build arg, drops to USER node and probes /ready; a .dockerignore added. src/packaging.test.ts derives the required dirs from the build script itself, so a new asset dir fails there rather than in a terminal. |
| 16 | high | The one-time API-key reveal page and every authenticated console page are served with no Cache-Control, so a live `or_live_…` key is cacheable | **fixed** — the onSend hook now sets `no-store, no-cache, must-revalidate, private`, `Pragma: no-cache` and `Vary: Cookie` on everything outside `/static/`, which keeps its own caching. |
| 20 | high | IPC backpressure covers only `book` messages; health messages bypass it and their rate is proportional to the failure rate | **fixed** — the send path moved to src/sharding/ipcSend.ts (testable without forking) and the pipeFull gate now covers `health`, which is an idempotent snapshot re-flushed every 2s. Drops are counted separately and exported as order_router_shard_health_dropped_total: a rising figure points at a flapping venue, not at capacity. |
| 22 | high | A projection against an empty/restored database silently overwrites the router's key snapshot with zero keys, de-authenticating every customer | **fixed** — a drain to zero is now checked one level down before it is written: revocation is a soft UPDATE, so a real revocation leaves its row in api_keys, while zero rows in the whole table under a populated snapshot is a lost or wrong database. That one is refused and logged at error level, keeping the previous file. A legitimately empty first run still writes an empty snapshot, and revoking the last key still takes effect. |
| 29 | high | API key creation and user-initiated revocation through the dashboard are not logged at all | **fixed** — with 79, below: mint, self-revoke and admin-revoke write to admin_audit through src/db/adminAudit.ts. Only a revocation that changed a row is recorded, an unparseable client address is stored NULL rather than handed to `inet`, and a failed audit write logs but never fails the action — a revocation that 500s leaves a compromised key live. |
| 79 | low | admin_audit is created but never written — admin actions leave no durable audit trail | **fixed** — same change as 29. Note the resolution taken was to write the table, not to delete it. |
| 38 | high | README describes authentication as a single shared secret with no revocation in three places; the shipped system is per-user named keys with revocation, per-key limits and live socket termination | **fixed** — the Security §API keys intro, the "Still not an identity system" paragraph (which also claimed there is no self-serve signup) and the readiness-table row now describe the shipped model. The residual gap is stated accurately: no scopes, no expiry, no quotas. |
| 39 | high | The documented key-management commands (npm run keys:create/list/revoke/delete) do not exist — including the revoke command an operator would run on a leaked key | **fixed** — replaced with the real procedure: `admin create-admin` / `create-key` for bootstrap and break-glass, the dashboard for day-to-day, `admin project` for debugging, and an explicit note that there is deliberately no revoke command (two writers to the Postgres rows is a lost-update problem) plus what to do without a browser. src/docs.test.ts now fails on any `npm run` the README names and package.json lacks, on any documented `admin` subcommand the CLI does not handle, and on a usage line that omits a handled command — `create-key` was missing from it. |
| 64 | medium | Rust classifies the entire NetworkError subtree as outcome-unknown, so every rate-limit rejection is reported as a possibly-live order | **fixed** — `error.is("NetworkError")` walked the hierarchy, where DDoSProtection, RateLimitExceeded and InvalidNonce are children of NetworkError. Replaced with the same exact four-name match the other five ports use, with a selftest that pins both directions: those three are plain failures, and the four ambiguous ones stay outcome-unknown. |
| 67 | medium | Rust adds a price_unconfirmed halt branch that no other port has, halting routes the other five complete | **refuted on current source** — the branch is gone; what remains at rust/ccxt-base/src/order_router.rs:2019 is a comment recording that it was removed and why (the reference halts on an unknown FILL, and reports an estimated price as an estimate). Nothing to change. |
| 81 | low | C# assigns inAsset/outAsset and the fee fields before the outcome-unknown early return, so an unknown-fill result carries assets the other ports leave blank | **refuted** — written against the pre-item-34 reference. Closing 34 moved the TypeScript early return to sit AFTER the asset/amount assignment, precisely because inAmount is what buildUnwindPlan subtracts. C# at :2203-2242 already matches that reference; "fixing" it would reintroduce the divergence 34 closed. |
| 48 | medium | The non-prefixed `router_session` cookie is accepted in the secure deployment, defeating the __Host- prefix | **fixed** — the accepted name now follows `secureCookies` exactly as the setter does: `__Host-` only when secure, the plain name only when not. The prefix is what a browser enforces, so accepting both let a sibling subdomain hand this app a session name it honoured. |
| 49 | medium | Caller-controlled unbounded `bridges` / `exchanges` on POST /route are written verbatim into the audit log and re-walked on every stream push | **fixed** — both bounded the way `balances` already is (1024 chars, 128 entries), rejecting rather than truncating, since routing against a quietly different list is this parser's whole failure mode. The empty forms keep their meanings. |
| 54 | medium | `AuthenticationError` is classified as permanent and irreversibly removes a venue, including the okx clock-drift failure the file's own comment lists as recoverable | **fixed** — AuthenticationError is no longer permanent by class; it is permanent only when the message is credential-shaped (`requires apiKey`), the one case no retry can fix. Classifying the whole class reinstated exactly the false positive that dropping /authentication/ from the message patterns had removed — okx answers clock drift with an invalid-signature error. |
| 55 | medium | A shard orphaned during startup never exits: the `disconnect` handler is installed only after every connector has started | **fixed** — registered at module load, beside installCrashHandlers. Startup is the longest window in the process's life and was the only one with no handler. |
| 63 | medium | Respawned shard processes are never added to the handle, so stop() cannot kill them | **refuted — already closed as blocker 3** (6f88bfb3). `children.push` sits inside `spawn()`, so every process it creates is tracked, and the exit handler splices the corpse out. Duplicate filing. |
| 73 | medium | rust.yml is the one language workflow with no order-router paths-ignore, so every order-router change spins the 120-minute Rust job and can push spurious [Automated changes] commits to master | **fixed** — the same paths-ignore block the other five workflows carry, on both push and pull_request. Confirmed by the audit trail on this PR: order-router-only pushes were spinning the Rust job and failing its live-tests step. |
| 82 | low | placeProtectedLimit spins forever with a live order resting when pollIntervalMs is 0 | **fixed in all six ports** — refused in execute(), beside the other strategy-option checks, so nothing is placed at all: the poll loop advances its clock by this value, so a zero or negative interval never reaches the timeout and spins on fetchOrder forever with a real order resting. Refusing inside placeProtectedLimit would have left the very order the loop could not clean up. Tested in TS/JS, Python, PHP, Go and Rust; the C# test is written but UNRUN — no dotnet in this environment. |
| 56 | medium | The crash strategy explicitly depends on a supervisor restart, but the documented systemd unit has no `Restart=` directive | **fixed** — `Restart=on-failure` and `RestartSec=2` added to the documented unit. The crash handlers log, flush and exit non-zero on the stated assumption that something restarts the process; without the directive the first unhandled rejection ended the service until someone noticed. src/docs.test.ts now fails if the directive goes missing. |
| 77 | low | POST /route body fields are never type-checked, so a non-string value returns 500 with the internal error text | **fixed** — the shared parser now rejects any non-string field with a 400 naming it, beside the repeated-parameter check. Rejected rather than coerced on purpose: `{"requireFullFill": true}` would stringify to `"true"` and arm the flag while `{"certified": 1}` would become `"1"` and silently not arm it, so the same JSON idiom would give opposite answers on two safety flags. |
| 78 | low | `ORDER_ROUTER_SHARD_START_CONCURRENCY` is documented as controlling something it does not control, and raising it on that basis rebuilds the memory peak the heap ceiling exists to hold | **fixed** — the README row now says what the code does (exchanges started concurrently within one shard) and names `ORDER_ROUTER_SHARD_COUNT` as the knob it was being confused with. |
| 84 | low | README documents `systemctl reload order-router` for instant key reload, but the systemd unit it also documents has no ExecReload | **fixed** — `ExecReload=/bin/kill -HUP $MAINPID` added; the process already handles SIGHUP (src/index.ts). The test checks the signal the unit sends is one index.ts handles, since a reload that succeeds and does nothing is the worst of the three outcomes. |
| 85 | low | build-and-test has no timeout-minutes while every other job in the file does, so a hung step holds a runner for the 6-hour default | **fixed** — `timeout-minutes: 20`, and src/docs.test.ts now asserts every job in the workflow bounds itself. |
| 60 | medium | WebSocket frames dropped for slow consumers are silently discarded — no metric, no log, no client signal | **fixed** — all three directions answered: `order_router_stream_frames_dropped_total` for the operator, one warn per socket (not per frame — a saturated socket drops continuously at the production log level), and a `droppedFrames` count on the next frame that gets through, the only signal the client can see. A consumer that fell behind can now tell "the market did not move" from "I missed the frames where it did". |
| 61 | medium | Crossed-book rejection logs a warn per update while resync backs off to 30 minutes — unbounded log volume at the production log level | **fixed** — one line per symbol per crossed episode, with a closing line reporting how long it lasted and how many updates it rejected, so the suppressed window is accounted for rather than lost. Per symbol, because one venue can cross on one market and be fine on the rest; per episode, because a venue that crosses twice must be reported twice. |
| 72 | medium | OpenAPI's POST /route omits the 404 and 501 responses the shared handler returns, on the verb the spec itself tells callers to use for balances | **fixed** — both copied onto the `post:` responses, and src/openapi.test.ts now asserts the two verbs document identical status sets, since one handler serves both. |
| 83 | low | OpenAPI describes /health as "the only unauthenticated route" while the next path in the same file is also unauthenticated | **fixed** — the description names both. The claim mattered: a caller who believes it wires their orchestrator to the probe that answers 200 while the cache is still filling, thinking it is the only one they can reach. |
| 86 | low | The README's test-coverage table is stale in a way that overstates verification — it names a test file that does not exist and undercounts the suite by 6x, while the readiness table reports CI as "Closed" | **fixed** — the fixed count is gone (`npm test` prints the real one), the phantom `bestPrice.test.ts` row is corrected, and every test file on disk now has a row. src/docs.test.ts asserts both directions, so a new area cannot be added without one. |
| 62 | medium | The README's forensic log queries return zero rows against the production configuration | **fixed** — the two runbook queries now read `$ORDER_ROUTER_AUDIT_LOG_FILE*`, with a line stating that every event in the table above lands in the audit stream and a note on the no-audit-file fallback. Pointed at router.log with the audit file configured, they returned nothing and read as "this key made no requests" — the most misleading answer available. |
| 71 | medium | The `limit_protected` execution strategy is implemented but absent from every document, including the Manual table that presents itself as the complete list | **fixed** — a row in wiki/Manual.md with its `orderTimeoutMs` / `pollIntervalMs` options and its resting/cancel semantics, plus the strategy sentence in the five user-facing skills that carry one (ccxt-typescript, -python, -php, -csharp, -go; ccxt-cli, -java and -mcp document no strategies at all). **No automated guard**: the order-router suite is the only drift-testing harness in this change and has no business reading the library's wiki, while the six-language OrderRouter suite is transpiled and cannot read the filesystem. A future divergence needs a repo-level docs check. |
| 41 | high | Deployment docs and the deploy workflow cover only the router process; the web console, ingester and key projector are undocumented and never started, so a box built from the README can never authenticate a request | **fixed** — the two companion units are documented with their ExecStart, the shared EnvironmentFile (all three must agree on ORDER_ROUTER_KEYS_FILE or the projector writes a file the router never reads), and a bootstrap order: `db:migrate`, then `create-admin`, then enable all three. src/docs.test.ts derives the expected unit list from the workflow's own `SERVICE`/`EXTRA_SERVICES`, so the deploy and the docs cannot drift apart again. This was the last item in the "Started, not finished" section, which is now gone. |
| 70 | medium | The design docs the README points operators to are marked "plan, not shipped" and prescribe an architecture that was replaced; one explicitly forbids the deployment that shipped | **fixed** — all three restamped honestly: product-plan is *shipped* and is what the README now points at first; auth-plan is *shipped, then superseded* (its key format and lookup reasoning still hold, its storage decisions and its CLI lifecycle table do not); dashboard-plan is *superseded, kept for its reasoning* — its "never an nginx location on :443" describes a deployment deliberately not taken, and it now says so. A test fails if any design doc calls itself unshipped again. |
| 21 | high | Partitions are only ever created for the current and next month — replaying any older audit line hard-fails the batch and stalls ingestion forever | **fixed** — a row outside every partition does not get skipped by Postgres, it aborts the INSERT, which aborts the batch transaction, so the cursor never advances and the same line replays forever. `ensurePartitionsForMonth` is now called for every distinct month in the batch, before the transaction opens — DDL inside it would be taken out by the rollback. |
| 26 | high | Audit-log rotation silently discards every record the ingester had not yet read from the old file | **fixed** — on an inode change the rotated file is located by INODE MATCH (never by name, so it cannot return a file the cursor's offset does not belong to) and drained to EOF first, with the cursor still carrying the old inode so a crash mid-drain resumes there rather than skipping it. When no rotated file is found the line is a warn naming the offset and the loss, not an info. |
| 47 | medium | The anonymous CSRF token is a fixed public constant, so /signup and /login are defended by the Origin header alone — and a missing Origin is treated as valid | **fixed** — a pre-session CSRF cookie (256 CSPRNG bits, HttpOnly, `__Host-` under TLS) gives the anonymous token something per-visitor to bind to; it is not a session and confers nothing. A missing Origin now falls back to `Sec-Fetch-Site`, refusing `cross-site` and `same-site` (the cross-port case SameSite=Lax does not cover); a request with neither header is not a browser and is covered by the token. |
| 50 | medium | Signup discloses whether an email already has an account, re-opening the enumeration oracle login deliberately closes | **fixed, with a stated limit** — a 23505 conflict is answered as a sign-in: the password is checked against the existing hash, a match lands on /dashboard exactly as a fresh signup does (no second key minted), a mismatch returns login's neutral wording. The residual gap is commented in the code rather than left implied: with no verification mail, a NEW address still ends in an authenticated dashboard and a taken one does not, so a passwordless attacker can still distinguish them. That closes only when email verification lands. |
| 57 | medium | The cursor hold-back path re-reads already-written lines, producing duplicate requests rows and double-counted usage_hour | **fixed** — only records lying ENTIRELY before the hold-back point are written (tracking each reqId's last offset, not just its first). Deliberately NOT closed with a `UNIQUE (ts, request_id)`: schema.sql documents request_id as caller-supplied and untrusted, and a caller pinning it to a constant would collapse every request into one row. |
| 74 | medium | The artifact CI tested is not the artifact deployed: the shipped arm64 tree is rebuilt in the deploy job and never runs a single test before it reaches production | **fixed** — the deploy job runs `npm test` on the arm64 tree it is about to ship, after the build and before the prune and tar. |
| 75 | medium | A missing, rotated or revoked ORDER_ROUTER_SMOKE_API_KEY causes CI to roll back and double-restart a perfectly healthy production release | **fixed** — live-integration.mjs exits 2 (its documented "misconfigured" code) when the deployment rejects OUR key while correctly 401-ing the no-key and bogus-key probes, and rollback now requires a `failed` verdict rather than merely a non-success. The run still goes red either way. Tradeoff, commented in the workflow: a live-integration job that dies before publishing a verdict no longer auto-rolls-back — the script bounds itself far inside the job timeout, so that case is infrastructure, not a bad release. |
| 76 | medium | The service pins ccxt 4.5.64 inside a repo at 4.5.77 and nothing in CI detects the drift, so library fixes never reach the deployed router | **fixed as a detector, not a bump** — `check:ccxt-pin` runs in build-and-test and fails when the repo version moves past the lag written into `ccxtPin.acknowledgedRepoVersion` (4.5.77, reason recorded), warns while that lag stands, and rejects a non-exact pin. The pin was left at 4.5.64 on purpose: a version bump is a behaviour change deserving its own review. The gap can now only widen deliberately. |
| 18 | high | A resync closes every socket on a venue and all its watch loops re-subscribe within 500ms — 20x denser than the startup stagger the same file says exists to prevent a reconnect storm | **fixed** — the reconnect delay now carries the loop's stable startup index (`jitter × backoff + index × stagger`), so the reconnect path spreads exactly as startup does instead of collapsing every loop into one 500ms window. |
| 19 | high | Single-process mode (`shardCount: 1`, the default) has none of the memory protections the shard path has: unbounded startup concurrency, no heap ceiling, and `maxBookDepth` silently ignored | **fixed for two of the three** — bounded startup admission is now shared code used by both paths, and `maxBookDepth` is passed in single-process mode (it was an 8th argument only shardWorker supplied, so the DEFAULT deployment kept whole books). The heap ceiling genuinely cannot exist in a process that never forks — it is an execArgv on fork() — so instead unsharded mode now warns loudly at boot when handed discovery-scale load, naming the reason. |
| 51 | medium | Shard workers retain a full second copy of every order book they will never read, inside the process with the hard heap ceiling | **fixed** — the worker uses a relay cache that emits the same events in the same order without storing the books. The shard is a pure forwarder: nothing in it ever reads a book back. Health is still retained deliberately — it is small and re-read on every flush. |
| 52 | medium | A shard whose module is missing (stale or half-unpacked deploy) crash-loops forever while `/health` keeps answering 200 | **fixed** — a worker acks on receiving its assignment, before starting connectors, so a slow-but-healthy shard is not misjudged. A shard that has never acked and has crashed five times (≈31s of backoff evidence) is fatal: the parent logs, kills its siblings and exits, so a supervisor sees the failure instead of a process that stays up doing nothing. A shard that has ever acked keeps unlimited respawn. |
| 53 | medium | Discovery runs once at boot and its failures are non-fatal, so a transient network blip silently pins the router to a junk symbol universe for the process lifetime | **fixed** — with every reference venue failing, the volume map is empty and the "trimmed to most-liquid" slice is arbitrary enumeration order presented as a ranking. Boot now fails (and the supervisor retries) both when a ranking has no reference behind it and when no routable assignment survives, rather than serving a junk universe until someone restarts it. |
| 59 | medium | A shard that never starts is completely absent from /metrics — no exchange series, no shard series, no restart counter | **fixed** — `order_router_shards_expected` (from config, so it counts shards that never reported), `order_router_shards_reporting` (freshness-filtered over a 15s window, so a dead shard's stale entry stops counting) and `order_router_shard_restarts_total{shard}`. The gap between expected and reporting is the alertable signal that did not previously exist. |
| 14 | high | Attacker-controlled request.ip is inserted into an `inet` column inside the ingest transaction; one crafted header wedges audit ingestion permanently | **fixed** — 6f88bfb3 same fix as blocker 4 |
| 15 | high | The published dev API key `dev-local-key-change-me` is enabled in production whenever NODE_ENV is unset, and the documented systemd unit never sets it | **fixed** — 6f88bfb3 same fix as blocker 0 |
| 25 | high | /stream/route produces zero audit records and zero HTTP metrics — streaming usage is invisible to billing and to Prometheus | **fixed** — cc1501bf audit emission shared by GET/POST /route and every pushed frame; unroutable counter with it |
| 30 | high | C# OrderToDict discards fee and fees, so OrderFeeInAsset always returns 0 and the taker fee is never netted out of what the next hop is sized on | **fixed** — 3f795f91 OrderToDict maps fee and fees via FeeToDict |
| 31 | high | Rust summarise_report sums inAmount/outAmount across every hop, mixing currencies, because Rust step results never carry hopIndex | **fixed** — 3f795f91 summarise_report scoped to first/last hop; hopIndex+legIndex added to results |
| 32 | high | Rust place_step never records a known orderId into openOrders when a post-createOrder call fails, so a resting order can vanish from the operator-facing list | **fixed** — 3f795f91 known-id branch added to the Rust catch path |
| 33 | high | C# mutates the shared execution report from concurrent tasks without the lock it defines for exactly that purpose | **fixed** — a6f995a9 RecordUnconfirmedPlacement and the fill_unconfirmed increment now take reportLock |
| 34 | high | TypeScript alone returns from placeStep before setting inAsset/outAsset/amounts and fee netting on the outcome_unknown path — the other five ports set them first, so the same execution yields a different unwind plan per language | **fixed** — TS block moved after the asset/amount assignment to match the other five; pinned in TS and Rust, still unpinned in Python/PHP/C#/Go (they already behave correctly) |
| 36 | high | The 25 USD cap is computed entirely from route-supplied prices with no freshness check, and on the allowMarketOrders path the order is sent with no price at all | **fixed** — both halves fixed in all six ports: allowMarketOrders + a cap in force is refused before dispatch, and every report now carries planAgeMs with an opt-in maxPlanAgeMs honoured exactly (an age that cannot be determined blocks under an active limit) |
| 37 | high | README "Known gaps" claims there is no /metrics endpoint; the endpoint exists, is documented 200 lines earlier, and is the primary alerting surface | **fixed** — af4ac591 Known gaps rewritten; the three completed entries kept as a 'done since' note |
| 11 | high | A missing ORDER_ROUTER_AUDIT_LOG_FILE kills the key projector, so dashboard-minted keys never authenticate and revocations never take effect | **fixed** — e07d1ca4 `src/db/runner.ts` no longer exits when ORDER_ROUTER_AUDIT_LOG_FILE is unset; ingest is disabled, key projection keeps running, and `runner.test.ts` locks the regression |
| 12 | high | Everything that actually makes the box work — systemd units, env file, nginx/TLS, logrotate — is unversioned and outside the deploy, so a rollback restores code but not config | **fixed** — e07d1ca4 `docs/deploy/` versions the systemd units, env.example, nginx site, logrotate and prometheus rules that make the box work |
| 13 | high | The documented nginx config does not match the live path layout, and the real reverse-proxy config exists only on a VM shared with two other deploy pipelines | **fixed** — e07d1ca4 `docs/deploy/nginx/docs.ccxt.com-router.conf` is the real config, matching the live release/symlink path layout |
| 17 | high | The documented way to revoke the shared ORDER_ROUTER_API_KEY cannot work: the key file is a projection that never contains revoked rows and is rewritten every 5 s | **fixed** — e5209587 `keyProjection.ts` carries a `k_legacy` tombstone across rewrites, so revoking the shared key sticks; documented under "Retiring the shared key" |
| 23 | high | No migration mechanism beyond CREATE IF NOT EXISTS, and the deploy never runs it — a schema change ships code without the schema | **fixed** — e07d1ca4 versioned migrations (`src/db/migrations/`, `migrations.ts`, `migrate.ts`); the deploy runs `db:migrate` before start |
| 24 | high | No backup or restore procedure for the only copy of users, api_keys and all usage history | **fixed** — e07d1ca4 `src/cli/backup.ts` plus a documented restore procedure, covered by `backup.test.ts` |
| 27 | high | The billing ingest process has no health endpoint, no metrics, and no signal when it stops writing | **fixed** — e07d1ca4 `src/db/ingestHealth.ts` exposes ingest liveness through /ready and metrics, with `ingestHealth.test.ts` |
| 28 | high | Nothing scrapes /metrics and no alerts exist; the one documented alert threshold is contradicted by the same README section | **fixed** — e07d1ca4 `docs/deploy/prometheus/{scrape.yml,order-router.rules.yml}` add scrape config and alert rules; the contradictory README threshold is gone |
| 40 | high | README states the service is not publicly exposed, has no self-serve signup, and deliberately has no admin HTTP endpoint — it is live on :443 with public signup and an admin console | **fixed** — e07d1ca4 the README auth/exposure section was rewritten to describe the service as actually deployed: public :443, self-serve signup, admin console |
| 42 | high | The only pre-deploy gate hard-requires a live Kraken order book, so a third-party exchange outage blocks all deploys — including a fix for an in-progress incident | **fixed** — e07d1ca4 the pre-deploy gate no longer hard-requires a live Kraken book; a venue outage degrades the gate instead of blocking the deploy |
| 43 | high | No CI job ever runs the service and the six-language OrderRouter clients together; the two suites are path-exclusive by construction and the shared fixture is a hand-written snapshot nothing regenerates | **fixed** — e07d1ca4 a `fixture-contract` CI job runs the service and the six-language clients against the shared fixture |
| 45 | medium | The deploy job is hard-pinned to the fork `pcriadoperez/ccxt`, so merged upstream nothing deploys and no owner or alternative procedure is defined | **fixed** — e07d1ca4 the deploy job's repository pin and owner/alternative procedure are documented in `docs/deploy/README.md` |
| 46 | medium | No scraper, no alerts and no log rotation on a 7.5 GB box shared with two other production deploys | **fixed** — e07d1ca4 `docs/deploy/logrotate/order-router` plus the prometheus scrape/alert config above |
| 58 | medium | Personal data is retained forever and the documented "delete my data is one statement" erasure does not work | **fixed** — e07d1ca4 `src/db/erasure.ts` implements real erasure (cascade via migration 0001), covered by `erasure.test.ts` |
| 68 | medium | buildUnwindPlan's buy-side recovery order spends more quote than the residual holds — the fixture locks the unfundable number in across all six ports | **fixed** — edf1657f buildUnwindPlan's buy-side recovery now sizes against the residual quote in all six ports; the fixture number was wrong and was corrected |
| 69 | medium | A resting order detected on the sequential / parallel / best_effort paths is recorded but never cancelled, and execution continues on top of it | **fixed** — edf1657f a resting order on the sequential / parallel / best_effort paths is cancelled before execution continues, in all six ports |
