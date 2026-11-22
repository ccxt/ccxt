import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveMarketFields, searchMarketsMaxLimit, marketTypeCounts, zeroMatchNotice, SEARCH_MARKETS_MAX_FULL, SEARCH_MARKETS_MAX_COMPACT, SEARCH_MARKETS_BUDGET_CHARS } from '../../ts/market-search.js';
import { ArgError } from '../../ts/tools/common.js';

test ('resolveMarketFields: symbol first, deduped, unknown names rejected with the valid list', () => {
    assert.equal (resolveMarketFields (undefined), undefined);
    assert.deepEqual (resolveMarketFields ([ 'limits' ]), [ 'symbol', 'limits' ]);
    assert.deepEqual (resolveMarketFields ([ 'contractSize', 'symbol', 'contractSize' ]), [ 'symbol', 'contractSize' ]);
    assert.throws (() => resolveMarketFields ([ 'symbol', 'nope' ]), (error: any) => {
        assert.ok (error instanceof ArgError);
        assert.ok (error.message.includes ('"nope"'));
        assert.ok (error.hint.includes ('valid fields: symbol, id, type'));
        return true;
    });
});

test ('searchMarketsMaxLimit: fixed for full rows, budget-fit for compact rows', () => {
    const tiny = Array.from ({ 'length': 1500 }, (_, i) => ({ 'symbol': 'C' + i + '/USDT:USDT' }));
    assert.equal (searchMarketsMaxLimit (tiny, false), SEARCH_MARKETS_MAX_FULL);
    assert.equal (searchMarketsMaxLimit (tiny.slice (0, 1000), true), SEARCH_MARKETS_MAX_COMPACT);
    // every candidate fits -> the compact ceiling, not the candidate count
    assert.equal (searchMarketsMaxLimit (tiny.slice (0, 7), true), SEARCH_MARKETS_MAX_COMPACT);
    assert.equal (searchMarketsMaxLimit ([], true), SEARCH_MARKETS_MAX_COMPACT);
    // 500-char rows: only ~110 fit the budget
    const heavy = Array.from ({ 'length': 1000 }, () => ({ 'symbol': 'X/USDT', 'pad': 'x'.repeat (480) }));
    const max = searchMarketsMaxLimit (heavy, true);
    const rowChars = JSON.stringify (heavy[0]).length + 1;
    assert.equal (max, Math.floor ((SEARCH_MARKETS_BUDGET_CHARS - 2) / rowChars));
    // rows bigger than the budget allows still get the full-row floor
    const huge = Array.from ({ 'length': 1000 }, () => ({ 'symbol': 'X/USDT', 'pad': 'x'.repeat (5000) }));
    assert.equal (searchMarketsMaxLimit (huge, true), SEARCH_MARKETS_MAX_FULL);
});

test ('marketTypeCounts + zeroMatchNotice explain an empty result', () => {
    const counts = marketTypeCounts ({ 'a': { 'type': 'spot' }, 'b': { 'type': 'swap' }, 'c': { 'type': 'swap' }, 'd': {} });
    assert.deepEqual (counts, { 'swap': 2, 'spot': 1 });
    assert.deepEqual (Object.keys (counts), [ 'swap', 'spot' ], 'most common first');
    const perp = zeroMatchNotice ('okx', 'perpetual', counts, true);
    assert.ok (perp.includes ('no markets of type "perpetual" on okx'));
    assert.ok (perp.includes ('perpetual contracts are type "swap"'));
    assert.ok (perp.includes ('market types here: swap, spot'));
    const other = zeroMatchNotice ('okx', 'margin', counts, true);
    assert.ok (!other.includes ('perpetual'));
    const filters = zeroMatchNotice ('okx', 'swap', counts, false);
    assert.ok (filters.includes ('no markets matched these filters'));
    assert.ok (!filters.includes ('activeOnly'));
    assert.ok (zeroMatchNotice ('x', undefined, {}, true).includes ('none loaded'));
});
