import assert from 'assert';
import ccxt from '../../../ccxt.js';
function testStrip() {
    const exchange = new ccxt.Exchange({
        'id': 'sampleexchange',
    });
    assert(exchange.strip(' asd') === 'asd');
    assert(exchange.strip('    asd') === 'asd');
    assert(exchange.strip('asd ') === 'asd');
    assert(exchange.strip('asd    ') === 'asd');
    assert(exchange.strip(' asd ') === 'asd');
    assert(exchange.strip('    asd    ') === 'asd');
    assert(exchange.strip('asd') === 'asd');
    assert(exchange.strip('') === '');
    // assert (exchange.strip (undefined) === undefined); // todo
}
export default testStrip;
