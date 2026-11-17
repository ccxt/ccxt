---
paths:
  - "llms.txt"
  - "llms-full.txt"
  - ".claude/skills/ccxt-*/**"
  - "build/check-ai-docs.ts"
---

# Maintaining the AI-facing docs

Scope: `llms.txt`, `llms-full.txt` and `.claude/skills/ccxt-{typescript,python,php,csharp,go,java,rust,cli,mcp}/SKILL.md`. The vendored third-party skills in `.claude/skills/` (`binance-*`, `p2p`, `square-post`, ...) are pinned in `skills-lock.json` by hash. Don't edit them here; they are updated from their upstream repository.

## Gate

```bash
npm run check-ai-docs      # offline; must print "AI-facing docs OK"
```

The checker covers method names (any casing), argument names and order against the base signature, deprecations (throwing stubs and JSDoc `@deprecated`) and version pins. Exchange-only methods are checked for existence only. It runs locally; it is not wired into CI yet. It does **not** check code blocks, so compile the blocks you touch with the recipes below. Each one wraps every fenced block of a file in its own function and builds it. Ignore "declared and not used" and "redeclared" errors (those come from intentional "wrong vs right" pairs and from continuation snippets); every other error is real.

## Shared method reference

The `## Complete Method Reference` block is the same text in the TS, Python, PHP, C# and Go skills and in `llms-full.txt`. Edit it once and copy it to all six. Rules:

- Arguments are written positionally, in base-class order, with `params` omitted. Copy them from `ts/src/base/Exchange.ts`, not from memory: several helpers take `(symbol, type, side, amount, price, <extra>)`.
- Only list methods that exist in the base class or in at least one exchange. Exchange-specific methods go in the "Exchange-specific" note, gated on `has`.
- Base stubs that `throw new NotSupported (... is deprecated ...)` belong only on the "Deprecated" line.

## Per-language gotchas (verified against the bindings)

- **Go**
  - One package, `ccxt "github.com/ccxt/ccxt/go/v4"` (WS: `ccxtpro ".../go/v4/pro"`), with constructors `ccxt.NewBinance(cfg)`. There are no per-exchange import paths.
  - Required args are positional; optional args are `ccxt.With<Method><Arg>(...)` options. Never pass `nil` placeholders.
  - Results are structs with pointer fields (`*ticker.Last`).
  - Errors are `*ccxt.Error{Type, Message}`. Match them with `ccxt.IsInstance(err, ccxt.InsufficientFunds)`, never with a type switch on per-error types.
  - Use `exchange.GetMarket(symbol)` for a typed market; `Market()` returns a map.
- **C#**
  - Async unified methods are PascalCase (`FetchTicker`), but these stay camelCase: `unWatch*`, sync helpers (`amountToPrecision`, `setSandboxMode`) and properties (`apiKey`, `secret`, `has`, `features`, `markets`, `verbose`).
  - Result structs use lowercase fields (`ticker.last`, `order.id`, `market.limits.amount.min`).
  - `Tickers` is iterated through `.tickers`. A WS `IOrderBook` row is `IList<object>` (`[price, amount]`).
  - Configure through the constructor dictionary or by assigning properties; object initializers like `new Binance { ApiKey = ... }` don't compile.
- **Python / PHP**: methods are snake_case, but `has` / `features` / `params` keys stay camelCase. `Ticker` has `baseVolume` / `quoteVolume`; there is no `volume`.
- **Java**: typed sync overloads stop *before* `params` (`fetchOrderBook(symbol, limit)`, `createOrder(symbol, type, side, amount, price)`); pass `null` only to skip an optional positional arg. Any call that passes `params`, even `null`, picks the full-arity overload, which returns a `CompletableFuture`. Use `<method>Async(..., params).join()`. `Exchange.dynamicallyCreateInstance` returns `BaseExchange`, so cast it to `Exchange`. Typed fields are public (`ticker.last`, not `last()`), and `loadMarkets` takes a `boolean`.
- **Rust**: `Params::new().with_bool(...)`; `Value::Str` holds a `Cow<'static, str>`, so build it with `"x".into()` (not `.to_string()`); WS methods live on `ccxt_pro::<Venue>`. Copy from the existing skill or the generated code, not from the TS signature.
- **Withdraw** everywhere is `(code, amount, address, params)`, with `tag` / `network` in params.

## Compile recipes

Do these in a scratch directory, never inside the repo.

**Go**: a module with `replace github.com/ccxt/ccxt/go/v4 => <repo>/go/v4`, then build every snippet as a function. `go/v4/go.mod` requires Go 1.25, so with an older toolchain set `GOTOOLCHAIN=go1.25.0` (or newer):

```bash
GOFLAGS=-mod=mod go build -gcflags=-e -o /dev/null .
```

**C#**: generate the C# core, then build a console project that references it:

```bash
npx tsx build/csharpTranspiler.ts --baseClass --force
npx tsx build/csharpTranspiler.ts binance
npx tsx build/csharpTranspiler.ts --ws binance
```

The console project needs `<ProjectReference Include="<repo>/cs/ccxt/ccxt.csproj" />`; put each snippet in its own file with its own `using` lines and run `dotnet build`. Check `git status` afterwards: the transpile should leave no tracked changes.

**TypeScript**: snippets in their own folder, each importing `ccxt from '../ts/ccxt.js'`, with the exchange typed as `new ccxt.pro.binance ()`. Typing it as `any` hides every error. Then run `npx tsc -p <tsconfig>` with `"module": "esnext", "moduleResolution": "bundler", "noEmit": true, "skipLibCheck": true`. Errors reported in `ts/src/*` are pre-existing, so ignore those.

**Java**: `cd java && ./gradlew :lib:jar -x test` builds `java/lib/build/libs/lib-<version>.jar` (print the runtime classpath with a small Gradle init script). Then put each snippet in its own class, with `import io.github.ccxt.*; import io.github.ccxt.types.*; import io.github.ccxt.errors.*;` plus `exchanges.Binance` or `exchanges.pro.Binance` (pick one per snippet, because the names clash), and run `javac -cp "<jar>:<classpath>" Snip*.java`.

**Rust**: a scratch crate with path dependencies on `rust/ccxt`, `rust/ccxt-pro` and `rust/ccxt-prediction` (`default-features = false`, plus only the venues the snippets use, e.g. `features = ["binance", "kraken"]`), `rust/ccxt-base` (`features = ["engine"]`) and tokio. Put each snippet in its own `mod` and run `cargo build`. Root-level `use ccxt::{Binance, Config, TypedExchange, ...}` saves continuation snippets from failing on name resolution, which hides real type errors.

**Python / PHP**: `ast.parse` each block (wrap it in `async def` if it uses top-level `await`) and run `php -l` on each block. For names, grep `def <name>` / `function <name>` in `python/ccxt/base/exchange.py` and `php/Exchange.php`.

## Version pins

Pins must equal the `package.json` version. The checker flags `io.github.ccxt:ccxt:x.y.z`, `ccxt = "x.y.z"` and `ccxt@x.y.z`. After `npm run vss`, update them, or write the snippet so it doesn't pin.
