import assert from 'assert';
import testTradingFee from './base/test.tradingFee.js';
async function testFetchTradingFee(exchange, skippedProperties, symbol) {
    const method = 'fetchTradingFee';
    const fee = await exchange.fetchTradingFee(symbol);
    assert(exchange.isDictionary(fee), exchange.id + ' ' + method + ' ' + symbol + ' must return a dict. ' + exchange.json(fee));
    testTradingFee(exchange, skippedProperties, method, symbol, fee);
    return true;
}
export default testFetchTradingFee;
