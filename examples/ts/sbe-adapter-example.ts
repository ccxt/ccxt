/**
 * SBE Adapter Usage Example
 *
 * This example demonstrates how to use the generic SBE adapter with different exchanges
 */

import {parseSbeSchema, createSbeDecoder, decodeSbeOrderbook, applyExponent} from '../../ts/src/base/functions/sbe.js';
import * as path from 'path';

console.log('=== SBE Adapter Example ===\n');

// Example 1: Parse OKX schema
console.log('1. Parsing OKX SBE Schema...');
const okxSchemaPath = path.join(process.cwd(), 'sbe', 'okx', 'okx_sbe_1_0.xml');
try {
    const okxSchema = parseSbeSchema(okxSchemaPath);
    console.log(`   Package: ${okxSchema.package}`);
    console.log(`   Schema ID: ${okxSchema.id}`);
    console.log(`   Byte Order: ${okxSchema.byteOrder}`);
    console.log(`   Messages: ${okxSchema.messages.size}`);

    // List available messages
    console.log('   Available Messages:');
    for (const [id, message] of okxSchema.messages) {
        console.log(`     - ${message.name} (ID: ${id})`);
    }
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

console.log('\n2. Parsing Binance SBE Schema...');
const binanceSchemaPath = path.join(process.cwd(), 'sbe', 'binance', 'spot_3_0.xml');
try {
    const binanceSchema = parseSbeSchema(binanceSchemaPath);
    console.log(`   Package: ${binanceSchema.package}`);
    console.log(`   Schema ID: ${binanceSchema.id}`);
    console.log(`   Byte Order: ${binanceSchema.byteOrder}`);
    console.log(`   Messages: ${binanceSchema.messages.size}`);
} catch (error) {
    console.log(`   Error: ${error.message}`);
}

// Example 2: Create a decoder and decode a mock message
console.log('\n3. Decoding a Mock OKX Orderbook Message...');
try {
    const okxSchema = parseSbeSchema(okxSchemaPath);
    const decoder = createSbeDecoder(okxSchema);

    // Create a mock message (this would normally come from the exchange)
    const mockMessage = createMockOkxOrderbook();

    // Decode using low-level decoder
    const decoded = decoder.decode(mockMessage);

    console.log(`   Message: ${decoded.messageName} (ID: ${decoded.messageId})`);
    console.log(`   Instrument ID Code: ${decoded.instIdCode}`);
    console.log(`   Timestamp (microseconds): ${decoded.tsUs}`);
    console.log(`   Price Exponent: ${decoded.pxExponent}`);
    console.log(`   Size Exponent: ${decoded.szExponent}`);
    console.log(`   Asks: ${decoded.asks.length} levels`);
    console.log(`   Bids: ${decoded.bids.length} levels`);

    // Example 3: Use convenience function for orderbook
    console.log('\n4. Using decodeSbeOrderbook Convenience Function...');
    const orderbook = decodeSbeOrderbook(mockMessage, okxSchema);

    console.log(`   Timestamp: ${orderbook.timestamp}ms`);
    console.log(`   Asks: ${orderbook.asks.length} levels`);
    console.log(`   Bids: ${orderbook.bids.length} levels`);

    if (orderbook.asks.length > 0) {
        const [price, amount, ordCount] = orderbook.asks[0];
        console.log(`   Top Ask: Price=${price}, Amount=${amount}, Orders=${ordCount}`);
    }

    if (orderbook.bids.length > 0) {
        const [price, amount, ordCount] = orderbook.bids[0];
        console.log(`   Top Bid: Price=${price}, Amount=${amount}, Orders=${ordCount}`);
    }

    // Example 4: Demonstrate exponent conversion
    console.log('\n5. Exponent Conversion Example...');
    const mantissa = BigInt(5000000);
    const exponent = -2;
    const result = applyExponent(mantissa, exponent);
    console.log(`   Mantissa: ${mantissa}`);
    console.log(`   Exponent: ${exponent}`);
    console.log(`   Result: ${result} (expected: 50000.00)`);

} catch (error) {
    console.log(`   Error: ${error.message}`);
    console.log(error.stack);
}

console.log('\n=== End of Example ===');

/**
 * Helper function to create a mock OKX orderbook message
 * In production, this binary data would come from the exchange's API
 */
function createMockOkxOrderbook (): ArrayBuffer {
    const buffer = new ArrayBuffer(82);
    const view = new DataView(buffer);
    let offset = 0;

    // Message Header (8 bytes)
    view.setUint16(offset, 26, true); offset += 2;    // blockLength
    view.setUint16(offset, 1006, true); offset += 2;  // templateId (SnapshotDepthResponseEvent)
    view.setUint16(offset, 1, true); offset += 2;     // schemaId
    view.setUint16(offset, 0, true); offset += 2;     // version

    // Message Fields (26 bytes)
    view.setBigInt64(offset, BigInt(12345), true); offset += 8;  // instIdCode
    view.setBigInt64(offset, BigInt(1700000000000000), true); offset += 8;  // tsUs (microseconds)
    view.setBigInt64(offset, BigInt(100), true); offset += 8;    // seqId
    view.setInt8(offset, -2); offset += 1;  // pxExponent (price has 2 decimals)
    view.setInt8(offset, -3); offset += 1;  // szExponent (size has 3 decimals)

    // Asks Group (1 level)
    view.setUint16(offset, 20, true); offset += 2;  // blockLength
    view.setUint16(offset, 1, true); offset += 2;   // numInGroup (1 ask)
    view.setBigInt64(offset, BigInt(5000000), true); offset += 8;  // pxMantissa (50000.00 when converted)
    view.setBigInt64(offset, BigInt(1500000), true); offset += 8;  // szMantissa (1500.000 when converted)
    view.setInt32(offset, 5, true); offset += 4;    // ordCount

    // Bids Group (1 level)
    view.setUint16(offset, 20, true); offset += 2;  // blockLength
    view.setUint16(offset, 1, true); offset += 2;   // numInGroup (1 bid)
    view.setBigInt64(offset, BigInt(4999900), true); offset += 8;  // pxMantissa (49999.00 when converted)
    view.setBigInt64(offset, BigInt(2000000), true); offset += 8;  // szMantissa (2000.000 when converted)
    view.setInt32(offset, 10, true); offset += 4;   // ordCount

    return buffer;
}
