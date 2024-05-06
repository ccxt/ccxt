import { Exchange } from "../../../ccxt";
import testTradingFee from './base/test.tradingFee.js';
import testSharedMethods from './base/test.sharedMethods.js';

async function testFetchTradingFees (exchange: Exchange, skippedProperties: object) {
    const method = 'fetchTradingFees';
    const fees = await exchange.fetchTradingFees ();
    const symbols = Object.keys (fees);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, symbols);
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        testTradingFee (exchange, skippedProperties, method, symbol, fees[symbol]);
    }
}

export default testFetchTradingFees;
