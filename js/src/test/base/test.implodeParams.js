import assert from 'assert';
import ccxt from '../../../ccxt.js';
function testImplodeParams() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    const path = 'v2/watchlists/{timeframe_id}/{symbol_id}';
    const params = {
        'timeframe_id': '1m',
        'symbol_id': 'BTC/USDT',
        'extra_param': 'should_be_ignored',
    };
    const expected = 'v2/watchlists/1m/BTC/USDT';
    const result = exchange.implodeParams(path, params);
    assert(result === expected, 'implodeParams did not produce the expected result: ' + result + ' != ' + expected);
}
export default testImplodeParams;
