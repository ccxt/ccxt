// NO_AUTO_TRANSPILE
// @ts-nocheck

import assert from 'assert';
import bingx from '../../../pro/bingx.js';
import { setupWsMockTransport, injectWsMessage } from '../../tests.helpers.js';

async function testBingxTickerContext () {
    // Synthetic ticker fixtures: the same unknown id must keep the units of
    // its connection, without inferring a market type from the symbol text.
    const fixtures = [
        { type: 'spot', symbol: 'BTC/USDT', id: 'BTC-USDT' },
        { type: 'linear', symbol: 'BTC/USDT:USDT', id: 'BTC-USDT' },
        { type: 'inverse', symbol: 'BTC/USD:BTC', id: 'BTC-USD' },
    ];
    for (const fixture of fixtures) {
        for (const unknown of [ false, true ]) {
            for (const missingCoinVolume of [ false, true ]) {
                const exchange = new bingx ();
                const inverse = fixture.type === 'inverse';
                const spot = fixture.type === 'spot';
                exchange.setMarkets ([ {
                    id: fixture.id, symbol: fixture.symbol, base: 'BTC', quote: inverse ? 'USD' : 'USDT',
                    settle: spot ? undefined : (inverse ? 'BTC' : 'USDT'),
                    type: spot ? 'spot' : 'swap', spot, swap: !spot, linear: !spot && !inverse,
                    inverse, contract: !spot, contractSize: 100,
                } ]);
                const url = exchange.urls.api.ws[fixture.type];
                setupWsMockTransport (exchange, url);
                const pending = exchange.watchTicker (fixture.symbol);
                const hash = exchange.getMessageHash ('ticker', fixture.symbol);
                assert (hash in exchange.client (url).futures);
                const id = unknown ? 'UNLISTED' : fixture.id;
                const data = { s: id, c: '100', o: '100', h: '101', l: '99', v: '500', q: '500', C: 1720000000000 };
                if (!missingCoinVolume) {
                    data.m = '5';
                }
                injectWsMessage (exchange, url, { code: 0, dataType: id + '@ticker', data });
                const ticker = exchange.tickers[unknown ? id : fixture.symbol];
                // Finish the real subscription even when the tested frame has
                // an unexpected id, so the fixture leaves no pending watcher.
                if (unknown) {
                    injectWsMessage (exchange, url, { code: 0, dataType: fixture.id + '@ticker', data: { ...data, s: fixture.id } });
                }
                await pending;
                assert.strictEqual (ticker.baseVolume, inverse ? (missingCoinVolume ? undefined : 5) : 500);
                assert.strictEqual (ticker.quoteVolume, 500);
                assert.strictEqual (ticker.symbol, unknown ? id : fixture.symbol);
                assert.strictEqual (exchange.market (fixture.symbol).inverse, inverse);
                assert.deepStrictEqual (ticker.info, data);
            }
        }
    }
}

export default testBingxTickerContext;
