# Pre-PR Submission Checklist

Based on CCXT CONTRIBUTING.md requirements.

## Before Submitting

### Git Configuration
- [ ] Run: `git config core.hooksPath .git-templates/hooks`

### Code Quality
- [ ] Run `npm run build` - ensure no syntax errors
- [ ] Run `npm run lint` on modified files
- [ ] All tests pass: `npm test` in edl/compiler directory

### File Exclusions (DO NOT COMMIT)
Per CONTRIBUTING.md, these auto-generated files must NOT be committed:

- [ ] Verify NO `/dist/*` files are staged
- [ ] Verify NO `/js/*` files are staged (compiled from TS)
- [ ] Verify NO `/php/*` files are staged (except base classes)
- [ ] Verify NO `/python/*` files are staged (except base classes)
- [ ] Verify NO `/cs/*` files are staged (except base classes)
- [ ] Verify NO `/ccxt.js` is staged
- [ ] Verify NO `/README.md` is staged (unless real edit)
- [ ] Verify NO `/package.json` is staged
- [ ] Verify NO `/package.lock` is staged
- [ ] Verify NO `/wiki/*` is staged (unless real edit)
- [ ] Verify NO `/dist/ccxt.browser.js` is staged

### Files TO Commit (EDL Compiler Changes)

Source files:
- [ ] `edl/compiler/src/generator/index.ts` - array path generation
- [ ] `edl/compiler/src/types/edl.ts` - type definition update
- [ ] `edl/compiler/src/linting/engine.ts` - array path handling

Exchange definitions:
- [ ] `edl/exchanges/binance.edl.yaml` - updated parsers

Test fixtures:
- [ ] `edl/compiler/test-fixtures/binance/markets-input.json`
- [ ] `edl/compiler/test-fixtures/wallet/binance/deposits-expected.json`
- [ ] `edl/compiler/test-fixtures/wallet/binance/withdrawals-expected.json`

Schema:
- [ ] `edl/schemas/edl.schema.json` (if updated)

### PR Best Practices
- [ ] Atomic edit - one feature per PR
- [ ] Clear, descriptive PR title
- [ ] Summary of changes in description
- [ ] Test plan included
- [ ] No mixed exchange changes (this PR is EDL-only)

---

## Commands to Run

```bash
# 1. Configure git hooks
git config core.hooksPath .git-templates/hooks

# 2. Build and verify
npm run build

# 3. Run EDL compiler tests
cd edl/compiler && npm test

# 4. Check what would be committed
git status

# 5. Stage only EDL files
git add edl/compiler/src/generator/index.ts
git add edl/compiler/src/types/edl.ts
git add edl/compiler/src/linting/engine.ts
git add edl/exchanges/binance.edl.yaml
git add edl/compiler/test-fixtures/binance/markets-input.json
git add edl/compiler/test-fixtures/wallet/binance/deposits-expected.json
git add edl/compiler/test-fixtures/wallet/binance/withdrawals-expected.json
git add edl/schemas/edl.schema.json

# 6. Verify staged files (should only show edl/ files)
git diff --cached --name-only

# 7. Commit with descriptive message
git commit -m "feat(edl): add array path support for fallback field mappings

- Add support for path: [primary, fallback] syntax in field mappings
- Generator produces safeValue2 calls for 2-element arrays
- Update type definitions to allow string | string[] for path
- Fix linting engine to handle array paths
- Update Binance deposit/withdrawal parsers to use array paths
- Fix txid compute to return null instead of undefined
- Add ETH/BTC market to test fixtures
- Regenerate expected fixtures from CCXT output

All 1863 EDL compiler tests pass."

# 8. Push to feature branch
git push origin feature/edl-compiler
```

---

## Post-PR Submission

- [ ] Verify CI builds pass
- [ ] Respond to reviewer feedback
- [ ] Do not force-push after review starts
