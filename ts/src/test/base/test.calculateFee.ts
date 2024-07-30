
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';


function testCalculateFeeWithPrecision (tickPrecision = true) {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'precisioinMode': tickPrecision ? 4 : 3, // 4 for ticksize, 3 for significant precision
    });

    const price = 100.00;
    const amount = 10.00;
    const taker = 0.0025;
    const maker = 0.0010;
    const fees = {
        'taker': taker,
        'maker': maker,
    };
    const market = {
        'id':     'foobar',
        'symbol': 'FOO/BAR',
        'base':   'FOO',
        'quote':  'BAR',
        'taker':   taker,
        'maker':   maker,
        'spot': true,
    };
    const markets = {
        'FOO/BAR': market,
    };

    exchange.setMarkets (markets);

    market['precision'] = {
        'amount': tickPrecision ? exchange.parseNumber ('0.00000001') : exchange.parseNumber ('8'),
        'price': tickPrecision ? exchange.parseNumber ('0.00000001') : exchange.parseNumber ('8'),
    };

    const keys = Object.keys (fees);

    for (let i = 0; i < keys.length; i++) {
        const takerOrMaker = keys[i];
        const result = exchange.calculateFee (market['symbol'], 'limit', 'buy', amount, price, takerOrMaker, {});

        testSharedMethods.deepEqual (result, {
            'type': takerOrMaker,
            'currency': 'BAR',
            'rate': fees[takerOrMaker],
            'cost': fees[takerOrMaker] * amount * price,
        });
    }
}

function testCalculateFee () {
    testCalculateFeeWithPrecision (true);
    testCalculateFeeWithPrecision (false);
}


export default testCalculateFee;
