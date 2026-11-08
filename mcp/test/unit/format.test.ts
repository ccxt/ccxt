import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripInfo, project, ok, toContent, nextPage, estimateTokens, MAX_RESULT_CHARS, MAX_RESULT_TOKENS, HOST_RESULT_TOKEN_LIMIT } from '../../ts/format.js';
import { clearSnapshots, MAX_SNAPSHOTS } from '../../ts/pager.js';
import type { Envelope } from '../../ts/format.js';

test ('stripInfo removes info recursively', () => {
    const value = { 'a': 1, 'info': { 'x': 1 }, 'nested': [ { 'b': 2, 'info': 'raw' } ] };
    assert.deepEqual (stripInfo (value), { 'a': 1, 'nested': [ { 'b': 2 } ] });
});

test ('project keeps only requested non-null fields', () => {
    const value = { 'a': 1, 'b': null, 'c': 'x', 'd': 'dropped' };
    assert.deepEqual (project (value, [ 'a', 'b', 'c' ]), { 'a': 1, 'c': 'x' });
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

// fetchFundingRates returns a map keyed by symbol, not an array
function fundingRatesMap (count: number): Record<string, any> {
    const result: Record<string, any> = {};
    for (let i = 0; i < count; i++) {
        const rate = fundingRate (i);
        result[rate.symbol] = rate;
    }
    return result;
}

function parse (result: { content: { text: string }[] }): any {
    return JSON.parse (result.content[0].text);
}

// follow nextCursor to the end, asserting every page fits the token budget
function readAllPages (first: any): any[] {
    const pages = [ first ];
    let page = first;
    while (page.meta.hasMore) {
        const text = toContent (nextPage (page.meta.nextCursor)).content[0].text;
        assert.ok (estimateTokens (text) <= MAX_RESULT_TOKENS, 'every page fits the budget');
        page = JSON.parse (text);
        assert.equal (page.ok, true);
        pages.push (page);
    }
    return pages;
}

test ('the result budget stays below the host token limit for number-heavy JSON', () => {
    // MAX_MCP_OUTPUT_TOKENS defaults to 25k; number-dense JSON runs ~3 chars/token, so the
    // character-equivalent budget must be well below 25k * 3 = 75k chars
    assert.ok (MAX_RESULT_TOKENS < HOST_RESULT_TOKEN_LIMIT);
    assert.ok (MAX_RESULT_CHARS / 3 < HOST_RESULT_TOKEN_LIMIT);
});

test ('a large funding-rate scan (symbol-keyed map) is paginated, not dropped', () => {
    // okx fetchFundingRates over every swap market — the observed failure case
    const rates = fundingRatesMap (700);
    const text = toContent (ok (rates, { 'exchange': 'okx', 'method': 'fetchFundingRates' })).content[0].text;
    assert.ok (estimateTokens (text) <= MAX_RESULT_TOKENS);
    assert.ok (text.length / 3 < HOST_RESULT_TOKEN_LIMIT, 'fits the host limit even at a pessimistic 3 chars/token');
    const first = JSON.parse (text);
    assert.equal (first.ok, true);
    assert.equal (first.meta.paginated, true);
    assert.equal (first.meta.truncated, undefined, 'paging is not truncation');
    assert.equal (first.meta.total, 700);
    assert.equal (first.meta.offset, 0);
    assert.equal (first.meta.hasMore, true);
    assert.equal (first.meta.exchange, 'okx', 'the original meta is kept');
    assert.ok (first.meta.notice.includes ('next_page'));
    assert.equal (Object.keys (first.data).length, first.meta.returned);
    assert.ok (first.meta.returned > 0 && first.meta.returned < 700);
    // walking the cursors returns every entry exactly once, in order, unchanged
    const pages = readAllPages (first);
    assert.ok (pages.length > 1);
    assert.equal (pages[pages.length - 1].meta.hasMore, false);
    assert.equal (pages[pages.length - 1].meta.nextCursor, undefined);
    const merged: Record<string, any> = {};
    for (const page of pages) {
        assert.equal (page.meta.method, 'fetchFundingRates');
        Object.assign (merged, page.data);
    }
    assert.deepEqual (Object.keys (merged), Object.keys (rates));
    assert.deepEqual (merged, JSON.parse (JSON.stringify (rates)));
});

test ('oversized array data is paginated across every row', () => {
    const rows = Array.from ({ 'length': 5000 }, (_, i) => ({ 'index': i, 'padding': 'x'.repeat (50) }));
    const first = parse (toContent (ok (rows)));
    assert.ok (JSON.stringify (first).length <= MAX_RESULT_CHARS);
    assert.equal (first.meta.paginated, true);
    assert.equal (first.meta.total, 5000);
    const indexes = readAllPages (first).flatMap ((page) => page.data.map ((row: any) => row.index));
    assert.deepEqual (indexes, rows.map ((row) => row.index));
});

test ('payloads in the old 60k-80k char blind spot are now paginated', () => {
    // under the previous 80k-char cap these passed through untouched, yet at ~3 chars/token
    // they exceed 20k+ tokens
    const rates: Record<string, any>[] = [];
    while (JSON.stringify (rates).length < 75000) {
        rates.push (fundingRate (rates.length));
    }
    assert.ok (JSON.stringify (ok (rates)).length < 80000);
    const first = parse (toContent (ok (rates)));
    assert.equal (first.meta.paginated, true);
    assert.equal (readAllPages (first).reduce ((sum, page) => sum + page.data.length, 0), rates.length);
});

test ('each page is as large as the budget allows', () => {
    const rates = Array.from ({ 'length': 700 }, (_, i) => fundingRate (i));
    const first = parse (toContent (ok (rates)));
    // one more row would overflow the budget
    const bigger = { ...first, 'data': rates.slice (0, first.data.length + 1) };
    assert.ok (estimateTokens (JSON.stringify (bigger)) > MAX_RESULT_TOKENS);
});

test ('a raw payload pages its nested collection and keeps the surrounding fields', () => {
    // e.g. call_implicit_get returning {"code": "0", "msg": "", "data": [...]}
    const raw = { 'code': '0', 'msg': '', 'data': Array.from ({ 'length': 700 }, (_, i) => fundingRate (i)) };
    const first = parse (toContent (ok (raw, { 'method': 'publicGetPublicFundingRate' })));
    assert.equal (first.meta.paginated, true);
    assert.equal (first.meta.pagedField, 'data.data');
    assert.equal (first.meta.total, 700);
    const pages = readAllPages (first);
    for (const page of pages) {
        assert.equal (page.data.code, '0');
        assert.equal (page.data.msg, '');
    }
    assert.equal (pages.reduce ((sum, page) => sum + page.data.data.length, 0), 700);
});

test ('an entry too large on its own is flagged and skipped, and paging continues', () => {
    const rows: any[] = [ { 'i': 0 }, { 'i': 1, 'blob': 'x'.repeat (MAX_RESULT_CHARS * 2) }, { 'i': 2 } ];
    const first = parse (toContent (ok (rows)));
    assert.equal (first.meta.paginated, true);
    assert.deepEqual (first.data, [ { 'i': 0 } ]);
    const second = parse (toContent (nextPage (first.meta.nextCursor)));
    assert.equal (second.data.truncated, true);
    assert.equal (second.meta.skipped, 1);
    assert.ok (second.data.reason.includes ('offset 1'));
    const third = parse (toContent (nextPage (second.meta.nextCursor)));
    assert.deepEqual (third.data, [ { 'i': 2 } ]);
    assert.equal (third.meta.hasMore, false);
});

test ('next_page rejects malformed, exhausted and expired cursors', () => {
    assert.equal (nextPage ('nope').error.code, 'BAD_CURSOR');
    const first = parse (toContent (ok (Array.from ({ 'length': 700 }, (_, i) => fundingRate (i)))));
    const [ id ] = first.meta.nextCursor.split ('.');
    assert.equal (nextPage (id + '.700').error.code, 'BAD_CURSOR');
    clearSnapshots ();
    const expired: Envelope = nextPage (first.meta.nextCursor);
    assert.equal (expired.ok, false);
    assert.equal (expired.error?.code, 'CURSOR_EXPIRED');
    assert.equal (toContent (expired).isError, true);
});

test ('the snapshot store is bounded', () => {
    clearSnapshots ();
    const cursors: string[] = [];
    for (let i = 0; i < MAX_SNAPSHOTS + 1; i++) {
        cursors.push (parse (toContent (ok (Array.from ({ 'length': 700 }, (_, j) => fundingRate (j))))).meta.nextCursor);
    }
    assert.equal (nextPage (cursors[0]).error?.code, 'CURSOR_EXPIRED', 'the least recently used snapshot is evicted');
    assert.equal (nextPage (cursors[MAX_SNAPSHOTS]).ok, true);
});

test ('toContent never emits invalid JSON for an oversized payload with nothing to page', () => {
    // one huge value — no collection to split
    const result = toContent (ok ({ 'blob': 'x'.repeat (MAX_RESULT_CHARS * 2) }));
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
