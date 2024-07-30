
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testExchangeConfigExtension () {
    const cost = {
        'min': 0.001,
        'max': 1000,
    };
    const precision = {
        'price': 0.000001,
        'amount': 0.001,
    };
    const markets = {
        'ETH/BTC': {
            'symbol': 'ETH/BTC',
            'limits': {
                'cost': cost,
            },
            'precision': precision,
        },
    };
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'markets': markets,
    });

    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExchangeConfigExtension', exchange.markets['ETH/BTC']['limits']['cost'], cost);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExchangeConfigExtension', exchange.markets['ETH/BTC']['precision'], precision);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExchangeConfigExtension', exchange.markets['ETH/BTC']['symbol'], 'ETH/BTC');

    // check if constructor correctly sets
    const exchange2 = new ccxt.Exchange ({
        'id': 'sampleexchange2',
    });
    exchange2.setMarkets (markets);
    testSharedMethods.assertDeepEqual (exchange, undefined, 'testExchangeConfigExtension', exchange.markets['ETH/BTC'], exchange2.markets['ETH/BTC']);
}

export default testExchangeConfigExtension;
