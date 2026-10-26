# Native ArrayCache verification

`arrayCacheRust.rs` supplements the shared TypeScript cache tests with Rust-specific
registry, legacy-marker, hashmap write-through and malformed-state cases. The Rust
test generator includes it in `--baseTests --ws`; it is kept here because `rust/`
is generated. Regenerate with `npx tsx build/rustTranspiler.ts --tests`, then run
`npm run test-base-ws-rust`.

`arrayCacheShadow.py` is an opt-in public Kraken regression check:

```sh
python build/tests/arrayCacheShadow.py
python build/tests/arrayCacheShadow.py --live --seconds 180
```

The default command runs an offline replay and proves that deliberately corrupted
shadow state is detected. The live command also runs `watchOrderBook`, `watchTrades`
and `watchOHLCV`, once with each `newUpdates` setting. It requires the Python
dependencies and the pre-performance Git revision
`63951db9f44dcf425c81785d65867dbb1ac6abf1` to be available locally. Run without
Python's `-O` flag: checks deliberately use assertions.

One public connection supplies identical frames to the current and baseline
Kraken handlers. The baseline cache classes come from the pinned revision;
shared REST/base dependencies come from the current checkout. Every processed
frame compares cache rows, bookkeeping, slicing or complete order-book state.
Actual cache polling also compares update limits. The test validates the returned
structures and requires repeated results from all three methods and a cache
larger than 64 rows. A quiet feed or network timeout fails the run instead of
claiming that the optimized path was tested; allow a longer duration if necessary.
Neither credentials nor private endpoints are used, and connections close in
`finally`.

This is a same-input regression test, not a latency benchmark, independent
exchange-correctness oracle, or thread-safety certification. Python cache access
must remain serialized on its owning event loop. The Go locking fix is separate
from the performance change; shared mutable row objects remain a limitation.

## Coverage audit (2026-09-08)

The expanded shared and language-native suites measured the following cache-only
coverage, including subclasses, without production-code coverage exclusions:

| Language | Measured coverage |
| --- | --- |
| JS (TypeScript source) | 100% lines, branches and functions |
| Python | 243/243 statements; 68/68 branches |
| PHP | 195/195 executable lines; branch coverage not collected |
| C# | 100% lines, branches and methods |
| Go | 281/281 statements, including BaseCache and Set |
| Java | 189/189 lines; 94/94 branches; 32/32 methods |
| Rust factories | 35/35 lines; 6/6 functions |
| Rust cache helper ranges in `Value` | 400/412 executable lines (97.1%) |

Rust helper measurements cover `value.rs:859–1436` and `1592–1604` at the audited
revision, not all shared `Value` dispatch. The remaining ten defensive lines are
non-Dict fallbacks behind Dict-guarded callers, impossible variants immediately
after assigning a known variant, and `unreachable!()` guards. Two further lines
extract an OrderBook's cache, not an ArrayCache. These are reported rather than
excluded: this is **not** a claim of literal 100% Rust runtime coverage, PHP branch
coverage, or proof against every possible race or external state mutation.
