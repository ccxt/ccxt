# U28 — async venue string-return helpers (`Task<string?>`) + implicit-API / loadX rejects

Unit: cs90 roster line U28 (family F, awaited producers). Branch `cs90-U28`, base `d847892a6fcf5699640862316303b6344a3e4daf`
(PR #30530 head, cs-strict-INT), ast-transpiler pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2` — **not an [AST] unit**:
no `build/csharpTranspiler.ts` change, no ast-transpiler change, no hand-written `cs/ccxt/base` change.

## Family

Async (`Task<object>`) venue helpers whose **every return path of every declaration already boxes a string
or null**, retyped by the existing name-keyed `CSHARP_ASYNC_CORE_RETURNS` mechanism
(`installCsharpAsyncCoreReturns`: `printFunctionType` patch + return-path funnel
`((T)((object)(expr)))`) and registered in `CSHARP_LOCAL_AWAIT_RETURN_TYPES` so the
`object x = await this.<name>(...)` locals take the awaited T (same-file resolution carries the
in-file sites; the table carries the pro-tree call sites of the REST declarations).

| name | tier / files | decl | return paths (all boxes) | sites typed |
|---|---|---|---|---|
| `getUrlByMarketType` | pro/bybit | 1 | `return url;` after `url = this.implodeHostname (url)` — `url` starts as `this.urls['api']['ws']` and is only ever reassigned to a leaf of the same nested urls map (`this.urls['api'][accessibility]['usdc'|'contract'|'spot'|<subType>|'option']`), all strings; `implodeHostname -> implodeParams` is declared `string` in the base | 18 |
| `getUtaUrl` | pro/kucoin | 1 | `add(add(urls-private-leaf, "?token="), utaToken)` — `add(object,object)`'s string branch returns a string; both operands are strings/null | 2 |
| `getListenKey` | pro/xt | 1 | 2 × `getValue(client.subscriptions, "token")`; the only writer is `client.subscriptions['token'] = <listenKey:string?>` (and `= undefined`) | 2 |
| `handleToken` | rest bullish (decl), pro/bullish (site) | 1 | `return await this.signIn();` — signIn returns `((string)token)` on its only path; `return this.token;` — `this.token` (`object`) is written only by `SafeString(extendedProperties,"token",null)` and `signIn`'s `((string)token)` | 1 |
| `authenticateRest` | rest paradex (decl), pro/paradex (site) | 1 | `return cachedToken;` / `return token;` — both `string?` locals (`this.safeString` results) | 1 |
| `loadMultiSignAddress` | prediction/opinion | 1 | `return cached;` / `return multiSignAddress;` — both `string?` locals (`this.safeString` results) | 1 |

One declaration per name tree-wide (`grep -rn "Task<[^>]*> <name> *(" cs/ccxt/` — 6/6 single), so the
name-keyed patch cannot move a declaration the census did not cover. Nullable spelling everywhere: a
missing value stays null (`(string?)(object)null` is null), never a throw; the funnel is an identity
unbox on every proven path.

Total: **25 locals typed**, **6 return signatures `Task<object>` → `Task<string?>`**, **10 return-path
funnels**, **1 cast removed** (`string makerLower = ((string)maker).ToLower();` → `maker.ToLower();` in
prediction/opinion.cs, the S09 receiver-cast pass firing on the newly `string?` local — identical
behaviour: the removed cast was an identity conversion and null throws in both spellings).

## Files / tables touched

- `build/csharp-local-types.js` — two table insertions only: `CSHARP_ASYNC_CORE_RETURNS` (+6 names,
  `'string?'`) and `CSHARP_LOCAL_AWAIT_RETURN_TYPES` (+ the same 6). No pass logic, no guard changed.
- Generated (forced full regen, REST + pro + prediction + tests tiers all re-run): `cs/ccxt/exchanges/bullish.cs`,
  `paradex.cs`, `prediction/opinion.cs`, `pro/{bullish,bybit,kucoin,paradex,xt}.cs`.

Census (`campaigns/cs90/census.sh`, base → after):
```
before: locals: object=9304 typed=44132 typed%=82   casts: (string)=2113 (object)=672   returns: object=1080
after:  locals: object=9279 typed=44157 typed%=82   casts: (string)=2112 (object)=682   returns: object=1074
```
(−25 object locals = +25 typed; +10 `((object)` = the funnels; −1 `((string)` = the removed receiver
cast; −6 object returns = the signature retypes.)

## Gates

- Baseline first: forced scoped regens of bullish/paradex (rest), bybit/kucoin/xt (--ws), opinion
  (--prediction) on the unmodified base left `git diff -- cs/` **empty**.
- `python3 /root/.hermes/profiles/deepseek/campaigns/cs90/verify-diff.py HEAD` → **`files=8 pairs=42 unexpected=0`**
  (25 decl retypes, 6 signature retypes, 10 boundary returns, 1 cast-removal pair).
- Determinism: the same three scoped regens re-run twice hash-identical
  (`git diff -- cs/ | sha256sum` = `cefd1e49…` ×3); after commit, two forced **full** regens
  (`--force --noTests`, `--force --noTests --ws`) leave `git status -- cs/` **empty**.
- Farm: `ccxt-farm build --targets cs --wait` on the code commit **`7f914ec04e83fc32230c0d85f2ff62aecad395a4`
  → `job 647 exit=0`, `branch_update=unchanged`** (`ccxt-farm status 647`: `state=succeeded`,
  `exit_code=0`, `transpile_forced_by=generator`; `ccxt-farm log 647 --step buildCS`: `Build succeeded.
  0 Warning(s) 0 Error(s)`). `branch_update=unchanged` is the farm-side full-tree fixed-point proof:
  the farm's own forced regen reproduced the committed tree byte-for-byte.

## Tip note

This REPORT is a REPORT-only commit on top of the code commit (the branch therefore carries the code
commit + this file). A REPORT-only tip carries no build input, so the tip is re-gated from a throwaway
branch exactly as `ccxt-fleet-worktree-campaigns` prescribes (`git branch cs90-U28-gate <tip>`,
`git checkout …`, `ccxt-farm build --targets cs --wait`); the farm note is keyed by sha, so
`ccxt-farm status <tip-sha>` resolves that tip job (exit 0) — the job id is reported in the unit's
final summary/JSON.

## Rejected sub-cases (with reason)

1. **`object x = await this.<implicit API call>` (74 sites)** — `publicGet*`/`privateGet*`/`opinionPrivate*`
   wrappers in `cs/ccxt/api/**` are declared `Task<object>` because one endpoint name can box a dict, a
   list or a scalar and the printer has no per-endpoint response shape; retyping needs an
   endpoint→shape table (cs-strict S26 rejected the pilot). Per the roster line: stays `object`.
2. **`object x = await this.loadAccount/loadX (…)` (28 sites: loadAccount 22, loadQuoteToken 2,
   loadAccounts 2, loadTradeMarket/loadUnifiedStatus/loadLeverageBrackets/…) — stays `object`**: these
   box account/contract rows (dict family, U31), not strings; the roster line assigns them "stay object".
3. **`queryContracts`, `retrieveAccount`, `loadQuoteToken`, `loadTradeMarket`, `internalFetchTransfers`,
   `request`/`fetch2`, `fetchPaginatedCallDynamic`** — every return path is a dict/list (`Dictionary<any>`,
   `TransferEntry[]`, `filterBySinceLimit(...)`), not a string.
4. **`resolveEventSeriesTickers` (1 site)** — returns `string[]` (a list of strings), not a string.
5. **`changeApiKey` (lighter, 1 site)** — `return signer;` is checker-typed `any` (an opaque client
   object built by `lighterCreateClient`); no string proof → reject.
6. **`getAccountId` (apex, 1 site)** — `return this.options['accountId']` is a user-set option value
   (`getValue(this.options, "accountId")`, no writer census forcing a string) → would be an unsafe unbox;
   also the `this.options` receiver reads belong to U41.
7. **`ethRpc` / `sendEvmTransaction` (prediction, 4 sites)** — `return this.safeValue (response, 'result')`
   is an RPC result that is a hex string for some methods and a dict/array for others → reject.
8. **`authenticate` (4 sites) / `isUTAEnabled` (24 sites)** — U29's roster lines (mixed `(future as Future)`
   / `Task<bool>` joins); not retyped here.
9. **`negotiateHelper` (kucoin)** — checker-proven string but has **no** `object x = await this.…` local
   in the tree (only `negotiate` calls it, U27-owned) → nothing to type; left alone to keep the diff
   minimal.
10. **`keepAliveListenKey` (7 declarations)** — every path is a bare `return;` (null box), not a string; no
    local sites either → left alone.
11. **Sync siblings `gate#getUrlByMarket` / `gate#getTypeByMarket` / `htx#getUrlByMarketType`** — sync
    string helpers belong to U33 (`CSHARP_STRING_RETURN_METHODS`); the name-keyed async patch cannot fire
    on them (`isAsyncFunction` guard), verified: htx's sync declaration is untouched.
12. **`watch*`/`unWatch*`/`subscribe*` locals (700+)** — U27/U29 territory (resolved handler values).

## Residual risk

- The proof for `getUrlByMarketType` and `getListenKey` is a source-level census (their runtime box is an
  `any` in TS — no checker type to lean on), so it rests on the writer census of `this.urls` and
  `client.subscriptions['token']` documented above; a future venue override of either name that returns a
  non-string would now throw at the funnel instead of flowing as `object`. The mechanism is name-keyed
  and the farm's `buildCS` gate compiles every declaration, but a wrong runtime box is only catchable in
  the id-tests (`npm run id-tests-cs`) — those exercise request construction, not these ws helpers, hence
  the risk stays documented rather than closed.
- `handleToken` unboxes `this.token`, a public `object` property of BaseExchange: every writer in the tree
  is a `safeString`/`(string)` producer (census above), but user code that assigns a non-string to
  `exchange.token` would now hit the unbox cast in `handleToken`.
- All six signatures are `virtual` single declarations; no CS0508 surface (farm-confirmed).

## Hotspot lines

- `build/csharp-local-types.js`: `CSHARP_ASYNC_CORE_RETURNS` (+6 entries, the string block after
  `ensureErc20Allowance`) and `CSHARP_LOCAL_AWAIT_RETURN_TYPES` (+ the same 6). No other file.

## Tooling

`campaigns/cs90/tools/U28/string_returns_census.py` (per-declaration return-path census over the emitted
tree), `campaigns/cs90/tools/U28/sites.py` (`object x = await this.<name>(` site census + per-name
declaration/returns dump), `campaigns/cs90/tools/U28/return-paths.mjs` (TS-checker probe: async methods
whose every return is checker-typed string-ish).
