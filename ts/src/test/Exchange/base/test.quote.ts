/**
 * Quote Validator for Deluthium DEX and similar RFQ-based exchanges
 * 
 * Validates the structure of indicative and firm quotes returned by fetchQuote()
 */

import assert from 'assert';
import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testQuote(exchange: Exchange, skippedProperties: object, method: string, entry: any, symbol: string) {
    const logText = testSharedMethods.logTemplate(exchange, method, entry);

    // For DEX RFQ exchanges, the quote structure is different
    // Validate symbol
    testSharedMethods.assertSymbol(exchange, skippedProperties, method, entry, 'symbol', symbol);

    // Validate amounts are positive strings
    const amountIn = exchange.safeString(entry, 'amount_in');
    const amountOut = exchange.safeString(entry, 'amount_out');
    
    if (amountIn !== undefined) {
        const amountInNum = parseFloat(amountIn);
        assert(!isNaN(amountInNum), 'amount_in should be a valid number' + logText);
    }
    
    if (amountOut !== undefined) {
        const amountOutNum = parseFloat(amountOut);
        assert(!isNaN(amountOutNum), 'amount_out should be a valid number' + logText);
    }

    // Validate info object exists
    assert(entry['info'] !== undefined, 'quote should have info object' + logText);
}

export default testQuote;
