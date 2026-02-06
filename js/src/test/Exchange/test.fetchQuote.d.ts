/**
 * Test for fetchQuote() method
 *
 * This is a new unified method for RFQ-based DEX exchanges like Deluthium.
 * It returns indicative quotes for swap operations.
 */
declare function testFetchQuote(exchange: any, skippedProperties: object, symbol: string): Promise<boolean>;
export default testFetchQuote;
