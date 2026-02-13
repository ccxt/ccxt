/**
 * Test for fetchQuote() method
 * 
 * This is a new unified method for RFQ-based DEX exchanges like Deluthium.
 * It returns indicative quotes for swap operations.
 */

import { Exchange } from "../../../ccxt";
import testQuote from './base/test.quote.js';

async function testFetchQuote(exchange: any, skippedProperties: object, symbol: string) {
    const method = 'fetchQuote';
    
    // Check if exchange supports fetchQuote
    if (!exchange.has['fetchQuote']) {
        console.log(`  ${exchange.id} does not support fetchQuote, skipping...`);
        return true;
    }
    
    // Test buy quote
    const amount = 100;  // Example amount
    const side = 'buy';
    
    const quote = await exchange.fetchQuote(symbol, amount, side);
    testQuote(exchange, skippedProperties, method, quote, symbol);
    
    // Verify quote has expected structure for RFQ exchanges
    if (quote['amount_in'] !== undefined) {
        console.log(`  Quote: ${quote['amount_in']} ${side} → ${quote['amount_out']}`);
    }
    
    return true;
}

export default testFetchQuote;
