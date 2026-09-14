import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripInfo, project, ok, toContent, MAX_RESULT_CHARS } from '../../ts/format.js';

test ('stripInfo removes info recursively', () => {
    const value = { 'a': 1, 'info': { 'x': 1 }, 'nested': [ { 'b': 2, 'info': 'raw' } ] };
    assert.deepEqual (stripInfo (value), { 'a': 1, 'nested': [ { 'b': 2 } ] });
});

test ('project keeps only requested non-null fields', () => {
    const value = { 'a': 1, 'b': null, 'c': 'x', 'd': 'dropped' };
    assert.deepEqual (project (value, [ 'a', 'b', 'c' ]), { 'a': 1, 'c': 'x' });
});

test ('toContent truncates oversized array data with an in-band notice', () => {
    const rows = Array.from ({ 'length': 5000 }, (_, i) => ({ 'index': i, 'padding': 'x'.repeat (50) }));
    const result = toContent (ok (rows));
    assert.ok (result.content[0].text.length <= MAX_RESULT_CHARS + 200);
    const parsed = JSON.parse (result.content[0].text);
    assert.equal (parsed.meta.truncated, true);
    assert.equal (parsed.meta.available, 5000);
    assert.ok (parsed.meta.returned < 5000);
    assert.ok (parsed.meta.notice.includes ('limit'));
});

test ('toContent never emits invalid JSON for an oversized non-array payload', () => {
    // a raw implicit-endpoint response: one huge object, not an array
    const huge: Record<string, string> = {};
    for (let i = 0; i < 5000; i++) {
        huge['field_' + i] = 'x'.repeat (40);
    }
    const result = toContent (ok (huge));
    // must parse cleanly (the old byte-cut produced mid-token invalid JSON)
    const parsed = JSON.parse (result.content[0].text);
    assert.equal (parsed.ok, true);
    assert.equal (parsed.data.truncated, true);
    assert.equal (parsed.meta.truncated, true);
    assert.ok (parsed.meta.notice.includes ('too large'));
});

test ('toContent marks error envelopes with isError', () => {
    const result = toContent ({ 'ok': false, 'error': { 'code': 'X', 'message': 'boom' } });
    assert.equal (result.isError, true);
});

test ('undefined serializes as null, never dropped silently', () => {
    const result = toContent (ok ({ 'a': undefined }));
    assert.equal (JSON.parse (result.content[0].text).data.a, null);
});
