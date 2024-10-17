import testMarginMode from './base/test.marginMode.js';
async function testFetchMarginMode(exchange, skippedProperties, symbol) {
    const method = 'fetchMarginMode';
    const marginMode = await exchange.fetchMarginMode(symbol);
    testMarginMode(exchange, skippedProperties, method, marginMode);
}
export default testFetchMarginMode;
