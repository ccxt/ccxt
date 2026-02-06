/**
 * Deluthium DEX - Comprehensive Unit Tests
 *
 * Tests cover:
 * - Symbol format conversion (hyphen to slash)
 * - pairId caching mechanism
 * - Dual error format handling (string + numeric codes)
 * - Parameter style handling (snake_case vs camelCase)
 * - Cross-chain support
 * - Authentication (all endpoints require JWT)
 */
import { Exchange } from "../../../ccxt";
declare function testDeluthium(exchange: Exchange, skippedProperties?: object): Promise<boolean>;
export default testDeluthium;
