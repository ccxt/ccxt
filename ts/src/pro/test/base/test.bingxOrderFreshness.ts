// NO_AUTO_TRANSPILE
import assert from 'assert';
import bingx from '../../bingx.js';

// Native handler/cache test: no sockets, credentials or exchange requests.
function testBingxOrderFreshness (ExchangeClass: typeof bingx = bingx) {
    const cases: [ string, number | undefined, number | undefined, boolean, string, string, boolean?, boolean? ][] = [
        [ 'newer update with the same id under another symbol first', 3000, 4000, false, 'FILLED', 'PARTIALLY_FILLED', false, true ],
        [ 'older update with another order of the same symbol first', 3000, 2000, true, 'FILLED', 'PARTIALLY_FILLED', true ],
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
        const [ name, previousTime, incomingTime, reject, previousStatus, incomingStatus, prependSameSymbol = false, prependOtherSymbol = false ] = row;
        const prependOtherOrder = prependSameSymbol || prependOtherSymbol;
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
        }), exchange.safeMarketStructure ({
            'id': 'ETH-USDT',
            'symbol': 'ETH/USDT:USDT',
            'base': 'ETH',
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
        if (prependOtherOrder) {
            const other = frame (prependOtherSymbol ? 5000 : 1000, 'PARTIALLY_FILLED');
            if (prependOtherSymbol) {
                other['o']['s'] = 'ETH-USDT';
            } else {
                other['o']['i'] = '2';
            }
            exchange.handleOrder (client, other);
        }
        exchange.handleOrder (client, first);
        assert (exchange.orders !== undefined, name + ': cache initialized');
        assert.equal (exchange.orders.length, prependOtherOrder ? 2 : 1, name + ': initial cache size');
        const orderIndex = prependOtherOrder ? 1 : 0;
        const otherBefore = prependOtherOrder ? JSON.stringify (exchange.orders[0]) : undefined;
        const before = JSON.stringify (exchange.orders[orderIndex]);
        exchange.handleOrder (client, second);
        assert.equal (exchange.orders.length, prependOtherOrder ? 2 : 1, name + ': cache size');
        assert.equal (resolutions, (reject ? 2 : 4) + (prependOtherOrder ? 2 : 0), name + ': subscriber resolutions');
        if (prependOtherOrder) {
            assert.equal (JSON.stringify (exchange.orders[0]), otherBefore, name + ': unrelated order unchanged');
        }
        if (reject) {
            assert.equal (JSON.stringify (exchange.orders[orderIndex]), before, name + ': cached state');
        } else {
            const expectedStatus = incomingStatus === 'FILLED' ? 'closed' : (incomingStatus === 'CANCELED' ? 'canceled' : 'open');
            assert.equal (exchange.orders[orderIndex]['status'], expectedStatus, name + ': accepted status');
            const validIncomingTime = (typeof incomingTime === 'number') && (incomingTime > 0);
            assert.equal (exchange.orders[orderIndex]['lastUpdateTimestamp'], validIncomingTime ? incomingTime : undefined, name + ': update time');
        }
        assert.equal (JSON.stringify (first), rawFirst, name + ': first raw frame');
        assert.equal (JSON.stringify (second), rawSecond, name + ': second raw frame');
        assert.equal (Object.keys (exchange.clients).length, 0, name + ': no sockets');
    }
}

export default testBingxOrderFreshness;
