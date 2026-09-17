// NO_AUTO_TRANSPILE
// @ts-nocheck

import assert from 'assert';
import ccxt from '../../../../ccxt.js';
import testWatchTradesForSymbols from '../../../pro/test/Exchange/test.watchTradesForSymbols.js';

async function testWatchTradesForSymbolsCoverage () {
    const symbols = [ 'BTC/USDT', 'ETH/USDT' ];
    const createExchange = (frames) => {
        const exchange = new ccxt.Exchange ();
        let now = 1700000000000;
        let calls = 0;
        exchange.milliseconds = () => now;
        exchange.watchTradesForSymbols = async (requested) => {
            assert.deepStrictEqual (requested, symbols);
            assert (calls < frames.length, 'unexpected extra watch call');
            const frame = frames[calls++];
            now += frame.delay;
            if (frame.error !== undefined) {
                throw frame.error;
            }
            return frame.symbols.map ((symbol) => ({
                'info': {},
                'id': String (calls),
                'timestamp': now,
                'datetime': exchange.iso8601 (now),
                'symbol': symbol,
                'order': undefined,
                'side': 'buy',
                'takerOrMaker': 'taker',
                'price': 100,
                'amount': 1,
                'cost': 100,
                'fee': undefined,
                'fees': [],
            }));
        };
        return { exchange, calls: () => calls };
    };
    // A slow first response must not end observation before the other symbol arrives.
    const delayed = createExchange ([
        { delay: 6000, symbols: [ symbols[0] ] },
        { delay: 6000, symbols: [ symbols[1] ] },
    ]);
    await testWatchTradesForSymbols (delayed.exchange, {}, symbols);
    assert.strictEqual (delayed.calls (), 2);
    // Repeated updates for one symbol do not count as coverage of the second.
    const repeated = createExchange ([
        { delay: 6000, symbols: [ symbols[0] ] },
        { delay: 6000, symbols: [ symbols[0] ] },
        { delay: 6000, symbols: [ symbols[1] ] },
    ]);
    await testWatchTradesForSymbols (repeated.exchange, {}, symbols);
    assert.strictEqual (repeated.calls (), 3);
    const missing = createExchange ([
        { delay: 6000, symbols: [ symbols[0] ] },
        { delay: 24000, symbols: [ symbols[0] ] },
    ]);
    await assert.rejects (testWatchTradesForSymbols (missing.exchange, {}, symbols), /only received part of symbols/);
    assert.strictEqual (missing.calls (), 2);
    const wrong = createExchange ([ { delay: 6000, symbols: [ 'SOL/USDT' ] } ]);
    await assert.rejects (testWatchTradesForSymbols (wrong.exchange, {}, symbols), assert.AssertionError);
    const failure = new Error ('watch failed');
    const broken = createExchange ([ { delay: 6000, error: failure } ]);
    await assert.rejects (testWatchTradesForSymbols (broken.exchange, {}, symbols), (error) => error === failure);
}

export default testWatchTradesForSymbolsCoverage;
