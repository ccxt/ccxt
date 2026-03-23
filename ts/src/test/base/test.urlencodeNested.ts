

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testUrlencodeNested () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    const dict2 = {
        'a': 1,
        'b': {
            'c': 2,
            'something': '+&'
        },
        'd': [ 1, 2 ],
    };
    const expected2 = 'a=1&b[c]=2&b[something]=%2B%26&d[0]=1&d[1]=2';

    assert (exchange.urlencodeNested (dict2) === expected2, 'urlencodeNested: expected ' + expected2 + ' but got ' + exchange.urlencodeNested (dict2));
}

export default testUrlencodeNested;
