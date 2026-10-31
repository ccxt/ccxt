// Run: npx tsx --test build/tests/test.hx11w9-cs-pro-geturlbymarkettype-string-local.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { CSHARP_LOCAL_THIS_RETURN_TYPES } from './../csharp-local-types.js';

test('getUrlByMarketType (gate/htx, both print string?) is a typed this-call', () => {
    assert.equal (CSHARP_LOCAL_THIS_RETURN_TYPES['getUrlByMarketType'], 'string?');
});
