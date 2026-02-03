/**
 * Quote Validator for Deluthium DEX and similar RFQ-based exchanges
 *
 * Validates the structure of indicative and firm quotes returned by fetchQuote()
 */
import { Exchange } from "../../../../ccxt";
declare function testQuote(exchange: Exchange, skippedProperties: object, method: string, entry: any, symbol: string): void;
export default testQuote;
