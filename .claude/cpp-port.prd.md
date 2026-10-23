# PRD: C++ port of ccxt (vertical slice), same architecture as C#/Java

## Goal
Implement the C++ version of ccxt using the EXACT same approach as the C# (`cs/`) and Java (`java/`) ports:
- Most code is auto-generated from TypeScript via the `ast-transpiler` package (it now has a C++ backend).
- A new `build/cppTranspiler.ts` orchestrates transpilation, modeled closely on `build/csharpTranspiler.ts` and `build/javaTranspiler.ts`.
- A handwritten C++ runtime (`cpp/ccxt/base/`) provides the base `Exchange` class and transpiler helper functions, mirroring `cs/ccxt/base/`.
- Transpiled base tests are the correctness gate, mirroring `cs/tests/Generated/`.

## Scope for THIS iteration (vertical slice)
1. `build/cppTranspiler.ts` — transpiles: base methods (`ts/src/base/Exchange.ts` derived files as C# does), the `binance` exchange (REST only), plus the shared base tests (`--baseTests` mode).
2. `cpp/` tree:
   - `cpp/ccxt/base/` handwritten runtime: `Exchange` base class, transpile helpers (`add`, `subtract`, `multiply`, `divide`, `isTrue`, `isEqual`, `isGreaterThan`, `getValue`, `safeValue`, string/number/json helpers, `Precise`, crypto (hmac sha256/384/512, md5 via OpenSSL), url encoding, time helpers), `std::any`-centric dynamic value handling matching what the generated code calls.
   - `cpp/ccxt/exchanges/` generated exchange files (binance).
   - `cpp/tests/` handwritten test main + `cpp/tests/Generated/` transpiled base tests.
   - CMake build (`cpp/CMakeLists.txt`), C++17 or C++20, deps: nlohmann_json (system package installed), OpenSSL, libcurl. Build with cmake+ninja.
3. `package.json` scripts: `transpileCpp`, `transpileCppSingle`, `transpileCppBaseTests` (mirror the C# ones, lines ~38-47).
4. `run-tests.js`: add a `--cpp` language entry (exec: the compiled test binary) mirroring `--csharp`.

## Success criteria (in order)
1. `npm run transpileCppSingle -- binance` produces `cpp/ccxt/exchanges/binance.cpp` (+ header if the design uses one).
2. `cmake -S cpp -B cpp/build -G Ninja && ninja -C cpp/build` compiles runtime + binance + generated base tests with zero errors.
3. The base-test binary runs OFFLINE (language tests: number/precise/safe-methods/datetime/crypto etc — same set C# transpiles in `--baseTests`) and passes.
4. `binance` instantiation smoke test: construct exchange, `describe()` loads, `parseTicker`-level unit paths exercised by base tests pass.

## Key reference files (READ THESE FIRST)
- `build/csharpTranspiler.ts` — primary model: class structure, `createTranspiler`, per-exchange loop, `--baseTests` handling, worker pool via Piscina (`build/csharp-worker.js`, `setupCsharpPrinter`), dirty-file filtering imports from `build/transpile.ts`.
- `build/javaTranspiler.ts` — second reference; note differences.
- `build/goTranspiler.ts` — closest dynamic-helper model (Go also lowers ops to helper funcs).
- `node_modules/ast-transpiler/src/cppTranspiler.ts` — the new C++ backend source; study what C++ it emits (std::any values, helper-call lowering like `add(a, b)`).
- `.claude/reference-cppTranspiler.test.ts` — upstream unit tests for the C++ backend showing exact emitted syntax for literals, control flow, etc.
- `cs/ccxt/base/Exchange.TranspileHelpers.cs`, `Exchange.SafeMethods.cs`, `Exchange.Generic.cs`, `Exchange.Number.cs`, `Exchange.Precise.cs`, `Exchange.Crypto.cs` — the runtime surface C++ must mirror.
- `cs/tests/Generated/` — what transpiled base tests look like in C#.
- `run-tests.js` lines ~370-400 — language exec table.

## Hard constraints
- DO NOT run `npm ci` or `npm install` (the local `node_modules/ast-transpiler/dist` was rebuilt manually to include the cpp backend; a reinstall would revert it to a stale build).
- DO NOT commit or push anything. Leave all changes in the working tree.
- DO NOT modify other language outputs (`cs/`, `java/`, `go/`, `python/`, `php/`, `rust/`) or their transpilers, except the shared `package.json`/`run-tests.js` additions.
- DO NOT edit generated files by hand to make them compile — fix the transpiler (`build/cppTranspiler.ts` overrides) or the runtime instead. Generated output must be reproducible.
- Follow strict TDD (tdd-workflow skill): every slice starts with a failing test/gate, then minimal implementation, then re-run to green. Vertical slices, not horizontal.
- If the ast-transpiler cpp backend emits something broken/unsupported, prefer fixing via transpiler config/overrides in `build/cppTranspiler.ts` (like csharpTranspiler does with its own string replacements); as a last resort patch `node_modules/ast-transpiler/dist` and record the patch in `build/cppTranspiler.ts` comments + a `build/astTranspilerCpp.patch` file.

## Environment facts
- g++ 13.3, cmake 3.28.3, ninja 1.11.1 installed. nlohmann-json3-dev, libssl-dev, libcurl4-openssl-dev installed system-wide.
- Node v24, tsx available via repo devDeps. `tsx build/cppTranspiler.ts` is how scripts run.
- Verified working: `import('ast-transpiler')` → `new Transpiler(config).transpileCpp(content)` / `.transpileCppByPath(path)`.
- Repo branch: `cpp-lang`. `exchanges.json` lists all exchange ids; slice only needs `binance`.

## Non-goals (this iteration)
- WebSocket (`pro/`) support, wrappers layer (C#'s `Exchange.Wrappers.cs` typed-core system), examples, docs, CI, npm/package publishing, the other ~100 exchanges. Design must not preclude them.
