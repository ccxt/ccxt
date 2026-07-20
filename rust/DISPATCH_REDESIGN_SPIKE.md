# Spike: trait-based dispatch to replace the raw-pointer design (review P0 #1)

**Status:** design validated by an isolated proof-of-concept; rollout scoped.
**Recommendation:** GO for the REST tier; stage WS/prediction behind an
explicit-accessor variant. See "Verdict" at the bottom.

## Problem (from the review)

Base `Exchange` methods dispatch to derived-exchange overrides through raw
pointers stored in `Internals`:

- `derived_ptr: *const dyn DerivedExchange` — for sync overrides
  (`self.derived().parse_ticker(...)`), 33 call sites in
  `exchange_generated.rs` (+3 prediction).
- `derived_core_ptr: *mut ()` + `call_async_fn: DynCallFn` — for async
  overrides (`self.dispatch_to_derived("cancel_order", args).await`), 63
  sites in `exchange_generated.rs` (+21 prediction, +3 stubs).
- `unsafe impl Send/Sync for Internals` to move the pointers across await.
- Each Core's `init()` captures `self`'s address *before* it is at a stable
  location; safe callers can move the Core and invalidate the pointer. The
  compiler cannot enforce the documented lifetime invariant.

## Proposed design (proven)

Replace both pointers with **static trait dispatch**. See the runnable PoC:
`/tmp/.../scratchpad/dispatch_poc.rs` (compiles with `rustc`, all asserts pass).

```
trait Derived {                         // the override surface (today's DerivedExchange)
    fn parse_ticker(&self, ..) -> ..    // &self, default returns the "unset" sentinel
}
trait ExchangeBase:                     // the base methods, as trait DEFAULTS
    Derived + DerefMut<Target = Exchange> + Sized + Send
{
    fn parse_tickers(&mut self, ..) {   // was impl Exchange
        Derived::parse_ticker(self, ..) // STATIC dispatch to the Core's override
    }
    fn call_dynamic(&mut self, m, args) // async fan-out, per-Core match
        -> Pin<Box<dyn Future<..>>>;    // boxed → handles base→derived→base recursion
    fn cancel_order_with_client_order_id(&mut self, ..) -> Pin<Box<..>> {
        // reentry guard on self.dispatch_stack, then self.call_dynamic(..)
    }
}
impl Derived for BinanceCore { .. }     // generated forwarders → inherent overrides
impl ExchangeBase for BinanceCore {     // generated: only call_dynamic (the match)
    fn call_dynamic(..) { match m { "cancel_order" => self.cancel_order_impl(..), .. } }
}
```

Why it works:
- Inside a default method, `Self` is the concrete Core, so
  `Derived::parse_ticker(self, ..)` monomorphizes to the Core's forwarder →
  its inherent override. **No pointer, no `unsafe`, no manual `Send`/`Sync`**
  (the `Send` bound is now an ordinary bound the compiler checks).
- `self.<field>` still works via `DerefMut<Target = Exchange>` auto-deref.
- Un-overridden methods fall back to the `Derived` trait default (verified).
- Async recursion is handled by returning `Pin<Box<dyn Future>>` from
  `call_dynamic` (same boxing the current `DynCallFn` already does).
- The re-entry guard (`dispatch_stack`) stays as an `Exchange` field.

PoC output:
```
sync dispatch  ✓  ["binance-ticker(x)", "binance-ticker(y)"]
fallback       ✓  ["<base-default z>"]
async dispatch ✓  binance-cancelled(o1)
```

## Rollout surface (measured)

| Area | Count | Notes |
|---|---|---|
| Base methods in `exchange_generated.rs` | 520 | emit as `trait ExchangeBase` defaults |
| — that dispatch to derived (sync `.derived()`) | 33 | codegen → `Derived::X(self, ..)` |
| — that dispatch to derived (async) | 63 | codegen → `self.call_dynamic("X", ..)` |
| Prediction base dispatch sites | 24 | second trait layer (Deref through `PredictionExchange`) |
| Stub dispatch sites | 3 | hand-written, rewrite by hand |
| REST Cores | ~100 | generated `impl ExchangeBase`/`Derived` (mechanical) |
| WS (pro) Cores | ~100 | **Deref-chain conflict — see risks** |

Because base methods heavily inter-call, the cleanest transpiler change is to
emit the **entire** base as `trait ExchangeBase` defaults (not just the 96
dispatchers), then generate a per-Core `impl ExchangeBase` supplying only
`call_dynamic`. A blanket `impl<T: CoreDispatch + Derived + DerefMut> ExchangeBase for T {}`
removes even that per-Core boilerplate.

## Risks / open issues

1. **WS tier Deref conflict (highest).** A WS Core `Deref`s to its REST parent
   (`WsBinanceCore → RestBinanceCore → Exchange`); a type may have only one
   `Deref` impl, so `Self: DerefMut<Target = Exchange>` is not directly
   satisfiable for WS Cores. Options: (a) migrate the base trait to explicit
   `fn base(&mut self) -> &mut Exchange` accessors instead of relying on
   `DerefMut<Target=Exchange>` (uniform across tiers, but changes how every
   base method reaches fields — larger codegen change); (b) flatten WS Cores to
   hold `Exchange` directly (loses REST-method inheritance via Deref);
   (c) migrate REST + prediction now, leave WS on the pointer design as an
   interim. Recommend (a) long-term, (c) to de-risk the first landing.
2. **Bare `Exchange` unit tests.** `exchange.rs` and `value.rs` construct a
   bare `Exchange::new(None)` and call base methods on it. A bare `Exchange`
   can't be an `ExchangeBase` (can't `Deref` to itself). Fix: give those tests
   a trivial `TestCore` wrapper, or keep a thin `impl Exchange` shim for the
   handful of methods they touch.
3. **Prediction second layer.** Prediction Cores `Deref` through
   `PredictionExchange` → `Exchange`; same one-Deref constraint as WS. Needs
   the accessor approach or a `PredictionBase` trait layered on `ExchangeBase`.
4. **Transpiler churn.** `transpileBaseMethods` must emit a trait+defaults
   instead of `impl Exchange`; the `.derived()`/`dispatch_to_derived` codegen
   rewrites; `emitDerivedExchangeImpl` gains the `impl ExchangeBase`. Medium,
   mechanical, but every base method's receiver/borrow shape is re-exercised —
   expect a borrow-checker cleanup pass.
5. **Regression surface.** The whole offline suite re-validates (4280 request,
   1392 response, base, prediction). The static-request offline mode relies on
   the per-method re-entry guard + panic/catch behavior in
   `dispatch_to_derived`; that logic must be preserved exactly in
   `cancel_order_with_client_order_id`-style defaults.

## Confirmed: binance's offline tests DO exercise base dispatch

Surface map (agent, static analysis of `tests.rs` / `live_dispatch.rs` /
`exchange_generated.rs`):

- The test harness calls `BinanceCore::call_dynamic` (a per-Core `match`),
  which invokes binance's **inherent** override directly — so a method binance
  overrides bypasses its own base wrapper. **This means the harness's
  type-erased `CoreEntry` fn-pointers (test→core) are a *separate* mechanism
  from the base→derived pointers and do NOT need to change.** The redesign only
  removes the `Exchange`-internal `derived_ptr` / `derived_core_ptr` /
  `call_async_fn`.
- Base dispatch IS still hit, so the migration is validated by the suite:
  - **`sign` (slot 1057) — every one of the 95 request fixtures**, via base
    `fetch2 → self.sign()` (self : Exchange → derived().sign → binance.sign).
  - **Singular `parse_*` via inherited plural helpers** on responses:
    `parse_tickers→parse_ticker` (1393), `parse_trades→parse_trade` (1413),
    `parse_orders→parse_order` (1462), `parse_ohlcvs→parse_ohlcv` (4174),
    plus `parse_balance` (5496), `parse_transaction` (1423),
    `parse_position` (1518), `parse_currency` (1338), and others.
  - **Inherited-method async redirects** through `dispatch_to_derived`:
    `fetch_leverage→fetch_leverages` (1734), `fetch_funding_interval→
    fetch_funding_intervals` (1599), `fetch_position_adl_rank→
    fetch_positions_adl_rank` (6019), `fetch_premium_index_ohlcv→fetch_ohlcv`
    (3792), and `*WithClientOrderId → cancel_order/edit_order/fetch_order`.
- Every sync slot uses the same override-slot shape
  (`{ let __v = self.derived().X(..); if !Null { return __v } }`) and every
  async slot the analogous `if let Some(__v) = self.dispatch_to_derived("X",..)`
  — base method name == derived target name in all 96 cases, so the codegen
  rewrite is a uniform mechanical substitution.

## Deeper findings (second pass — before committing to the rewrite)

Two things surfaced when I probed the actual REST-staging boundary:

### A. Name collisions (solved, but adds codegen)
33 of the `DerivedExchange` override names (`parse_ticker`, `parse_order`,
`sign`, `handle_errors`, …) also exist as base "trampoline" methods in
`exchange_generated.rs`. If both `ExchangeBase` and `DerivedExchange` carry
`parse_ticker`, then every `self.parse_ticker()` in generic base code is
**ambiguous**. Proven fix (`scratchpad/collision_poc.rs`, compiles): keep the
trampoline as an `ExchangeBase` method whose body calls the override via
fully-qualified `<Self as DerivedExchange>::parse_ticker(self, …)`, and rewrite
every base-internal call to the 33 names to `<Self as ExchangeBase>::X(self, …)`.
Mechanical, but ~17+ extra rewrite sites and careful scoping (must NOT touch
Core code, where inherent-method priority already selects the override).

### B. The shared base is NOT cleanly separable by tier (the real blocker)
`exchange_generated.rs` is ONE base used by all three tiers. Converting it to
`trait ExchangeBase: DerefMut<Target = Exchange>` immediately requires **every**
compiled Core to `impl ExchangeBase` — including WS and prediction. But:
- WS Cores `Deref` to their REST parent, prediction Cores through
  `PredictionExchange`; a type gets one `Deref` impl, so
  `DerefMut<Target = Exchange>` is unsatisfiable for them.
- The uniform escape (`fn base(&mut self) -> &mut Exchange` accessor instead of
  the `DerefMut` bound) forces rewriting **every `self.<field>` access** in the
  520 base methods to `self.base().<field>` — thousands of sites — because a
  generic default can't rely on transitive auto-deref to typecheck.

So "REST first, leave WS on the pointer design" is **not** cleanly achievable:
the shared base can't be half-trait/half-pointer without duplicating it. The
realistic options collapse to (1) a **big-bang** all-tier conversion
(accessor-based field access), red build across the whole crate until it
converges — multi-session; or (2) keep the base dual-mode — extra complexity.

## Verdict

- **Mechanism: GO.** The isolated PoC proves the trait-based static dispatch
  compiles and behaves correctly (sync, async, fallback) in this codebase's
  type shape, with no pointers/`unsafe`/manual `Send`+`Sync`. This directly
  resolves review P0 #1 and the hand-written `coerce_to_mut_unsafe` sites.
- **Scope: revised after finding B.** Clean REST-first staging is not available
  (shared base isn't tier-separable). The trait redesign is therefore a
  **big-bang, accessor-based, all-tier** change: red build across the whole
  crate until it converges, realistically multi-session, ~3–5 focused days
  (accessor field-access codegen is the bulk + risk). The mechanism is proven
  sound; the cost is breadth, not feasibility.

- **Lower-risk alternative (review option 3).** If the appetite is to close the
  *soundness* hole without the full rewrite: make the existing pointer design
  sound and encapsulated — hold each Core in a private `Pin<Box<Core>>`, make it
  `!Unpin`, hide the core + `bind*` methods behind an audited constructor so a
  safe caller can't move/invalidate it, and drop the blanket manual `Send`/`Sync`
  in favor of the real bounds. This directly answers the review's "compiler can't
  enforce the invariant" objection, is ~1 day, low-risk, and leaves the door open
  to the full trait migration later. It does NOT remove the raw pointers, only
  makes their one unsafe boundary sound and unforgeable.

**Recommendation:** given the big-bang breadth the redesign now requires, do the
lower-risk soundness/encapsulation pass first (lands this cycle, real safety
win), and schedule the full trait migration as a dedicated multi-session effort.
