import { Exchange } from "../../../ccxt";
import testTicker from './base/test.ticker.js';

async function testFetchTicker (exchange: Exchange, skippedProperties: object, symbol: string) {
    const method = 'fetchTicker';
    const ticker = await exchange.fetchTicker (symbol);
    testTicker (exchange, skippedProperties, method, ticker, symbol);
    return true;
}

export default testFetchTicker;
