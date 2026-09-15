// NO_AUTO_TRANSPILE
import assert from 'assert';
import bingx from '../../bingx.js';

// Native handler/cache test: no sockets, credentials or exchange requests.
function testBingxOrderFreshness (ExchangeClass: typeof bingx = bingx) {
    const cases: [ string, number | undefined, number | undefined, boolean, string, string ][] = [
        [ 'older partial after fill', 3000, 2000, true, 'FILLED', 'PARTIALLY_FILLED' ],
        [ 'older partial after cancellation', 3000, 2000, true, 'CANCELED', 'PARTIALLY_FILLED' ],
        [ 'older partial after partial', 3000, 2000, true, 'PARTIALLY_FILLED', 'PARTIALLY_FILLED' ],
        [ 'newer correction', 3000, 4000, false, 'FILLED', 'PARTIALLY_FILLED' ],
        [ 'equal update time', 3000, 3000, false, 'FILLED', 'PARTIALLY_FILLED' ],
        [ 'missing incoming time', 3000, undefined, false, 'FILLED', 'PARTIALLY_FILLED' ],
        [ 'zero incoming time', 3000, 0, false, 'FILLED', 'PARTIALLY_FILLED' ],
        [ 'negative incoming time', 3000, -1, false, 'FILLED', 'PARTIALLY_FILLED' ],
        [ 'missing previous time', undefined, 2000, false, 'FILLED', 'PARTIALLY_FILLED' ],
        [ 'zero previous time', 0, 2000, false, 'FILLED', 'PARTIALLY_FILLED' ],
        [ 'cancellation without a trade time', 2000, 3000, false, 'PARTIALLY_FILLED', 'CANCELED' ],
        [ 'identical terminal duplicate', 3000, 3000, false, 'FILLED', 'FILLED' ],
    ];
    for (const row of cases) {
        const [ name, previousTime, incomingTime, reject, previousStatus, incomingStatus ] = row;
        const exchange = new ExchangeClass ({});
        exchange.setMarkets ([ exchange.safeMarketStructure ({
            'id': 'LTC-USDT',
            'symbol': 'LTC/USDT:USDT',
            'base': 'LTC',
            'quote': 'USDT',
            'settle': 'USDT',
            'type': 'swap',
            'spot': false,
            'swap': true,
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': 1,
        }) ]);
        let resolutions = 0;
        const client: any = { resolve: () => { resolutions++; } };
        const frame = (time: any, status: any) => ({
            'e': 'ORDER_TRADE_UPDATE',
            'T': time,
            // Event time deliberately differs: it must not replace update time.
            'E': 9000,
            'o': {
                's': 'LTC-USDT', 'i': '1', 'S': 'BUY', 'o': 'LIMIT',
                'q': '5', 'p': '110', 'ap': status === 'FILLED' ? '98' : '94',
                'x': status === 'CANCELED' ? 'CANCELED' : 'TRADE', 'X': status,
                'ps': 'LONG', 'z': status === 'FILLED' ? '5' : '3',
                'T': 0, 'N': 'USDT', 'n': '0',
            },
        });
        const first = frame (previousTime, previousStatus);
        const second = frame (incomingTime, incomingStatus);
        const rawFirst = JSON.stringify (first);
        const rawSecond = JSON.stringify (second);
        exchange.handleOrder (client, first);
        assert (exchange.orders !== undefined, name + ': cache initialized');
        const before = JSON.stringify (exchange.orders[0]);
        exchange.handleOrder (client, second);
        assert.equal (exchange.orders.length, 1, name + ': cache size');
        assert.equal (resolutions, reject ? 2 : 4, name + ': subscriber resolutions');
        if (reject) {
            assert.equal (JSON.stringify (exchange.orders[0]), before, name + ': cached state');
        } else {
            const expectedStatus = incomingStatus === 'FILLED' ? 'closed' : (incomingStatus === 'CANCELED' ? 'canceled' : 'open');
            assert.equal (exchange.orders[0]['status'], expectedStatus, name + ': accepted status');
            const validIncomingTime = (typeof incomingTime === 'number') && (incomingTime > 0);
            assert.equal (exchange.orders[0]['lastUpdateTimestamp'], validIncomingTime ? incomingTime : undefined, name + ': update time');
        }
        assert.equal (JSON.stringify (first), rawFirst, name + ': first raw frame');
        assert.equal (JSON.stringify (second), rawSecond, name + ': second raw frame');
        assert.equal (Object.keys (exchange.clients).length, 0, name + ': no sockets');
    }
}

export default testBingxOrderFreshness;
