import { Exchange } from "../../../ccxt";
import testOrderBook from './base/test.orderBook.js';

/**
 * Test for OKX's SBE (Simple Binary Encoding) orderbook endpoint
 * Note: This test requires a valid instIdCode which must be obtained from OKX API
 * The instIdCode is an integer identifier for each trading pair
 */
async function testFetchOrderBookSbe (exchange: Exchange, skippedProperties: object, symbol: string, instIdCode: number) {
    const method = 'fetchOrderBookSbe';

    // Check if the method exists (OKX-specific)
    const exchangeAny = exchange as any;
    if (!exchangeAny.fetchOrderBookSbe) {
        console.log ('fetchOrderBookSbe is not supported by', exchange.id);
        return true;
    }

    const orderbook = await (exchange as any).fetchOrderBookSbe (symbol, instIdCode);
    testOrderBook (exchange, skippedProperties, method, orderbook, symbol);

    // Additional SBE-specific validations
    // The orderbook should have the standard structure
    console.log ('SBE Orderbook fetched successfully for', symbol);
    console.log ('Bids:', orderbook.bids.length, 'Asks:', orderbook.asks.length);

    return true;
}

export default testFetchOrderBookSbe;
