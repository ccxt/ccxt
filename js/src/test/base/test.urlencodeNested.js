import assert from 'assert';
import ccxt from '../../../ccxt.js';
function testUrlencodeNested() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    // todo: add nulls
    // todo: add key sort (for different langs)
    const dict2 = {
        'b': {
            'c': 2,
            'target': '+&'
        },
        'd': [1, 2],
    };
    const expected2a = 'b[c]=2&b[target]=%2B%26&d[0]=1&d[1]=2';
    const expected2c = 'b[target]=%2B%26&b[c]=2&d[0]=1&d[1]=2';
    const expected2b = 'd[0]=1&d[1]=2&b[c]=2&b[target]=%2B%26';
    const expected2d = 'd[0]=1&d[1]=2&b[target]=%2B%26&b[c]=2';
    const result2 = exchange.urlencodeNested(dict2);
    assert(result2 === expected2a || result2 === expected2b || result2 === expected2c || result2 === expected2d, 'urlencodeNested: expected ' + expected2a + ' or ' + expected2b + ' or ' + expected2c + ' or ' + expected2d + ' but got ' + result2);
}
export default testUrlencodeNested;
