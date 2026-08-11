import testTradingFee from './base/test.tradingFee.js';
import testSharedMethods from './base/test.sharedMethods.js';
async function testFetchTradingFee(exchange, skippedProperties, symbol) {
    const method = 'fetchTradingFee';
    const fee = await exchange.fetchTradingFee(symbol);
    testSharedMethods.assertDictionaryResponse(exchange, method, fee, symbol);
    testTradingFee(exchange, skippedProperties, method, symbol, fee);
    return true;
}
export default testFetchTradingFee;
