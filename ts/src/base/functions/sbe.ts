/**
 * SBE (Simple Binary Encoding) utilities
 *
 * This module provides utilities for working with SBE schemas and decoding binary messages.
 * SBE is a high-performance binary encoding used by some exchanges (OKX, Binance) for
 * low-latency market data.
 *
 * Supports both SBE versions:
 * - SBE 1.0 (2016 namespace): 8-byte header, 2-field group dimensions
 * - SBE 2.0 (2017+ namespace): 12-byte header, 4-field group dimensions
 *
 * Version is auto-detected from the XML namespace in the schema.
 */

import { XMLParser } from './xml.js';

interface SbeSchema {
    package: string;
    id: number;
    byteOrder: 'littleEndian' | 'bigEndian';
    messages: Map<number, SbeMessage>;
    types: Map<string, SbeType>;
    composites: Map<string, SbeComposite>;
    sbeVersion: 1 | 2;  // 1 = SBE 1.0 (2016), 2 = SBE 2.0 (2017+)
}

interface SbeMessage {
    id: number;
    name: string;
    fields: SbeField[];
    groups: SbeGroup[];
    data: SbeDataField[];
}

interface SbeField {
    name: string;
    type: string;
    offset: number;
    size: number;
}

interface SbeDataField {
    name: string;
    type: string;  // varString8, varString16, messageData, etc.
}

interface SbeGroup {
    name: string;
    dimensionType: string;
    fields: SbeField[];
    groups: SbeGroup[];  // Support nested groups
    data: SbeDataField[];  // Support data fields within groups
}

interface SbeType {
    primitiveType: string;
    length?: number;
}

interface SbeComposite {
    name: string;
    elements: Array<{
        name: string;
        type: string;
        primitiveType?: string;
        size: number;
    }>;
}

/**
 * Parse an SBE XML schema from XML content
 * This is a minimal parser that extracts the essential information for decoding
 * @param xml - The XML schema content as a string
 */
export function parseSbeSchema (xml: string): SbeSchema {

    // Detect SBE version from XML namespace
    const namespaceMatch = xml.match(/xmlns:sbe="http:\/\/fixprotocol\.io\/(\d+)\/sbe"/);
    const namespaceYear = namespaceMatch ? parseInt(namespaceMatch[1]) : 2016;
    const sbeVersion: 1 | 2 = namespaceYear >= 2017 ? 2 : 1;

    // Configure XML parser
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseAttributeValue: true,
        isArray: (tagName: string) => {
            // These tags should always be arrays even if there's only one
            return ['type', 'field', 'group', 'data', 'composite'].includes(tagName);
        },
    });

    const parsed = parser.parse(xml);
    const messageSchema = parsed['sbe:messageSchema'];

    if (!messageSchema) {
        throw new Error('Invalid SBE schema format');
    }

    const schema: SbeSchema = {
        package: messageSchema['@_package'],
        id: messageSchema['@_id'],
        byteOrder: messageSchema['@_byteOrder'],
        messages: new Map(),
        types: new Map(),
        composites: new Map(),
        sbeVersion,
    };

    // Parse types
    if (messageSchema.types && messageSchema.types.type) {
        for (const type of messageSchema.types.type) {
            if (type['@_name'] && type['@_primitiveType']) {
                schema.types.set(type['@_name'], {
                    primitiveType: type['@_primitiveType'],
                    length: type['@_length'],
                });
            }
        }
    }

    // Parse composites
    if (messageSchema.types && messageSchema.types.composite) {
        for (const composite of messageSchema.types.composite) {
            const name = composite['@_name'];
            const elements: Array<{name: string; type: string; primitiveType?: string; size: number}> = [];

            if (composite.type) {
                for (const elem of composite.type) {
                    const elemName = elem['@_name'];
                    const primType = elem['@_primitiveType'];
                    const length = elem['@_length'] || 1;
                    elements.push({
                        name: elemName,
                        type: primType,
                        primitiveType: primType,
                        size: getTypeSize(primType, schema) * length,
                    });
                }
            }

            if (elements.length > 0) {
                schema.composites.set(name, { name, elements });
            }
        }
    }

    // Parse messages
    if (messageSchema['sbe:message']) {
        const messages = Array.isArray(messageSchema['sbe:message'])
            ? messageSchema['sbe:message']
            : [messageSchema['sbe:message']];

        for (const msg of messages) {
            const messageId = msg['@_id'];
            const message: SbeMessage = {
                id: messageId,
                name: msg['@_name'],
                fields: [],
                groups: [],
                data: [],
            };

            // Parse fields
            if (msg.field) {
                let offset = 0;
                const fields = Array.isArray(msg.field) ? msg.field : [msg.field];
                for (const field of fields) {
                    const size = getTypeSize(field['@_type'], schema);
                    message.fields.push({
                        name: field['@_name'],
                        type: field['@_type'],
                        offset,
                        size,
                    });
                    offset += size;
                }
            }

            // Parse groups (handles nested groups)
            if (msg.group) {
                message.groups = parseGroupsFromXmlObject(msg.group, schema);
            }

            // Parse data fields
            if (msg.data) {
                const dataFields = Array.isArray(msg.data) ? msg.data : [msg.data];
                for (const data of dataFields) {
                    message.data.push({
                        name: data['@_name'],
                        type: data['@_type'],
                    });
                }
            }

            schema.messages.set(messageId, message);
        }
    }

    return schema;
}

/**
 * Parse groups recursively from parsed XML object
 */
function parseGroupsFromXmlObject(groupObj: any, schema: SbeSchema): SbeGroup[] {
    const groups: SbeGroup[] = [];
    const groupArray = Array.isArray(groupObj) ? groupObj : [groupObj];

    for (const grp of groupArray) {
        const group: SbeGroup = {
            name: grp['@_name'],
            dimensionType: grp['@_dimensionType'] || 'groupSizeEncoding',
            fields: [],
            groups: [],
            data: [],
        };

        // Parse fields in this group
        if (grp.field) {
            let offset = 0;
            const fields = Array.isArray(grp.field) ? grp.field : [grp.field];
            for (const field of fields) {
                const size = getTypeSize(field['@_type'], schema);
                group.fields.push({
                    name: field['@_name'],
                    type: field['@_type'],
                    offset,
                    size,
                });
                offset += size;
            }
        }

        // Parse nested groups recursively
        if (grp.group) {
            group.groups = parseGroupsFromXmlObject(grp.group, schema);
        }

        // Parse data fields in this group
        if (grp.data) {
            const dataFields = Array.isArray(grp.data) ? grp.data : [grp.data];
            for (const data of dataFields) {
                group.data.push({
                    name: data['@_name'],
                    type: data['@_type'],
                });
            }
        }

        groups.push(group);
    }

    return groups;
}

function getTypeSize (type: string, schema: SbeSchema): number {
    const primitiveSize: Record<string, number> = {
        'char': 1,      // section 2.6.1
        'int8': 1,
        'uint8': 1,
        'int16': 2,
        'uint16': 2,
        'int32': 4,
        'uint32': 4,
        'int64': 8,
        'uint64': 8,
        'float': 4,     // section 2.5 - IEEE 754 binary32
        'double': 8,    // section 2.5 - IEEE 754 binary64
    };

    if (primitiveSize[type]) {
        return primitiveSize[type];
    }

    const customType = schema.types.get(type);
    if (customType) {
        // If type has a length attribute (for arrays), multiply by length
        const length = customType.length || 1;
        return getTypeSize(customType.primitiveType, schema) * length;
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

            // Read message header based on SBE version
            // SBE 1.0 (2016): 4 fields (8 bytes) - blockLength, templateId, schemaId, version
            // SBE 2.0 (2017+): 6 fields (12 bytes) - adds numGroups, numVarDataFields
            const blockLength = view.getUint16(offset, littleEndian);
            offset += 2;
            const templateId = view.getUint16(offset, littleEndian);
            offset += 2;
            const schemaId = view.getUint16(offset, littleEndian);
            offset += 2;
            const version = view.getUint16(offset, littleEndian);
            offset += 2;


            let numGroups = 0;
            let numVarDataFields = 0;
            if (schema.sbeVersion === 2) {
                numGroups = view.getUint16(offset, littleEndian);
                offset += 2;
                numVarDataFields = view.getUint16(offset, littleEndian);
                offset += 2;
            }

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


            // Only decode fields if blockLength > 0
            // When blockLength is 0, all data is in repeating groups and variable-length fields
            if (blockLength > 0) {
                // Decode fields using their offsets relative to message start
                // This matches SBE spec where field offsets are relative to block start
                for (const field of message.fields) {
                    const fieldOffset = messageBodyStart + field.offset;
                    try {
                        const value = decodeField(view, fieldOffset, field.type, littleEndian, schema);
                        result[field.name] = value;
                    } catch (e) {
                        const errorMsg = e instanceof Error ? e.message : String(e);
                        throw new Error(`Error decoding field ${field.name} (type: ${field.type}) at offset ${fieldOffset}: ${errorMsg}`);
                    }
                }
            }

            // Skip to the end of the fixed block using blockLength from header
            // This ensures we're at the correct position for repeating groups
            offset = messageBodyStart + blockLength;

            // Decode groups recursively
            const decodeResult = decodeGroups(view, offset, message.groups, littleEndian, schema, buffer);
            Object.assign(result, decodeResult.result);
            offset = decodeResult.offset;

            // Decode variable-length data fields
            for (const dataField of message.data) {
                // Read length prefix according to SBE spec section 2.7
                // Length can be uint8, uint16, or uint32
                // Check composite type to determine size
                let length: number;
                const varComposite = schema.composites.get(dataField.type);
                if (varComposite) {
                    const lengthElem = varComposite.elements.find(e => e.name === 'length');
                    if (lengthElem) {
                        if (lengthElem.primitiveType === 'uint32') {
                            length = view.getUint32(offset, littleEndian);
                            offset += 4;
                        } else if (lengthElem.primitiveType === 'uint16') {
                            length = view.getUint16(offset, littleEndian);
                            offset += 2;
                        } else if (lengthElem.primitiveType === 'uint8') {
                            length = view.getUint8(offset);
                            offset += 1;
                        } else {
                            // Default to uint16
                            length = view.getUint16(offset, littleEndian);
                            offset += 2;
                        }
                    } else {
                        // No length element found, default to uint16
                        length = view.getUint16(offset, littleEndian);
                        offset += 2;
                    }
                } else {
                    // Fallback for unknown types - try to infer from name
                    if (dataField.type.includes('8')) {
                        length = view.getUint8(offset);
                        offset += 1;
                    } else {
                        length = view.getUint16(offset, littleEndian);
                        offset += 2;
                    }
                }

                // Extract the data
                if (dataField.type.includes('String')) {
                    // Decode as UTF-8 string
                    const dataBytes = new Uint8Array(buffer, offset, length);
                    const decoder = new TextDecoder('utf-8');
                    result[dataField.name] = decoder.decode(dataBytes);
                } else if (dataField.type === 'messageData') {
                    // Return as ArrayBuffer for nested message decoding
                    result[dataField.name] = buffer.slice(offset, offset + length);
                } else {
                    // Return as Uint8Array for binary data
                    result[dataField.name] = new Uint8Array(buffer, offset, length);
                }
                offset += length;
            }

            return result;
        },
    };
}

/**
 * Recursively decode groups and return both the decoded result and new offset
 */
function decodeGroups(view: DataView, startOffset: number, groups: SbeGroup[], littleEndian: boolean, schema: SbeSchema, buffer: ArrayBuffer): { result: any; offset: number } {
    const result: any = {};
    let offset = startOffset;

    for (const group of groups) {
        // Check if offset is within bounds before reading dimensions
        if (offset + 4 > buffer.byteLength) {
            // No more groups to read - this is normal at end of buffer
            break;
        }

        // Read group dimensions
        const groupBlockLength = view.getUint16(offset, littleEndian);
        offset += 2;

        // Read numInGroup according to dimensionType
        let numInGroup: number;
        const dimensionComposite = schema.composites.get(group.dimensionType);
        if (dimensionComposite) {
            const numInGroupElem = dimensionComposite.elements.find(e => e.name === 'numInGroup');
            if (numInGroupElem) {
                if (numInGroupElem.primitiveType === 'uint32') {
                    numInGroup = view.getUint32(offset, littleEndian);
                    offset += 4;
                } else if (numInGroupElem.primitiveType === 'uint16') {
                    numInGroup = view.getUint16(offset, littleEndian);
                    offset += 2;
                } else if (numInGroupElem.primitiveType === 'uint8') {
                    numInGroup = view.getUint8(offset);
                    offset += 1;
                } else {
                    numInGroup = view.getUint16(offset, littleEndian);
                    offset += 2;
                }
            } else {
                numInGroup = view.getUint16(offset, littleEndian);
                offset += 2;
            }
        } else {
            numInGroup = view.getUint16(offset, littleEndian);
            offset += 2;
        }

        // Validate numInGroup is reasonable (sanity check to catch corruption)
        if (numInGroup > 1000000) {
            throw new Error(`Invalid numInGroup value: ${numInGroup} for group ${group.name}. This likely indicates corrupted data or incorrect schema.`);
        }

        // SBE 2.0: Read numGroups and numVarDataFields
        if (schema.sbeVersion === 2) {
            offset += 2; // numGroups
            offset += 2; // numVarDataFields
        }

        const groupItems = [];
        for (let i = 0; i < numInGroup; i++) {
            const itemStart = offset;
            const item: any = {};

            // Check we have enough space for this group item
            if (itemStart + groupBlockLength > buffer.byteLength) {
                throw new Error(`Buffer overflow: Group ${group.name} item ${i} would read past buffer end.`);
            }

            // Decode fixed fields in this group item (only read from fixed block)
            for (const field of group.fields) {
                const fieldOffset = itemStart + field.offset;
                const value = decodeField(view, fieldOffset, field.type, littleEndian, schema);
                item[field.name] = value;
            }

            // Move offset to end of fixed fields block
            offset = itemStart + groupBlockLength;

            // Now decode nested groups (they come AFTER fixed fields)
            if (group.groups && group.groups.length > 0) {
                const nestedResult = decodeGroups(view, offset, group.groups, littleEndian, schema, buffer);
                Object.assign(item, nestedResult.result);
                offset = nestedResult.offset;
            }

            // Finally decode var data fields (they come AFTER nested groups)
            if (group.data && group.data.length > 0) {
                for (const dataField of group.data) {
                    // Check bounds before reading length
                    if (offset + 1 > buffer.byteLength) {
                        throw new Error(`Buffer overflow: Cannot read length for var data field ${dataField.name}`);
                    }

                    // Read length prefix
                    let length: number;
                    const varComposite = schema.composites.get(dataField.type);
                    if (varComposite) {
                        const lengthElem = varComposite.elements.find(e => e.name === 'length');
                        if (lengthElem) {
                            if (lengthElem.primitiveType === 'uint32') {
                                length = view.getUint32(offset, littleEndian);
                                offset += 4;
                            } else if (lengthElem.primitiveType === 'uint16') {
                                length = view.getUint16(offset, littleEndian);
                                offset += 2;
                            } else if (lengthElem.primitiveType === 'uint8') {
                                length = view.getUint8(offset);
                                offset += 1;
                            } else {
                                length = view.getUint16(offset, littleEndian);
                                offset += 2;
                            }
                        } else {
                            length = view.getUint16(offset, littleEndian);
                            offset += 2;
                        }
                    } else {
                        if (dataField.type.includes('8')) {
                            length = view.getUint8(offset);
                            offset += 1;
                        } else {
                            length = view.getUint16(offset, littleEndian);
                            offset += 2;
                        }
                    }

                    // Check bounds before reading data
                    if (offset + length > buffer.byteLength) {
                        throw new Error(`Buffer overflow: Var data field ${dataField.name} would read past buffer end.`);
                    }

                    // Extract data
                    if (dataField.type.includes('String')) {
                        const dataBytes = new Uint8Array(buffer, offset, length);
                        const decoder = new TextDecoder('utf-8');
                        item[dataField.name] = decoder.decode(dataBytes);
                    } else if (dataField.type === 'messageData') {
                        item[dataField.name] = buffer.slice(offset, offset + length);
                    } else {
                        item[dataField.name] = new Uint8Array(buffer, offset, length);
                    }
                    offset += length;
                }
            }

            groupItems.push(item);
        }

        result[group.name] = groupItems;
    }

    return { result, offset };
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
        case 'float':
            // IEEE 754-2008 binary32 single precision (section 2.5)
            return view.getFloat32(offset, littleEndian);
        case 'double':
            // IEEE 754-2008 binary64 double precision (section 2.5)
            return view.getFloat64(offset, littleEndian);
        case 'char':
            // Single-byte character (section 2.6.1)
            return String.fromCharCode(view.getUint8(offset));
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
 * Convert mantissa128 byte array to number
 * mantissa128 is a signed 128-bit integer encoded as a little-endian byte array
 * Used by Binance SBE for large volume values
 */
export function mantissa128ToNumber (bytes: Uint8Array | number[]): number {
    if (!bytes || bytes.length === 0) {
        return 0;
    }
    // Convert to Uint8Array if it's a regular array
    const byteArray = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

    // For mantissa128, we need to handle signed 128-bit integers
    // The value −2^127 is nullValue by default
    // For practical purposes, we'll read up to 8 bytes (64-bit) as most values fit
    // If you need full 128-bit precision, consider using BigInt

    let result = 0;
    let multiplier = 1;

    // Read up to 8 bytes (64-bit safe range for JavaScript numbers)
    const limit = Math.min(byteArray.length, 8);
    for (let i = 0; i < limit; i++) {
        result += byteArray[i] * multiplier;
        multiplier *= 256;
    }

    // Check if this is a negative number (bit 7 of the last byte we read)
    // For simplicity, we assume values fit in the positive range for volumes
    // If negative handling is needed, check the sign bit and apply two's complement

    return result;
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
