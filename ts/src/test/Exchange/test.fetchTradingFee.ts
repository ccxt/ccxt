import assert from 'assert';
import { Exchange } from "../../../ccxt";
import testTradingFee from './base/test.tradingFee.js';

async function testFetchTradingFee (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchTradingFee';
    const fee = await exchange.fetchTradingFee (symbol);
    assert (typeof fee === 'object', exchange.id + ' ' + method + ' ' + symbol + ' must return an object. ' + exchange.json (fee));
    testTradingFee (exchange, skippedProperties, method, symbol, fee);
}

export default testFetchTradingFee;
