// Run: npx tsx --test build/tests/test.hx11w9-cs-htx-fetchaccountidbytype-string-awaited-local.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { CSHARP_LOCAL_AWAIT_RETURN_TYPES } from './../csharp-local-types.js';

test('htx fetchAccountIdByType (Task<string>) is a typed awaited this-call', () => {
    assert.equal (CSHARP_LOCAL_AWAIT_RETURN_TYPES['fetchAccountIdByType'], 'string?');
});
