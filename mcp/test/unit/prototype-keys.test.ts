import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchTickerList, badTimeframe } from '../../ts/tools/common.js';

// ccxt answers fetchTickers with a plain object keyed by symbol, and a symbol is caller
// text: "__proto__" read off such an object is Object.prototype itself. These pin that a
// prototype-named symbol or timeframe is treated as unknown, never read or written through.

const PROTOTYPE_KEYS = [ '__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf' ];

test ('fetchTickerList reads only own keys of a fetchTickers result and never writes onto it', async () => {
    const answered = { 'last': 1 };
    const exchange: any = {
        'has': { 'fetchTickers': true },
        'fetchTickers': async () => ({ 'BTC/USDT': answered }),
    };
    const rows = await fetchTickerList (exchange, [ 'BTC/USDT', ...PROTOTYPE_KEYS ], {});
    assert.equal (rows.length, 1);
    assert.equal (rows[0].symbol, 'BTC/USDT');
    assert.equal ((answered as any).symbol, undefined, 'the upstream (possibly cached, shared) object is copied, not changed');
    assert.equal (({} as any).symbol, undefined, 'Object.prototype was not polluted');
    assert.equal (Object.prototype.hasOwnProperty.call (Object.prototype, 'symbol'), false);
});

test ('fetchTickerList per-symbol path copies a ticker that lacks its symbol', async () => {
    const shared = { 'last': 2 };
    const exchange: any = { 'has': { 'fetchTickers': false }, 'fetchTicker': async () => shared };
    const rows = await fetchTickerList (exchange, [ 'ETH/USDT' ], {});
    assert.equal (rows[0].symbol, 'ETH/USDT');
    assert.equal ((shared as any).symbol, undefined);
});

test ('badTimeframe rejects inherited (prototype) names', () => {
    const exchange: any = { 'id': 'fakex', 'timeframes': { '1m': '1m', '1h': '60' } };
    assert.equal (badTimeframe (exchange, '1h'), undefined);
    for (const frame of PROTOTYPE_KEYS) {
        const envelope: any = badTimeframe (exchange, frame);
        assert.equal (envelope?.error?.code, 'BAD_TIMEFRAME', frame);
    }
});
