

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
    const expected2 = 'a=1&product_ids=AA&product_ids=BB';

    assert (exchange.urlencodeWithArrayRepeat (dict2) === expected2, 'urlencodeWithArrayRepeat: expected ' + expected2 + ' but got ' + exchange.urlencodeWithArrayRepeat (dict2));
}

export default testUrlencodeWithArrayRepeat;
