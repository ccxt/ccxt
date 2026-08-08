# Draft PR: EDL Compiler - Array Path Support and Fixture Regression Fixes

## PR Title
`feat(edl): add array path support for fallback field mappings`

---

## PR Description

### Summary
- Added support for array paths in field mappings (e.g., `path: [id, orderNo]`) to implement fallback behavior in the EDL compiler
- Fixed fixture regression tests for Binance deposits and withdrawals
- Updated type definitions and linting engine to handle array paths

### Changes

#### EDL Compiler Changes (`edl/compiler/src/`)

1. **Generator (generator/index.ts)**
   - Added array path detection using `Array.isArray(mapping.path)`
   - Generates `safeValue2` for 2-element arrays
   - Chains `??` operators for longer arrays

2. **Type Definitions (types/edl.ts)**
   - Updated `FieldMapping` type to allow `path` to be `string | string[]`

3. **Linting Engine (linting/engine.ts)**
   - Updated to iterate over array paths when extracting DSL elements for linting

#### Binance EDL Updates (`edl/exchanges/binance.edl.yaml`)

1. **Withdrawal Parser**
   - `id` path: `path: [id, orderNo]` (was `path: id` with `fallback: [orderNo]`)
   - `currency` path: `path: [coin, fiatCurrency]`
   - Fixed `txid` compute to return `null` instead of `undefined` for empty strings

2. **Deposit Parser**
   - `currency` path: `path: [coin, fiatCurrency]`
   - Fixed `txid` compute similarly

#### Test Fixture Updates (`edl/compiler/test-fixtures/`)

- Added ETH/BTC market to `binance/markets-input.json` to match trade fixture
- Regenerated expected fixtures for deposits and withdrawals from actual CCXT output

### Test Plan
- [x] All 1863 EDL compiler tests pass
- [x] Binance deposit/withdrawal parsing produces correct output
- [x] Array path fallback behavior works correctly (e.g., `id` falls back to `orderNo` for fiat deposits)
- [ ] Manual verification of generated TypeScript code

### Breaking Changes
None - this is a backward-compatible addition to the EDL schema.

---

## Files to Commit (EDL-specific only)

```
edl/compiler/src/generator/index.ts
edl/compiler/src/types/edl.ts
edl/compiler/src/linting/engine.ts
edl/exchanges/binance.edl.yaml
edl/compiler/test-fixtures/binance/markets-input.json
edl/compiler/test-fixtures/wallet/binance/deposits-expected.json
edl/compiler/test-fixtures/wallet/binance/withdrawals-expected.json
edl/schemas/edl.schema.json
```

## Files to EXCLUDE from commit (per CONTRIBUTING.md)

The following files are auto-generated and should NOT be committed:
- `/dist/*` (browser bundles, CJS builds)
- `/js/*` (compiled from TypeScript)
- `/php/*` (transpiled)
- `/python/*` (transpiled)
- `/cs/*` (transpiled)
- `/ccxt.js`
- `/dist/ccxt.browser.js`
- `/package.json`
- `/package.lock`

---

## Notes

This PR focuses solely on the EDL compiler changes. The EDL compiler is a separate tooling system within the CCXT repository that:
1. Defines exchange APIs using YAML-based EDL files
2. Generates TypeScript exchange implementations
3. Validates and lints EDL definitions

The array path feature enables cleaner fallback handling in field mappings, replacing the previous `fallback: [...]` syntax with a more intuitive `path: [primary, fallback1, fallback2]` array syntax.
