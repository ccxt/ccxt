import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripInfo, project, ok, toContent, estimateTokens, MAX_RESULT_CHARS, MAX_RESULT_TOKENS, HOST_RESULT_TOKEN_LIMIT } from '../../ts/format.js';

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
    assert.ok (result.content[0].text.length <= MAX_RESULT_CHARS);
    const parsed = JSON.parse (result.content[0].text);
    assert.equal (parsed.meta.truncated, true);
    assert.equal (parsed.meta.available, 5000);
    assert.ok (parsed.meta.returned < 5000);
    assert.ok (parsed.meta.notice.includes ('limit'));
});

// a stripInfo'd ccxt FundingRate structure, as returned by okx fetchFundingRates on swaps
function fundingRate (i: number): Record<string, any> {
    const base = 'COIN' + i;
    const timestamp = 1731052800000 + i * 1000;
    const nextTimestamp = timestamp + 28800000;
    return {
        'symbol': base + '/USDT:USDT',
        'markPrice': 1234.5678 + i * 0.0137,
        'indexPrice': 1234.4321 + i * 0.0129,
        'interestRate': 0,
        'estimatedSettlePrice': null,
        'timestamp': timestamp,
        'datetime': new Date (timestamp).toISOString (),
        'fundingRate': 0.000123456789 + i * 1e-9,
        'fundingTimestamp': timestamp,
        'fundingDatetime': new Date (timestamp).toISOString (),
        'nextFundingRate': -0.000098765432 + i * 1e-9,
        'nextFundingTimestamp': nextTimestamp,
        'nextFundingDatetime': new Date (nextTimestamp).toISOString (),
        'previousFundingRate': 0.000045678912,
        'previousFundingTimestamp': timestamp - 28800000,
        'previousFundingDatetime': new Date (timestamp - 28800000).toISOString (),
        'interval': '8h',
    };
}

test ('the result budget stays below the host token limit for number-heavy JSON', () => {
    // MAX_MCP_OUTPUT_TOKENS defaults to 25k; number-dense JSON runs ~3 chars/token, so the
    // character-equivalent budget must be well below 25k * 3 = 75k chars
    assert.ok (MAX_RESULT_TOKENS < HOST_RESULT_TOKEN_LIMIT);
    assert.ok (MAX_RESULT_CHARS / 3 < HOST_RESULT_TOKEN_LIMIT);
});

test ('toContent truncates a large funding-rate scan to a token-safe size', () => {
    // e.g. okx fetchFundingRates over every swap market — the observed failure case
    const rates = Array.from ({ 'length': 700 }, (_, i) => fundingRate (i));
    const result = toContent (ok (rates, { 'exchange': 'okx', 'method': 'fetchFundingRates' }));
    const text = result.content[0].text;
    assert.ok (estimateTokens (text) <= MAX_RESULT_TOKENS);
    // even at a pessimistic 3 chars/token the result fits the host limit
    assert.ok (text.length / 3 < HOST_RESULT_TOKEN_LIMIT);
    const parsed = JSON.parse (text);
    assert.equal (parsed.ok, true);
    assert.equal (parsed.meta.truncated, true);
    assert.equal (parsed.meta.available, 700);
    assert.equal (parsed.meta.returned, parsed.data.length);
    assert.ok (parsed.data.length > 0 && parsed.data.length < 700);
    assert.equal (parsed.meta.exchange, 'okx');
    assert.ok (parsed.meta.notice.includes ('limit'));
    // the kept rows are the leading ones, intact
    assert.deepEqual (parsed.data[0], JSON.parse (JSON.stringify (rates[0])));
});

test ('toContent truncates payloads in the old 60k-80k char blind spot', () => {
    // under the previous 80k-char cap these passed through untouched, yet at ~3 chars/token
    // they exceed 20k+ tokens — they must now be truncated
    const rates: Record<string, any>[] = [];
    while (JSON.stringify (rates).length < 75000) {
        rates.push (fundingRate (rates.length));
    }
    assert.ok (JSON.stringify (ok (rates)).length < 80000);
    const parsed = JSON.parse (toContent (ok (rates)).content[0].text);
    assert.equal (parsed.meta.truncated, true);
    assert.ok (parsed.data.length < rates.length);
});

test ('toContent keeps as many rows as fit the budget', () => {
    const rates = Array.from ({ 'length': 700 }, (_, i) => fundingRate (i));
    const parsed = JSON.parse (toContent (ok (rates)).content[0].text);
    // one more row would overflow the budget
    const next = ok (rates.slice (0, parsed.data.length + 1), parsed.meta);
    assert.ok (estimateTokens (JSON.stringify (next)) > MAX_RESULT_TOKENS);
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
