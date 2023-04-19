
import testTicker from './base/test.ticker.js';

async function testFetchTicker (exchange, symbol) {
    const method = 'fetchTicker';
    const ticker = await exchange.fetchTicker (symbol);
    testTicker (exchange, method, ticker, symbol);
}

export default testFetchTicker;
