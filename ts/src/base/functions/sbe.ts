/**
 * SBE (Simple Binary Encoding) utilities
 *
 * This module provides utilities for working with SBE schemas and decoding binary messages.
 * SBE is a high-performance binary encoding used by some exchanges (OKX, Binance) for
 * low-latency market data.
 */

import { readFileSync } from 'fs';

interface SbeSchema {
    package: string;
    id: number;
    byteOrder: 'littleEndian' | 'bigEndian';
    messages: Map<number, SbeMessage>;
    types: Map<string, SbeType>;
}

interface SbeMessage {
    id: number;
    name: string;
    fields: SbeField[];
    groups: SbeGroup[];
}

interface SbeField {
    name: string;
    type: string;
    offset: number;
    size: number;
}

interface SbeGroup {
    name: string;
    dimensionType: string;
    fields: SbeField[];
}

interface SbeType {
    primitiveType: string;
    length?: number;
}

/**
 * Parse an SBE XML schema file
 * This is a minimal parser that extracts the essential information for decoding
 */
export function parseSbeSchema (schemaPath: string): SbeSchema {
    const xml = readFileSync(schemaPath, 'utf-8');

    // Extract schema ID and byte order from root element
    const schemaMatch = xml.match(/<sbe:messageSchema[^>]*\sid="(\d+)"[^>]*\sbyteOrder="(\w+)"/);
    const packageMatch = xml.match(/package="([^"]+)"/);

    if (!schemaMatch || !packageMatch) {
        throw new Error('Invalid SBE schema format');
    }

    const schema: SbeSchema = {
        package: packageMatch[1],
        id: parseInt(schemaMatch[1]),
        byteOrder: schemaMatch[2] as 'littleEndian' | 'bigEndian',
        messages: new Map(),
        types: new Map(),
    };

    // Parse primitive types
    const typeRegex = /<type\s+name="([^"]+)"\s+primitiveType="([^"]+)"(?:\s+length="(\d+)")?\s*\/>/g;
    let typeMatch;
    while ((typeMatch = typeRegex.exec(xml)) !== null) {
        const [, name, primitiveType, length] = typeMatch;
        schema.types.set(name, {
            primitiveType,
            length: length ? parseInt(length) : undefined,
        });
    }

    // Parse messages - simplified extraction
    const messageRegex = /<sbe:message\s+name="([^"]+)"\s+id="(\d+)"[^>]*>([\s\S]*?)<\/sbe:message>/g;
    let messageMatch;

    while ((messageMatch = messageRegex.exec(xml)) !== null) {
        const [, name, id, content] = messageMatch;
        const messageId = parseInt(id);

        const message: SbeMessage = {
            id: messageId,
            name,
            fields: [],
            groups: [],
        };

        // Parse fields
        const fieldRegex = /<field\s+id="\d+"\s+name="([^"]+)"\s+type="([^"]+)"/g;
        let fieldMatch;
        let offset = 0;

        while ((fieldMatch = fieldRegex.exec(content)) !== null) {
            const [, fieldName, fieldType] = fieldMatch;
            const size = getTypeSize(fieldType, schema);
            message.fields.push({
                name: fieldName,
                type: fieldType,
                offset,
                size,
            });
            offset += size;
        }

        // Parse groups (dimensionType is optional in some schemas like Binance)
        const groupRegex = /<group\s+id="\d+"\s+name="([^"]+)"(?:\s+dimensionType="([^"]+)")?[^>]*>([\s\S]*?)<\/group>/g;
        let groupMatch;

        while ((groupMatch = groupRegex.exec(content)) !== null) {
            const [, groupName, dimensionType, groupContent] = groupMatch;
            const group: SbeGroup = {
                name: groupName,
                dimensionType: dimensionType || 'groupSizeEncoding',  // Default dimension type
                fields: [],
            };

            // Create a fresh regex for group fields (fieldRegex is stateful due to /g flag)
            const groupFieldRegex = /<field\s+id="\d+"\s+name="([^"]+)"\s+type="([^"]+)"/g;
            let groupFieldMatch;
            let groupFieldOffset = 0;
            while ((groupFieldMatch = groupFieldRegex.exec(groupContent)) !== null) {
                const [, fieldName, fieldType] = groupFieldMatch;
                const fieldSize = getTypeSize(fieldType, schema);
                group.fields.push({
                    name: fieldName,
                    type: fieldType,
                    offset: groupFieldOffset,
                    size: fieldSize,
                });
                groupFieldOffset += fieldSize;
            }

            message.groups.push(group);
        }

        schema.messages.set(messageId, message);
    }

    return schema;
}

function getTypeSize (type: string, schema: SbeSchema): number {
    const primitiveSize: Record<string, number> = {
        'int8': 1,
        'uint8': 1,
        'int16': 2,
        'uint16': 2,
        'int32': 4,
        'uint32': 4,
        'int64': 8,
        'uint64': 8,
    };

    if (primitiveSize[type]) {
        return primitiveSize[type];
    }

    const customType = schema.types.get(type);
    if (customType) {
        return getTypeSize(customType.primitiveType, schema);
    }

    return 0;
}

/**
 * Create an SBE decoder for a given schema
 */
export function createSbeDecoder (schema: SbeSchema) {
    const littleEndian = schema.byteOrder === 'littleEndian';

    return {
        /**
         * Decode an SBE message
         */
        decode: (buffer: ArrayBuffer): any => {
            const view = new DataView(buffer);
            let offset = 0;

            // Read message header
            const blockLength = view.getUint16(offset, littleEndian);
            offset += 2;
            const templateId = view.getUint16(offset, littleEndian);
            offset += 2;
            const schemaId = view.getUint16(offset, littleEndian);
            offset += 2;
            const version = view.getUint16(offset, littleEndian);
            offset += 2;

            console.log('SBE Header:', { blockLength, templateId, schemaId, version });
            console.log('Available template IDs:', Array.from(schema.messages.keys()));

            const message = schema.messages.get(templateId);
            if (!message) {
                throw new Error(`Unknown message template ID: ${templateId}`);
            }

            const result: any = {
                messageId: templateId,
                messageName: message.name,
            };

            // Save the start of the message body
            const messageBodyStart = offset;

            // Decode fields
            for (const field of message.fields) {
                const value = decodeField(view, offset, field.type, littleEndian, schema);
                result[field.name] = value;
                offset += field.size;
            }

            // Skip to the end of the fixed block using blockLength from header
            // This ensures we're at the correct position for repeating groups
            offset = messageBodyStart + blockLength;

            // Decode groups
            for (const group of message.groups) {
                const groupBlockLength = view.getUint16(offset, littleEndian);
                offset += 2;
                const numInGroup = view.getUint16(offset, littleEndian);
                offset += 2;

                console.log(`Group "${group.name}": blockLength=${groupBlockLength}, numInGroup=${numInGroup}`);

                const groupItems = [];
                for (let i = 0; i < numInGroup; i++) {
                    const itemStart = offset;
                    const item: any = {};
                    for (const field of group.fields) {
                        // Read field at its offset within the item
                        const fieldOffset = itemStart + field.offset;
                        const value = decodeField(view, fieldOffset, field.type, littleEndian, schema);
                        item[field.name] = value;
                    }
                    // Skip to next item using groupBlockLength from the header
                    // This ensures we handle padding correctly
                    offset = itemStart + groupBlockLength;
                    groupItems.push(item);
                }

                result[group.name] = groupItems;
            }

            return result;
        },
    };
}

function decodeField (view: DataView, offset: number, type: string, littleEndian: boolean, schema: SbeSchema): any {
    switch (type) {
        case 'int8':
            return view.getInt8(offset);
        case 'uint8':
            return view.getUint8(offset);
        case 'int16':
            return view.getInt16(offset, littleEndian);
        case 'uint16':
            return view.getUint16(offset, littleEndian);
        case 'int32':
            return view.getInt32(offset, littleEndian);
        case 'uint32':
            return view.getUint32(offset, littleEndian);
        case 'int64':
            return Number(view.getBigInt64(offset, littleEndian));
        case 'uint64':
            return Number(view.getBigUint64(offset, littleEndian));
        default:
            // Check if it's a custom type
            const customType = schema.types.get(type);
            if (customType) {
                return decodeField(view, offset, customType.primitiveType, littleEndian, schema);
            }
            return 0;
    }
}

/**
 * Convert mantissa and exponent to decimal number
 * Used by exchanges that encode prices/amounts as mantissa * 10^exponent
 */
export function applyExponent (mantissa: number | bigint, exponent: number): number {
    const mantissaNum = typeof mantissa === 'bigint' ? Number(mantissa) : mantissa;
    return mantissaNum * Math.pow(10, exponent);
}

/**
 * Decode an orderbook from SBE binary data
 * This is a convenience function that handles the common orderbook format
 */
export function decodeSbeOrderbook (buffer: ArrayBuffer, schema: SbeSchema): any {
    const decoder = createSbeDecoder(schema);
    const decoded = decoder.decode(buffer);

    const result: any = {
        bids: [],
        asks: [],
        timestamp: undefined,
    };

    // Extract timestamp
    if (decoded.tsUs) {
        result.timestamp = Math.floor(decoded.tsUs / 1000); // microseconds to milliseconds
    } else if (decoded.timestamp) {
        result.timestamp = decoded.timestamp;
    }

    // Get exponents
    const pxExponent = decoded.pxExponent || 0;
    const szExponent = decoded.szExponent || 0;

    // Convert asks
    if (decoded.asks && Array.isArray(decoded.asks)) {
        result.asks = decoded.asks.map((ask: any) => {
            const price = applyExponent(ask.pxMantissa || ask.price, pxExponent);
            const size = applyExponent(ask.szMantissa || ask.size, szExponent);
            const ordCount = ask.ordCount || 0;
            return [price, size, ordCount];
        });
    }

    // Convert bids
    if (decoded.bids && Array.isArray(decoded.bids)) {
        result.bids = decoded.bids.map((bid: any) => {
            const price = applyExponent(bid.pxMantissa || bid.price, pxExponent);
            const size = applyExponent(bid.szMantissa || bid.size, szExponent);
            const ordCount = bid.ordCount || 0;
            return [price, size, ordCount];
        });
    }

    // Include other fields
    Object.assign(result, decoded);

    return result;
}
