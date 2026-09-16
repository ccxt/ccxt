// NO_AUTO_TRANSPILE
// @ts-nocheck

import assert from 'assert';
import ccxt from '../../../../ccxt.js';
import testFetchTrades from '../../Exchange/test.fetchTrades.js';

async function testFetchTradesDiagnostics () {
    const exchange = new ccxt.bingx ();
    const symbol = 'BTC/USDT:USDT';
    const timestamp = 1700000000000;
    const market = { 'id': 'BTC-USDT', 'symbol': symbol, 'linear': true, 'swap': true, 'contractSize': 1 };
    exchange.milliseconds = () => timestamp + 1000;
    for (const side of [ 'buy', 'sell' ]) {
        const raw = [ 100, 101 ].map ((price, index) => ({
            'time': timestamp, 'price': price.toString (), 'qty': '1',
            'quoteQty': price.toString (), 'isBuyerMaker': side === 'sell',
            'fillId': 'diagnostic-' + index,
        }));
        const trades = raw.map ((entry) => exchange.parseTrade (entry, market));
        const failing = (side === 'buy') ? trades.slice ().reverse () : trades;
        exchange.fetchTrades = async () => failing;
        await assert.rejects (testFetchTrades (exchange, {}, symbol), (error) => {
            assert (error.message.indexOf ('Price is ') >= 0);
            const serialized = error.message.split (' ::: ')[1].split (' >>> ')[0];
            const context = JSON.parse (serialized);
            assert.deepStrictEqual (context.previous, JSON.parse (JSON.stringify (failing[0])));
            assert.deepStrictEqual (context.current, JSON.parse (JSON.stringify (failing[1])));
            assert.strictEqual (context.previous.info.fillId, failing[0].info.fillId);
            return true;
        });
        exchange.fetchTrades = async () => failing.slice ().reverse ();
        assert.strictEqual (await testFetchTrades (exchange, {}, symbol), true);
        exchange.fetchTrades = async () => [ failing[0] ];
        assert.strictEqual (await testFetchTrades (exchange, {}, symbol), true);
    }
}

export default testFetchTradesDiagnostics;
