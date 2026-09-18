# U29 — `await client.future(...)`, `await this.isUTAEnabled()`, `await this.authenticate(...)`

Branch `cs90-U29`, base `d847892a6fcf5699640862316303b6344a3e4daf`, ast pin
`404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (untouched — this is not an `[AST]` unit).
Code commit (farm-gated): **f14bd66d2547c7d7053c19a59756d1ddfef16004**.
Farm: **job 667, exit=0**, `buildCS` 0 Warning(s) / 0 Error(s), `branch_update=unchanged`
(= the farm's own full transpile on the same pin reproduced this tree byte-for-byte, so the
scoped local regens were a fixed point), `generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`.

Result: **24 sites typed, 0 casts removed**, 23 emitted write-coercions (one new emission class,
audited below), 1 signature retype, 1 `Task<object>` → `Task<string?>` return.

## Family and what fires

Roster line U29 has three sub-families. Only the middle one is provable; the other two are
rejected with the proofs below.

### 1. `object uta = await this.isUTAEnabled()` (24 sites) → `bool` — 23 typed

The awaited value already is a plain `bool` (`CSHARP_LOCAL_AWAIT_RETURN_TYPES['isUTAEnabled']`,
base), so the only blocker was the **later write**: every one of the 24 sites has exactly one,
`uta = utaparametersVariable[0];`, the element-0 read of
`this.handleOptionAndParams(parameters, "<method>", "uta", uta)`.

That element is the **user's params value** (`Exchange.BaseMethods.cs#handleOptionAndParams`:
`safeValue2(parameters, …)` → `safeValue2(this.options, …)` → `defaultValue`), i.e. exactly the
path `build/csharp-local-types.js` lines 446–476 declares deliberately untyped. A `(bool)` cast
there would be a runtime assertion that throws `InvalidCastException` for `params['uta'] = 'yes'`
(which the TS side reads truthily), so the write is named with the hand-written **truthiness
coercion** instead:

```csharp
bool uta = await this.isUTAEnabled();
IList<object> utaparametersVariable = (IList<object>)this.handleOptionAndParams(parameters, "fetchAccounts", "uta", uta);
uta = isTrue(utaparametersVariable[0]);      // was: uta = utaparametersVariable[0];
```

Equivalence proof (also in the classifier comment): `isTrue` is idempotent —
`isTrue(isTrue(v)) === isTrue(v)` for every box (it returns a `bool`, and the `isTrue(bool)`
overload at `Exchange.TranspileHelpers.cs:227` is the identity) — and the proof requires that
**every other use of the local in the method is a truthiness read** (`if (x)`, `x ?:`, `!x`,
`x || y` / `x && y` inside such a position — the printer wraps each in `isTrue(x)`) **or that
same tuple call's own `defaultValue` argument** (which reads the awaited bool, unchanged).
The proof also requires the tuple call's 4th argument to be the local itself. `isTrue(utaparametersVariable[0])`
therefore reads exactly what the former object local read, for every input including a
non-bool params value; nothing is widened, no cast is added.

Shard key (disjointness): the declaration's **initializer** must be the `await this.isUTAEnabled()`
call. `object uta = false; … uta = await this.isUTAEnabled();` (U14's literal/null-init shards of
the same census family) and `object uta = null` never enter this rule, and the rule never fires
on `paginate` / `returnRateLimits` / `useSync` / `fetchTickersFees` (probed and rejected by the
`csharpType !== 'bool'` / initializer guards).

Per-site: 20/20 in `cs/ccxt/exchanges/kucoin.cs`, 3/4 in `cs/ccxt/exchanges/pro/kucoin.cs`
(see rejection R2 for the 4th).

### 2. `object token = await this.authenticateRest()` (paradex, 1 site) → `string?`

`paradex#authenticateRest` (`cs/ccxt/exchanges/paradex.cs`) has two return paths and both hand
back a `string?` local (`cachedToken = safeString(this.options, "authToken")`,
`token = safeString(response, "jwt_token")`), so `CSHARP_AWAITED_CORE_RETURNS['authenticateRest'] = 'string?'`
retypes the declaration (per-declaration return-path proof, `awaitedCoreBoxType`) and the
cross-file local (the call sits in `pro/paradex.cs`, the declaration in `paradex.cs`) takes the
box through `CSHARP_LOCAL_AWAIT_RETURN_TYPES['authenticateRest']`. The 7 other call sites
(`await this.authenticateRest();`) ignore the result.

## Tables / rules / passes touched (`build/csharp-local-types.js` only)

| Where | Change |
|---|---|
| new `isUTAEnabledAwaitedInit`, `isTruthinessRead`, `destructuredIsUTAEnabledBoolProof` | the shard's proof (read-shape scan + tuple/helper/default-argument key) |
| `destructuredBoolCoercions` (new WeakMap) + `recordDestructuredWriteType(…, isUTAEnabledBool)` | records the shard's targets per scope |
| `installDestructuredCasts` | new branch: a target in the coercion set emits `x = isTrue(<read>);` instead of a cast |
| `csharpLocalIsSafeToRetype` (ArrayLiteralExpression case) | accepts the new proof alongside `destructuredWriteIsCastable` |
| `installCsharpLocalTypes` declaration wrapper | passes the shard flag when recording the retyped declaration |
| `CSHARP_AWAITED_CORE_RETURNS['authenticateRest']`, `CSHARP_LOCAL_AWAIT_RETURN_TYPES['authenticateRest']` | paradex `Task<object>` → `Task<string?>` |

`build/csharpTranspiler.ts` untouched, ast-transpiler untouched, hand-written base untouched →
**0 `hotspot:` lines** for this unit.

## Census (`campaigns/cs90/census.sh`, `cs/ccxt/exchanges/**`)

before: `locals: object=9304 typed=44132 typed%=82` · `returns: object=1080` · casts unchanged
after:  `locals: object=9280 typed=44156 typed%=82` · `returns: object=1079` · casts unchanged

casts removed = **0** (this unit adds none and removes none); typed declarations = **24**
(23 `uta` + 1 `token`); signature retypes = 1.

## Diff gate

`python3 campaigns/cs90/verify-diff.py HEAD` → `files=4 pairs=48 unexpected=23` (rc=1).
The 48 pairs are 23 declaration retypes + 23 coercion writes + paradex's signature retype + the
`token` local; verify-diff models casts/returns/signatures only, so **all 23 UNEXPECTED entries
are the one coercion class** (`x = tmp[0];` → `x = isTrue(tmp[0]);`), justified above.

Dedicated pair audit: `campaigns/cs90/tools/U29/coercion-audit.py` → `declaration pairs=23
coercion pairs=23 verify-diff classes=2 flagged=0` (rc=0). It accepts a coercion only when the
same file carries the matching `object x = await this.isUTAEnabled();` → `bool x = …` pair for
that name, and when target/holder/index are byte-identical; `--selftest` proves it flags
holder, index, missing-declaration, retargeted and declared-value corruptions (5 cases).

Per-site evidence: `campaigns/cs90/tools/U29/census_sites.py` (enclosing method + every read/write
of the local, used to prove the truthiness-only read set).

## Rejected sub-cases (each with the reason)

**R1 — `object x = await client.future(...)` (15 sites: 14 `pro/*.cs` `snapshot` +
`prediction/myriad.cs` `tickers`): rejected, the roster's `-> Future` target is unsound.**
`cs/ccxt/ws/Future.cs:56` declares `public TaskAwaiter<object> GetAwaiter()`, so
`await client.future(hash)` is statically **`object`**; `Future snapshot = await client.future(...)`
does not compile (CS0029) and `Future` is not "what the box already is".
The value's actual box is the *resolve* value (e.g. `(future as Future).resolve(cache)` where
`cache = this.positions` = a fresh `ArrayCacheBySymbolBySide`), i.e. nameable only by an
interprocedural message-hash/resolve census — the mechanism `UNITS.md` assigns to U27
(`watch*` family) and U45 (`client.*` reads). Even then it would inject a cast into the hot
`watchPositions` snapshot path and remove **no** cast: all 15 sites have exactly one read, an
`object`-taking helper (`this.filterBySymbolsSinceLimit(snapshot, …)`,
`ccxt.BaseExchange.ToPosition(snapshot)`, `this.filterByArray(tickers, …)`).

**R2 — `cs/ccxt/exchanges/pro/kucoin.cs:3191` (watchPositions), `object uta = await this.isUTAEnabled()`: rejected.**
Its `uta` is forwarded as an object: `this.setPositionsCache(client, uta)` →
`this.spawn(this.loadPositionsSnapshot, new object[] {client, messageHash, uta})` →
`FetchPositions(null, new Dictionary<string, object>() {{ "uta", uta }})`. The raw box reaches a
**request body**, so the coercion would send `true` where the object local sent the user's value
(rule 1: declared types never change a runtime value). The read-set proof rejects it automatically
(the read is an argument, not a truthiness test); the other 23 sites' read sets are truthiness-only.

**R3 — `object key = await this.authenticate(parameters)` (lbank `pro/lbank.cs:595, :774`): rejected, blocked by another family.**
lbank's `authenticate` prints `Task<object>` because two return paths are
`getValue(getValue(client.subscriptions, "authenticated"), "key")` — the classifier cannot name
that box (a `client.subscriptions` writer census is U04/U11/U45 territory), and the retype route is
the shared name-keyed `CSHARP_AWAITED_CORE_RETURNS['authenticate']` entry (35 declarations across
the ws tree). The local types itself as soon as that proof lands; typing it here would mean
duplicating a sibling unit's rule.

**R4 — `object url = await this.authenticate()` (bitrue `pro/bitrue.cs:88, :228`): rejected, same shape as R3.**
Both return paths are `this.options` literal-key reads
(`getValue(this.options, "listenKeyUrl")`, `getValue(this.options, new object[] {"listenKeyUrl"})`)
— the `this.options` key table is U05/U41's; the retype route is again the shared `'authenticate'`
entry. (The roster's "6" counts these four plus paradex's `authenticateRest` and the
already-typed `authenticateUta`.)

**R5 — `object uta` sites whose initializer is `false` / `null`** (U14's shards of the same census
family, `kucoin#fetchCurrencies` `object uta = false; … uta = await this.isUTAEnabled();` etc.):
not touched, deliberately. Same family, lower unit number owns it; my rule is keyed on the
awaited-isUTAEnabled **initializer**, so the two shards cannot both fire on one site. If U14 lands
the element-0 bool proof for `handleOptionAndParams`, these sites type without any interaction
with this rule.

## Residual risk

- The coercion changes the stored **box** of `uta` (raw option value → `isTrue(...)` bool) at the
  23 sites. Proven read-equivalent at every use, but it is a value rewrite, not a declaration-only
  change — hence the dedicated audit and the `verify-diff` UNEXPECTED class. If the integrator
  prefers declaration-only diffs, R1–R4 still stand and only this class (23 pairs) needs reverting;
  the two paradex pairs are ordinary verify-diff classes.
- Out-of-contract input (`params['uta'] = 'yes'`) now stores `true`: every read is a truthiness
  test, so the branch taken is identical to the object local's — but the local is no longer the
  user's raw box (no site forwards it; R2 is the one that did and is rejected).
- No runtime (dotnet/test) execution is available on this VM beyond the farm `buildCS` step: the
  farm proves compilation with 0 warnings, not the watch paths' runtime behaviour.
- `isTrue` idempotence is read off the hand-written helper (`Exchange.TranspileHelpers.cs:227/232`);
  if that helper's `bool` overload ever stops being the identity, this family must be re-proved.
- `CSHARP_AWAITED_CORE_RETURNS`/`CSHARP_LOCAL_AWAIT_RETURN_TYPES` are shared, name-keyed tables:
  `authenticateRest` appears once in the tree (paradex), so no sibling unit can collide on the key;
  the mechanism itself (S52 proof) is U28's.

## Files

`build/csharp-local-types.js`, `cs/ccxt/exchanges/kucoin.cs`, `cs/ccxt/exchanges/pro/kucoin.cs`,
`cs/ccxt/exchanges/paradex.cs`, `cs/ccxt/exchanges/pro/paradex.cs`.
Tooling (profile, not the repo): `campaigns/cs90/tools/U29/{coercion-audit.py,census_sites.py}`.
