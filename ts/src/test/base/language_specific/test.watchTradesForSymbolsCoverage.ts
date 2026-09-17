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
                'side': frame.side ?? 'buy',
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
    assert.strictEqual (await testWatchTradesForSymbols (delayed.exchange, {}, symbols), true);
    assert.strictEqual (delayed.calls (), 2);
    // Repeated updates for one symbol do not count as coverage of the second.
    const repeated = createExchange ([
        { delay: 6000, symbols: [ symbols[0] ] },
        { delay: 6000, symbols: [ symbols[0] ] },
        { delay: 6000, symbols: [ symbols[1] ] },
    ]);
    assert.strictEqual (await testWatchTradesForSymbols (repeated.exchange, {}, symbols), true);
    assert.strictEqual (repeated.calls (), 3);
    const missing = createExchange ([
        { delay: 6000, symbols: [ symbols[0] ] },
        { delay: 24000, symbols: [ symbols[0] ] },
    ]);
    const warnings: string[] = [];
    const originalLog = console.log;
    console.log = (message) => warnings.push (message);
    try {
        assert.strictEqual (await testWatchTradesForSymbols (missing.exchange, {}, symbols), false);
        const empty = createExchange ([ { delay: 30000, symbols: [] } ]);
        assert.strictEqual (await testWatchTradesForSymbols (empty.exchange, {}, symbols), false);
    } finally {
        console.log = originalLog;
    }
    assert.strictEqual (warnings.length, 2);
    assert (warnings[0].includes ('[TEST_WARNING]'));
    assert (warnings[0].includes ('observed symbols: ["BTC/USDT"]'));
    assert (warnings[1].includes ('observed symbols: []'));
    assert (warnings.every ((warning) => warning.includes ('not all subscriptions could be verified')));
    assert.strictEqual (missing.calls (), 2);
    const wrong = createExchange ([ { delay: 6000, symbols: [ 'SOL/USDT' ] } ]);
    await assert.rejects (testWatchTradesForSymbols (wrong.exchange, {}, symbols), assert.AssertionError);
    const malformed = createExchange ([ { delay: 6000, symbols: [ symbols[0] ], side: 'invalid' } ]);
    await assert.rejects (testWatchTradesForSymbols (malformed.exchange, {}, symbols), assert.AssertionError);
    const failure = new Error ('watch failed');
    const broken = createExchange ([ { delay: 6000, error: failure } ]);
    await assert.rejects (testWatchTradesForSymbols (broken.exchange, {}, symbols), (error) => error === failure);
}

export default testWatchTradesForSymbolsCoverage;
