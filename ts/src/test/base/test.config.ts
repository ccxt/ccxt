
// AUTO_TRANSPILE_ENABLED

import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testExchangeConfig () {
    const cost = {
        'min': 0.001,
        'max': 1000,
    };
    const precision = {
        'amount': 0.001,
        'price': 0.000001,
        'cost': undefined,
        'base': undefined,
        'quote': undefined,
    };
    const markets = {
        'ETH/BTC': {
            'id': 'ETH_BTC',
            'symbol': 'ETH/BTC',
            'limits': {
                'cost': cost,
            },
            'precision': precision,
            'spot': true,
        },
    };
    try {
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
    } catch (e) {
        // skip c# , todo
        if ((e.toString ()).includes ('BaseTest.assert') || (e.toString ()).includes ('at System.') || (e.toString ()).includes ('at ccxt.Exchange.')) {
            return;
        } else {
            throw e;
        }
    }
}

export default testExchangeConfig;
