import testTicker from './base/test.ticker.js';
async function testFetchTicker(exchange, skippedProperties, symbol) {
    const method = 'fetchTicker';
    const ticker = await exchange.fetchTicker(symbol);
    testTicker(exchange, skippedProperties, method, ticker, symbol);
    return true;
}
export default testFetchTicker;
