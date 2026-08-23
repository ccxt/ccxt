
import assert from 'assert';
import ccxt from '../../../ccxt.js';

async function testKrakenfuturesParsePositions () {
    const exchange = new ccxt.krakenfutures ({});
    let thrown: any = false;
    try {
        exchange.parsePositions ({ 'result': 'success', 'serverTime': '2026-01-01T00:00:00Z' });
    } catch (error) {
        thrown = true;
    }
    assert (thrown);
    const flat = exchange.parsePositions ({ 'result': 'success', 'openPositions': [], 'serverTime': '2026-01-01T00:00:00Z' });
    const size = flat.length;
    assert (size === 0);
    return true;
}

export default testKrakenfuturesParsePositions;
