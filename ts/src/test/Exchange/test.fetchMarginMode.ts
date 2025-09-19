import { Exchange } from "../../../ccxt";
import testMarginMode from './base/test.marginMode.js';

async function testFetchMarginMode (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchMarginMode';
    const marginMode = await exchange.fetchMarginMode (symbol);
    testMarginMode (exchange, skippedProperties, method, marginMode);
    return true;
}

export default testFetchMarginMode;
