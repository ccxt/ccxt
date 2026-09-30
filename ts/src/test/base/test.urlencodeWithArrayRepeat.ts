

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testUrlencodeWithArrayRepeat () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const dict2 = {
        'a': 1,
        'product_ids': [ 'AA', 'BB' ],
    };
    const expected2a = 'a=1&product_ids=AA&product_ids=BB';
    const expected2b = 'product_ids=AA&product_ids=BB&a=1';
    const result2 = exchange.urlencodeWithArrayRepeat (dict2);

    assert (result2 === expected2a || result2 === expected2b, 'urlencodeWithArrayRepeat: expected ' + expected2a + ' or ' + expected2b + ' but got ' + result2);
}

export default testUrlencodeWithArrayRepeat;
