// NO_AUTO_TRANSPILE
import assert from 'assert';
import ccxt from '../../../../ccxt.js';

function testBitgetUnwatchCapabilities () {
    const exchange = new ccxt.pro.bitget ();
    assert (exchange.has['unWatchOHLCV'] === true, 'bitget must advertise its implemented unWatchOHLCV method');
    assert (exchange.has['unWatchTrades'] === true, 'bitget must advertise its implemented unWatchTrades method');
}

export default testBitgetUnwatchCapabilities;
