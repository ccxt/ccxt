# U23 — `object limitVar = limit` core-arg copies: census + proof of unsafety, 0 sites typed

Unit: U23 (roster line: `object limitVar = limit` (304) in REST+pro cores where `limit` is `object`
param — census WHY per site (CORE_ARG_SHADOW_SKIP_POSITIONS or object core param), extend
`retypeCoreArgCopies` to the pro tree → `Int64? limitVar`).
Base `d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head), branch `cs90-U23`, worktree
`/root/worktrees/cs90/U23`. **Not an `[AST]` unit** — no ast-transpiler edit, no pin bump, no
hand-written `cs/ccxt/base` edit, no `ts/src` edit.

## Result

* casts removed: **0** · generated-tree sites typed: **0** · provable sites remaining in the family: **0**
* one product change: a 3-line census comment above `CORE_ARG_SHADOW_TYPES`
  (`hotspot: build/csharpTranspiler.ts:1149-1151`). **No rule was changed**, and the emitted tree is
  byte-identical to the base (forced regens over all 104 REST / 76 ws / 7 prediction ids: every exit 0,
  `git diff -- cs/` empty). The family is *fully accounted for*: 5 sites are already typed by the
  existing rules (pro/coinex.cs:858 + pro/htx.cs:503 by the round-3 cs-strict campaign, kucoin.cs:3869/
  3975/4047 by round 2 / #30502), and each of the remaining 305 carries a specific, measured blocker
  (below).

## Census (before == after, `campaigns/cs90/census.sh`)

```
locals: object=9304 typed=44132 typed%=82
casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
params: object=11635  returns: object=1080
```

Family (`tools/U23/census-out.txt`, `tools/U23/limitvar-census.py`):

| site shape | n | where |
|---|---|---|
| `object limitVar = limit;` | 304 | pro 215, REST 85, prediction 4 |
| `Int64? limitVar = limit;` (already typed) | 5 | pro/coinex.cs:858, pro/htx.cs:503, kucoin.cs:3869/3975/4047 |
| `object requestLimit = limit;` | 1 | mudrex.cs:380 |

`tests` tier: 0 (`retypeCoreArgCopies` does not run there — S44 Proof 1).

## WHY per site: both roster hypotheses are dead, the real cause is the later WRITE

* **`CORE_ARG_SHADOW_SKIP_POSITIONS`** — the table no longer exists: round 3's S44 deleted it and
  proved (instrumented, whole tree) 0 consultations at a skipped position and 0 firings. It can hold
  back none of these sites. 0 sites.
* **"the core param is still `object limit`"** — 0 of 310 sites. Walking back from each site to the
  `public …(` signature that declares its `limit` gives `Int64?` for every one (a single prediction
  core, `Int64`). All 304 sites are shadowed **because the body assigns to the parameter**, not
  because the parameter stayed untyped.
* **Measured cause** — every one of the 305 object copies is *reassigned* after the declaration, and
  the pass (`coreArgShadowIsProvable`) requires every later use to be provable. Census of the
  **first blocking use per site** (temporary `CS90_U23_DEBUG` hook in `coreArgShadowIsProvable`
  /`retypeCoreArgCopies`, logging only, removed again before the commit; raw logs in
  `tools/U23/logs/`; independent Python replica with `--selftest`: `tools/U23/limitvar-use-kinds.py`):

| sites | first blocker | why the copy cannot become `Int64?` |
|---|---|---|
| 204 | `limitVar = callDynamically(<cache>, "getLimit", new object[] …)` — 202 pro + 2 prediction | `callDynamically` returns `object` (`Exchange.TranspileHelpers.cs:1398`) ⇒ CS0266. The type-correct spelling `((Int64?)…)` **throws**: `ArrayCache._getLimit` returns `Math.Min(Convert.ToInt32(newUpdatesValue), Convert.ToInt32(limit2))` or `newUpdatesValue` (both boxed **Int32**) and `ArrayCacheByTimestamp.getLimit` returns `int` (`cs/ccxt/ws/ArrayCache.cs:162/170/282/290`). `ToInt64Arg(…)` would work but normalises the box Int32 → Int64 (rejected campaign-wide, see below) |
| 76 | `limitVar = <integer literal>` (incl. `??=`) — 74 pro/REST + prediction binance + mudrex | `Int64? x = 100` converts the literal and boxes an **Int64** where the `object` spelling boxes an **Int32** — the documented deliberate rejection (`CORE_ARG_SHADOW_TYPES` comment; cs90 U32 roster line; round-3 S32 rejected sub-case 5) |
| 10 | `limitVar = cond ? <integer literal> : limitVar;` | same box change through the conditional's natural type |
| 9 | `limitVar = mathMin/mathMax/this.sum(…)` | those helpers return `object` ⇒ CS0266; a typed overload would convert the literal arm's Int32 box |
| 3 | `limitVar = maxLimit;` / `= defaultLimit;` (object/`int` locals) | `object` RHS ⇒ CS0266, or an Int32 box |
| 1 | `limitVar = <x>parametersVariable[0];` (`handleOptionAndParams` element) | element of an `IList<object>` ⇒ `object` ⇒ CS0266 |
| 1 | read-first: `object userLimit = limitVar;` (phemex.fetchOHLCV, also has `limitVar = maxLimit;`) | the declaration-copy initializer rule does not accept an alias RHS; the site has an object-local write anyway |
| 1 | reads only (prediction polymarket `fetchOHLCV`) | `object barCount = (…) ? limitVar : 100;` (the conditional's natural type would become `Int64?`, so `barCount`'s box changes) **and** `prefixUnaryNeg (ref limitVar)` — no `ref Int64?` overload exists (the ref-sink family) |

**No site of the 303 instrumented ones is reachable by extending only the read rules** (Python
replica: 303/303 rejected, 1 read/ref-sink-only). Every blocker is a write, a ref sink, or a box
change in a read.

## Why the "extend `retypeCoreArgCopies` to the pro tree" route cannot fire (proof)

1. The declaration itself is box-identical (`limit` is `Int64?`, so `object limitVar = limit;`
   already boxes an Int64/null) — what blocks all 305 is the *write*, and the pass correctly refuses
   a shadow whose other uses are unprovable.
2. `coreArgShadowRhsIsTyped` admits only casts to the target type and the
   `safeInteger/safeFloat/safeNumber/parseToInt/To*Arg` family. Every write shape at these sites is
   outside it, and none of the missing shapes is box-preserving: `callDynamically` and the numeric
   helpers return `object`, the literals convert, the copies' sources are object/`int`.
3. The producer that would unblock the 202/204 `getLimit` sites is a *hand-written base helper*
   (`ArrayCache.getLimit`/`_getLimit`, `ArrayCacheByTimestamp.getLimit`). Retyping it to `Int64?`
   forces a conversion inside the helper (`return limit2;` is `object`; `Math.Min(int,int)` is Int32),
   i.e. it changes the box every caller receives — rule 1. Round 3's S32 rejected the same route
   explicitly ("needs a typed `getLimit`/`callDynamically` producer … not a copy retype") and S56
   #7 left `getLimit` alone; S28/S30/S55 rejected box-changing return retypes for the same reason.
4. An integer literal cannot be put into an `Int64?` local while keeping the Int32 box — the literal
   class is unprovable *by construction*, independent of policy.

⇒ 0 additional declarations. Per the brief this is the "0 changes with a proof of unsafety" outcome:
the family cannot be typed without changing a runtime box, and the box rule is campaign-wide.

## Rejected sub-cases (each with reason)

1. **204 × `callDynamically(<cache>, "getLimit", …)` writes** — CS0266 without a cast; the
   `(Int64?)` unbox throws on the Int32 boxes the two cache implementations return; `ToInt64Arg`
   normalises the box. Not taken.
2. **76 × integer-literal writes** — documented box change (Int32 → Int64). Not taken.
3. **10 × ternary writes with a literal arm** — same box change. Not taken.
4. **9 × `mathMin/mathMax/this.sum(limitVar, …)` writes** — `object` RHS; a typed overload would
   convert the literal arm. Not taken.
5. **4 × object-local copies** (`maxLimit`/`defaultLimit`, incl. phemex) — `object`/`int` RHS. Not taken.
6. **1 × destructuring write** (`limitparametersVariable[0]`) — `IList<object>` element. Not taken.
7. **1 × read/ref-sink-only site** (polymarket `fetchOHLCV`) — the `? limitVar : 100` read changes
   `barCount`'s box and `prefixUnaryNeg (ref limitVar)` needs a `ref Int64?` overload that does not
   exist. Not taken.
8. **`object requestLimit = limit;` (mudrex)** — same integer-literal class, same rejection.
9. **Retyping `ArrayCache.getLimit`/`_getLimit` (+`ArrayCacheByTimestamp`) to `Int64?`** — the one
   change that would make the 204 getLimit sites typeable; rejected as a box change for every caller
   of a shared hand-written helper (the failure shape of PR #30356), as a producer-typing task that
   belongs to a producer unit rather than to this copy family, and because the return type is pinned
   by a hand-written test (`cs/tests/ArrayCacheRegressionTest.cs:174-176` asserts on it).
   **Escalated below.**
10. **Relaxing the int-literal rule** — re-litigates a documented decision (U32 roster line:
    "int literal into `Int64?` is box-different → keep") without new evidence; my census *confirms*
    the rejection rather than overturning it. Not taken.
11. **Read-rule extensions** (alias-RHS declaration initializer) — measured: they would fire on 0
    sites that are not blocked by a write. Not taken.
12. **Sibling copies** (`symbolVar` 183, `sinceVar`, `timeframeVar`, `outcomeVar`) — U24/S04/S32
    families (lower/other-unit ownership); untouched. The same instrumented run shows their blockers
    (e.g. `symbolVar = GetValue(market, "symbol")` → `object`).

## Escalation (no `clarify()` used — question for the integrator)

The 204-site `getLimit` class is blocked on a campaign-level policy, not on this unit: it becomes
typeable in one pass **iff** the campaign accepts normalising a boxed numeric at a narrowed numeric
local/producer (`ToInt64Arg`-style, value-preserving; the base already documents that conversion for
narrowed call sites) and retyping the two `ArrayCache` `getLimit` definitions to `Int64?`. With the
box rule as written (rule 1, S32 #3/#5, S28/S30/S55), **0 is the correct number for this family**.

## Gates

```
# forced, whole-tree, local (the worktree carries the pinned ast checkout; dotnet never runs here)
npx tsx build/csharpTranspiler.ts --force --noTests  <104 REST ids>        -> rc 0, git diff -- cs/ EMPTY
npx tsx build/csharpTranspiler.ts --force --ws --noTests <76 ws ids>       -> rc 0, git diff -- cs/ EMPTY
npx tsx build/csharpTranspiler.ts --force --prediction --noTests <7 ids>   -> rc 0, git diff -- cs/ EMPTY
python3 /root/.hermes/profiles/deepseek/campaigns/cs90/verify-diff.py HEAD -> files=0 pairs=0 unexpected=0 (exit 0)
bash /root/.hermes/profiles/deepseek/campaigns/cs90/census.sh              -> identical to the block above
python3 tools/U23/limitvar-use-kinds.py --selftest                         -> SELFTEST PASS (5/5 cases)
```

Farm (dotnet is farm-only):
```
ccxt-farm build --targets cs --wait   -> farm: job 701 admitted on slot 8 (targets=cs)
HEAD d0456c8fcdddfb1b52cb35ab49ca27d2d0005d26 job=701 exit=0 branch_update=unchanged
                                       generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
ccxt-farm status 701                  -> {"state": "succeeded", "exit_code": 0, "branch_update": "unchanged",
                                          "failing_step": "", "failing_files": []}
ccxt-farm log 701 --step buildCS      -> Build succeeded.  0 Warning(s)  0 Error(s)
```
`branch_update=unchanged` on the farm's own forced transpile is the fixed-point proof: the committed
tree is what the generator emits. The branch was left at the gated commit (the farm produced no
`[Automated changes]` commit, so no reset was needed).

## hotspot: lines

```
hotspot: build/csharpTranspiler.ts:1149-1151   census comment above CORE_ARG_SHADOW_TYPES (3 lines, no rule change)
```

No ast-transpiler `src`, no hand-written `cs/ccxt/base/*.cs`, no `ts/src`, no generated `cs/` file,
no `build/csharp-local-types.js` change.

## Residual risk

* **Generated tree unchanged** ⇒ zero runtime risk from this unit; the risk is a *missed typing
  opportunity* (204 sites) if the integrator decides the box normalisation above is acceptable.
* The census numbers come from the base tree plus a temporary debug hook; the hook is removed and
  the raw logs are kept (`tools/U23/logs/u23_ws_regen.log`, `u23_rest_regen.log`,
  `u23_{ws,rest,pred}_d2.log`), so every number can be re-derived. The hook's only behavioural
  difference existed when `CS90_U23_DEBUG` was set (`continue` instead of `return false`).
* One site (prediction binance) and mudrex's `requestLimit` were not logged by name (alias/flag
  combination); both are integer-literal writes read off the emitted tree.
* The five already-typed sites are engine-verified only up to compile via the farm build (dotnet
  cannot run on this VM); no runtime lane was executed for this unit (it changes nothing at runtime).

## Artifacts (campaign tooling, profile side — nothing new under `build/`)

```
campaigns/cs90/tools/U23/limitvar-census.py       site census: walks each site back to its declaring signature
campaigns/cs90/tools/U23/limitvar-use-kinds.py    Python replica of coreArgShadowUseKind/RhsIsTyped/CalleeAllows (Int64?) + --selftest
campaigns/cs90/tools/U23/census-out.py            writes census-out.txt (family + blocker table)
campaigns/cs90/tools/U23/census-out.txt           the census output
campaigns/cs90/tools/U23/logs/                    instrumented transpile logs + the full id lists
```
