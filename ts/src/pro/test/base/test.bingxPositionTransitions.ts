// NO_AUTO_TRANSPILE
import assert from 'assert';
import bingx from '../../bingx.js';
import type { Position } from '../../../base/types.js';

function testBingxPositionTransitions (ExchangeClass: typeof bingx = bingx) {
    const createExchange = () => {
        const exchange = new ExchangeClass ({});
        exchange.setMarkets ([ 'LTC', 'ETH' ].map (base => exchange.safeMarketStructure ({
            'id': base + '-USDT', 'symbol': base + '/USDT:USDT',
            'base': base, 'quote': 'USDT', 'settle': 'USDT',
            'type': 'swap', 'spot': false, 'swap': true, 'contract': true,
            'linear': true, 'inverse': false, 'contractSize': 1,
        })));
        return exchange;
    };
    const row = (pa: string, ps = 'BOTH', base = 'LTC') => ({
        's': base + '-USDT', 'ps': ps, 'pa': pa,
        'ep': pa === '0' ? '0' : '100', 'up': '0', 'mt': 'cross',
    });
    const snapshot = (exchange: bingx): Position[] => {
        assert (exchange.positions !== undefined);
        return Array.from (exchange.positions) as Position[];
    };
    let emitted: any[] = [];
    const client: any = {
        futures: { 'swap:positions::LTC/USDT:USDT': {} },
        resolve: (positions: any, hash: string) => { emitted.push ({ positions, hash }); },
    };
    const send = (exchange: bingx, positions: any[]) => {
        emitted = [];
        const message = { 'e': 'ACCOUNT_UPDATE', 'E': 1721356200000, 'a': { 'm': 'ORDER', 'P': positions } };
        const original = JSON.stringify (message);
        exchange.handlePositions (client, message);
        assert.equal (JSON.stringify (message), original, 'raw frame must stay unchanged');
        assert.equal (Object.keys (exchange.clients).length, 0, 'no socket must be opened');
    };
    for (const initial of [ '2', '-3' ]) {
        const exchange = createExchange ();
        send (exchange, [ row (initial) ]);
        const cache = exchange.positions;
        send (exchange, [ row ('0') ]);
        let positions = snapshot (exchange);
        assert.equal (positions.length, 1, 'one-way close must replace the previous side');
        assert.equal (positions[0]['contracts'], 0);
        assert.equal (positions[0]['side'], 'both');
        assert.equal (positions[0]['hedged'], false);
        assert.equal (exchange.positions, cache, 'cache identity must be preserved');
        const filtered = emitted.find (update => update.hash === 'swap:positions::LTC/USDT:USDT');
        assert (filtered !== undefined, 'symbol subscriber must receive the closure');
        assert.equal (filtered.positions[0]['contracts'], 0);
        send (exchange, [ row ('0') ]);
        assert.equal (snapshot (exchange).length, 1, 'duplicate closure must not accumulate');
        send (exchange, [ row (initial) ]);
        positions = snapshot (exchange);
        assert.equal (positions.length, 1, 'reopen must replace the zero position');
        assert.equal (positions[0]['contracts'], Math.abs (Number (initial)));
    }
    const reversalExchange = createExchange ();
    send (reversalExchange, [ row ('4', 'LONG', 'ETH'), row ('-5', 'SHORT', 'ETH') ]);
    const otherSymbol = JSON.stringify (snapshot (reversalExchange));
    for (const amount of [ '2', '-3', '2', '0' ]) {
        send (reversalExchange, [ row (amount) ]);
        const positions = snapshot (reversalExchange);
        const own = positions.filter (position => position['symbol'] === 'LTC/USDT:USDT');
        assert.equal (own.length, 1, 'reversal must not retain the opposite side');
        assert.equal (own[0]['contracts'], Math.abs (Number (amount)));
        assert.equal (JSON.stringify (positions.filter (position => position['symbol'] === 'ETH/USDT:USDT')), otherSymbol, 'other symbol must stay unchanged');
    }
    const hedge = createExchange ();
    send (hedge, [ row ('2', 'LONG'), row ('-3', 'SHORT') ]);
    send (hedge, [ row ('0', 'LONG') ]);
    const hedgePositions = snapshot (hedge);
    assert.equal (hedgePositions.length, 2, 'hedge sides must remain independent');
    const longPosition = hedgePositions.find (position => position['side'] === 'long');
    const shortPosition = hedgePositions.find (position => position['side'] === 'short');
    assert (longPosition !== undefined);
    assert (shortPosition !== undefined);
    assert.equal (longPosition['contracts'], 0);
    assert.equal (shortPosition['contracts'], 3);
    const initiallyClosed = createExchange ();
    send (initiallyClosed, [ row ('0') ]);
    assert.equal (snapshot (initiallyClosed)[0]['side'], 'both', 'zero one-way position preserves the exchange side');
}

export default testBingxPositionTransitions;
