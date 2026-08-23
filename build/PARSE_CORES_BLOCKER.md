# Typing the generated C# `parse*` cores — blocked, with evidence

TypeScript declares `parseOrder (order: Dict, market: Market): Order`,
`parseOHLCV (...): OHLCV`, and so on. Mirroring those returns onto the generated
C# cores is **not viable today**, and this file records why so the next attempt
does not re-derive it.

## The mechanical difference from `fetch*`

A typed `fetch*` core is safe because its result is TERMINAL: the value flows
straight into the PascalCase wrapper, which returns it to the user. Nothing
transpiled ever reads it again.

A `parse*` result is an INPUT to more transpiled logic. The generated bodies do:

```csharp
object parsed = this.parseTicker (getValue (tickers, i));
object ticker = this.extend (parsed, parameters);
object symbol = getValue (parsed, "symbol");
```

`getValue` / `extend` / `setValue` are `object`-typed helpers that perform
dictionary access. A boxed struct **compiles** against all of them, so a green
`dotnet build` proves nothing here.

## Measured behaviour (not assumed)

A console harness referencing `cs/ccxt/ccxt.csproj` passed a boxed
`ccxt.Order` / `ccxt.OHLCV` into the exact helpers the generated code uses:

| consumer pattern | result on a boxed struct |
|---|---|
| `getValue(order, "symbol")` | returns **null**, silently — no exception |
| `extend(order, params)` | throws `InvalidCastException: cannot cast ccxt.Order to IDictionary<string, object>` |
| `getValue(ohlcv, 0)` | returns **null**, silently |
| `sortBy(List<OHLCV>, 0)` | happens to survive |

The silent-null cases are the dangerous ones: they would ship a build that is
green, and tests that pass vacuously, while unified fields quietly become null.

## Exposure

Across `cs/ccxt/base` + `cs/ccxt/exchanges` (wrappers excluded), counting only
call sites that are NOT a direct `return` / `return ccxt.BaseExchange.ToX(...)`
and NOT a local that is only ever returned:

| name | call sites | consuming (unsafe) sites |
|---|---|---|
| parseOrder | 370 | 72 |
| parseTicker | 165 | 72 |
| parseTrade | 41 | 36 |
| parsePosition | 56 | 33 |
| parseOHLCV | 26 | 23 |
| parseOrders | 276 | 23 |
| parseTrades | 221 | 23 |
| parsePositions | 57 | 20 |
| parseMarket | 16 | 16 |
| parseBalance | 87 | 8 |
| parseTransaction | 79 | 8 |
| parseTickers | 65 | 6 |
| parseTransactions | 126 | 6 |
| parseOHLCVs | 89 | 5 |
| parseMarkets | 53 | 2 |
| parseLedger | 42 | 1 |
| parseLedgerEntry | 2 | 1 |
| **total** | **1771** | **355** |

**No `parse*` name has zero consuming sites** — including the "easy" ones. The
easy-majority split that works for `fetch*` does not exist here.

Reproduce with `python3 build/analyzeParseCores.py`.

## What would actually unblock it

The obvious idea — teach `getValue` / `extend` / `setValue` to understand the
generated structs — **does not work**, and that was also measured rather than
assumed. The generated types are C# `struct`s (value types), and the generated
code mutates `parse*` results in place at **41 sites**:

```csharp
object order = this.parseOrder (response, market);
((IDictionary<string, object>) order)["type"] = type;   // okx, woofipro, blofin, ...
```

A struct read out of an `object` local or a `List<object>` element is a **copy**.
A harness confirmed all three cases lose the write:

```
original box after mutating the unboxed copy: BTC/USDT   (expected ETH/USDT)
second local:                                 BTC/USDT
element after mutating a value pulled out:    BTC/USDT   (expected SOL/USDT)
```

So no helper-level fix can rescue this: even a perfect `IDictionary` facade over
the struct would write into a temporary that is immediately discarded. The
blocker is structural, in the value-type semantics, not in the helpers.

Real options, each far larger than this PR:

1. Make the generated unified types `class` instead of `struct`, so boxing stops
   copying and in-place mutation works. This is a public API break for every
   existing C# consumer that relies on value semantics.
2. Rewrite the 355 consuming sites in `ts/src` so every `parse*` result is
   terminal and never mutated after parsing. A large upstream TypeScript change,
   not a C# emit change.

Until one of those lands, `parse*` stays `object` on purpose. Typing it now would
trade a compile-time nicety for silent null-valued unified fields and silently
dropped writes.

## Related

`build/analyzeCoreArgs.py` (the parameter-narrowing table this PR does ship),
`TYPED_CORES` in `build/csharpTranspiler.ts`.
