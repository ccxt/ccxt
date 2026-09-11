import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testBackpackGetCacheIndex () {
    const exchange = new ccxt.pro.backpack ({
        'id': 'backpack',
    });

    const cache = [
        {
            "E": "1759338824897386",
            "T": "1759338824895616",
            "U": 1662976171,
            "a": [],
            "b": [["117357.0","0.00000"]],
            "e": "depth",
            "s": "BTC_USDC_PERP",
            "u": 1662976171
        }
    ];

    const orderbook = {
        'nonce': 1662976169, // nonce < U - 1 (1662976171 - 1 = 1662976170)
    };

    const index = exchange.getCacheIndex (orderbook, cache);
    assert (index === -1, 'getCacheIndex should return -1 when nonce is less than firstDeltaStart - 1');

    const orderbook2 = {
        'nonce': 1662976170,
    };
    const index2 = exchange.getCacheIndex (orderbook2, cache);
    assert (index2 === 0, 'getCacheIndex should return 0 when nonce matches');

    console.log ('Backpack getCacheIndex test passed!');
}

testBackpackGetCacheIndex();
export default testBackpackGetCacheIndex;
