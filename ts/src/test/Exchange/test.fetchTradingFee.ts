import assert from 'assert';
import { Exchange } from "../../../ccxt.js";
import testTradingFee from './base/test.tradingFee.js';

async function testFetchTradingFee (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchTradingFee';
    const fee = await exchange.fetchTradingFee (symbol);
    assert (exchange.isDictionary (fee), exchange.id + ' ' + method + ' ' + symbol + ' must return a dict. ' + exchange.json (fee));
    testTradingFee (exchange, skippedProperties, method, symbol, fee);
    return true;
}

export default testFetchTradingFee;
