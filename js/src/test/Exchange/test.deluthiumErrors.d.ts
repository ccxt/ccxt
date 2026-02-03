/**
 * Deluthium DEX - Error Handling Tests
 *
 * Tests the dual error format handling (string codes from Trading Service +
 * numeric codes from Market Data Service) as specified in the plan document.
 */
import { Exchange } from "../../../ccxt";
import { BadRequest } from "../../base/errors.js";
declare const STRING_ERROR_MAPPINGS: {
    code: string;
    exception: typeof BadRequest;
    description: string;
}[];
declare const NUMERIC_ERROR_MAPPINGS: {
    code: number;
    exception: typeof BadRequest;
    description: string;
}[];
declare function testStringErrorCodeDetection(exchange: Exchange): void;
declare function testNumericErrorCodeDetection(exchange: Exchange): void;
declare function testSuccessCodeHandling(exchange: Exchange): void;
declare function testDualFormatDistinction(exchange: Exchange): void;
declare function testDeluthiumErrors(exchange: Exchange, skippedProperties?: object): Promise<boolean>;
export default testDeluthiumErrors;
export { STRING_ERROR_MAPPINGS, NUMERIC_ERROR_MAPPINGS, testStringErrorCodeDetection, testNumericErrorCodeDetection, testSuccessCodeHandling, testDualFormatDistinction, };
