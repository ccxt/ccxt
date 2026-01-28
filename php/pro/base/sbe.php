<?php

namespace ccxt\pro;

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

/**
 * Parse an SBE XML schema file
 * This is a minimal parser that extracts the essential information for decoding
 */
function parseSbeSchema($schemaPath) {
    $xml = file_get_contents($schemaPath);
    if ($xml === false) {
        throw new \Exception('Failed to read SBE schema file: ' . $schemaPath);
    }

    // Detect SBE version from XML namespace
    $namespaceMatch = array();
    if (preg_match('/xmlns:sbe="http:\/\/fixprotocol\.io\/(\d+)\/sbe"/', $xml, $namespaceMatch)) {
        $namespaceYear = intval($namespaceMatch[1]);
    } else {
        $namespaceYear = 2016;
    }
    $sbeVersion = $namespaceYear >= 2017 ? 2 : 1;

    // Parse XML using SimpleXML
    libxml_use_internal_errors(true);
    $xmlObj = simplexml_load_string($xml);
    if ($xmlObj === false) {
        $errors = libxml_get_errors();
        libxml_clear_errors();
        throw new \Exception('Failed to parse SBE schema XML: ' . print_r($errors, true));
    }

    // Register namespaces
    $xmlObj->registerXPathNamespace('sbe', $xmlObj->getNamespaces(true)['sbe'] ?? 'http://fixprotocol.io/2016/sbe');

    $schema = array(
        'package' => (string)$xmlObj['package'],
        'id' => intval($xmlObj['id']),
        'byteOrder' => (string)$xmlObj['byteOrder'],
        'messages' => array(),
        'types' => array(),
        'composites' => array(),
        'sbeVersion' => $sbeVersion,
    );

    // Parse types
    $types = $xmlObj->xpath('//sbe:types/sbe:type');
    if ($types !== false) {
        foreach ($types as $type) {
            $name = (string)$type['name'];
            $primitiveType = (string)$type['primitiveType'];
            if ($name && $primitiveType) {
                $schema['types'][$name] = array(
                    'primitiveType' => $primitiveType,
                    'length' => isset($type['length']) ? intval($type['length']) : null,
                );
            }
        }
    }

    // Parse composites
    $composites = $xmlObj->xpath('//sbe:types/sbe:composite');
    if ($composites !== false) {
        foreach ($composites as $composite) {
            $name = (string)$composite['name'];
            $elements = array();
            $typeElements = $composite->xpath('.//sbe:type');
            if ($typeElements !== false) {
                foreach ($typeElements as $elem) {
                    $elemName = (string)$elem['name'];
                    $primType = (string)$elem['primitiveType'];
                    $length = isset($elem['length']) ? intval($elem['length']) : 1;
                    $elements[] = array(
                        'name' => $elemName,
                        'type' => $primType,
                        'primitiveType' => $primType,
                        'size' => getTypeSize($primType, $schema) * $length,
                    );
                }
            }
            if (count($elements) > 0) {
                $schema['composites'][$name] = array('name' => $name, 'elements' => $elements);
            }
        }
    }

    // Parse messages
    $messages = $xmlObj->xpath('//sbe:message');
    if ($messages !== false) {
        foreach ($messages as $msg) {
            $messageId = intval($msg['id']);
            $message = array(
                'id' => $messageId,
                'name' => (string)$msg['name'],
                'fields' => array(),
                'groups' => array(),
                'data' => array(),
            );

            // Parse fields
            $fields = $msg->xpath('.//sbe:field[not(ancestor::sbe:group)]');
            if ($fields !== false) {
                $offset = 0;
                foreach ($fields as $field) {
                    $type = (string)$field['type'];
                    $size = getTypeSize($type, $schema);
                    $message['fields'][] = array(
                        'name' => (string)$field['name'],
                        'type' => $type,
                        'offset' => $offset,
                        'size' => $size,
                    );
                    $offset += $size;
                }
            }

            // Parse groups (handles nested groups)
            $groups = $msg->xpath('.//sbe:group[not(ancestor::sbe:group)]');
            if ($groups !== false) {
                $message['groups'] = parseGroupsFromXml($groups, $schema);
            }

            // Parse data fields
            $dataFields = $msg->xpath('.//sbe:data[not(ancestor::sbe:group)]');
            if ($dataFields !== false) {
                foreach ($dataFields as $data) {
                    $message['data'][] = array(
                        'name' => (string)$data['name'],
                        'type' => (string)$data['type'],
                    );
                }
            }

            $schema['messages'][$messageId] = $message;
        }
    }

    return $schema;
}

/**
 * Parse groups recursively from XML
 */
function parseGroupsFromXml($groupObjs, $schema) {
    $groups = array();
    foreach ($groupObjs as $grp) {
        $group = array(
            'name' => (string)$grp['name'],
            'dimensionType' => isset($grp['dimensionType']) ? (string)$grp['dimensionType'] : 'groupSizeEncoding',
            'fields' => array(),
            'groups' => array(),
            'data' => array(),
        );

        // Parse fields in this group
        $fields = $grp->xpath('.//sbe:field[not(ancestor::sbe:group)]');
        if ($fields !== false) {
            $offset = 0;
            foreach ($fields as $field) {
                $type = (string)$field['type'];
                $size = getTypeSize($type, $schema);
                $group['fields'][] = array(
                    'name' => (string)$field['name'],
                    'type' => $type,
                    'offset' => $offset,
                    'size' => $size,
                );
                $offset += $size;
            }
        }

        // Parse nested groups recursively
        $nestedGroups = $grp->xpath('.//sbe:group[not(ancestor::sbe:group[ancestor::sbe:group])]');
        if ($nestedGroups !== false && count($nestedGroups) > 0) {
            $group['groups'] = parseGroupsFromXml($nestedGroups, $schema);
        }

        // Parse data fields in this group
        $dataFields = $grp->xpath('.//sbe:data[not(ancestor::sbe:group)]');
        if ($dataFields !== false) {
            foreach ($dataFields as $data) {
                $group['data'][] = array(
                    'name' => (string)$data['name'],
                    'type' => (string)$data['type'],
                );
            }
        }

        $groups[] = $group;
    }

    return $groups;
}

function getTypeSize($type, $schema) {
    $primitiveSize = array(
        'char' => 1,      // section 2.6.1
        'int8' => 1,
        'uint8' => 1,
        'int16' => 2,
        'uint16' => 2,
        'int32' => 4,
        'uint32' => 4,
        'int64' => 8,
        'uint64' => 8,
        'float' => 4,     // section 2.5 - IEEE 754 binary32
        'double' => 8,    // section 2.5 - IEEE 754 binary64
    );

    if (isset($primitiveSize[$type])) {
        return $primitiveSize[$type];
    }

    if (isset($schema['types'][$type])) {
        $customType = $schema['types'][$type];
        $length = isset($customType['length']) ? $customType['length'] : 1;
        return getTypeSize($customType['primitiveType'], $schema) * $length;
    }

    return 0;
}

/**
 * Create an SBE decoder for a given schema
 */
function createSbeDecoder($schema) {
    $littleEndian = $schema['byteOrder'] === 'littleEndian';

    return array(
        /**
         * Decode an SBE message
         */
        'decode' => function($buffer) use ($schema, $littleEndian) {
            $offset = 0;
            $bufferLength = strlen($buffer);

            // Read message header based on SBE version
            // SBE 1.0 (2016): 4 fields (8 bytes) - blockLength, templateId, schemaId, version
            // SBE 2.0 (2017+): 6 fields (12 bytes) - adds numGroups, numVarDataFields
            $blockLength = readUint16($buffer, $offset, $littleEndian);
            $offset += 2;
            $templateId = readUint16($buffer, $offset, $littleEndian);
            $offset += 2;
            $schemaId = readUint16($buffer, $offset, $littleEndian);
            $offset += 2;
            $version = readUint16($buffer, $offset, $littleEndian);
            $offset += 2;

            $numGroups = 0;
            $numVarDataFields = 0;
            if ($schema['sbeVersion'] === 2) {
                $numGroups = readUint16($buffer, $offset, $littleEndian);
                $offset += 2;
                $numVarDataFields = readUint16($buffer, $offset, $littleEndian);
                $offset += 2;
            }

            if (!isset($schema['messages'][$templateId])) {
                throw new \Exception('Unknown message template ID: ' . $templateId);
            }

            $message = $schema['messages'][$templateId];

            $result = array(
                'messageId' => $templateId,
                'messageName' => $message['name'],
            );

            // Save the start of the message body
            $messageBodyStart = $offset;

            // Only decode fields if blockLength > 0
            // When blockLength is 0, all data is in repeating groups and variable-length fields
            if ($blockLength > 0) {
                // Decode fields using their offsets relative to message start
                // This matches SBE spec where field offsets are relative to block start
                foreach ($message['fields'] as $field) {
                    $fieldOffset = $messageBodyStart + $field['offset'];
                    try {
                        $value = decodeField($buffer, $fieldOffset, $field['type'], $littleEndian, $schema);
                        $result[$field['name']] = $value;
                    } catch (\Exception $e) {
                        throw new \Exception('Error decoding field ' . $field['name'] . ' (type: ' . $field['type'] . ') at offset ' . $fieldOffset . ': ' . $e->getMessage());
                    }
                }
            }

            // Skip to the end of the fixed block using blockLength from header
            // This ensures we're at the correct position for repeating groups
            $offset = $messageBodyStart + $blockLength;

            // Decode groups recursively
            $decodeResult = decodeGroups($buffer, $offset, $message['groups'], $littleEndian, $schema);
            $result = array_merge($result, $decodeResult['result']);
            $offset = $decodeResult['offset'];

            // Decode variable-length data fields
            foreach ($message['data'] as $dataField) {
                // Read length prefix according to SBE spec section 2.7
                // Length can be uint8, uint16, or uint32
                // Check composite type to determine size
                $length = 0;
                if (isset($schema['composites'][$dataField['type']])) {
                    $varComposite = $schema['composites'][$dataField['type']];
                    $lengthElem = null;
                    foreach ($varComposite['elements'] as $elem) {
                        if ($elem['name'] === 'length') {
                            $lengthElem = $elem;
                            break;
                        }
                    }
                    if ($lengthElem) {
                        if ($lengthElem['primitiveType'] === 'uint32') {
                            $length = readUint32($buffer, $offset, $littleEndian);
                            $offset += 4;
                        } else if ($lengthElem['primitiveType'] === 'uint16') {
                            $length = readUint16($buffer, $offset, $littleEndian);
                            $offset += 2;
                        } else if ($lengthElem['primitiveType'] === 'uint8') {
                            $length = readUint8($buffer, $offset);
                            $offset += 1;
                        } else {
                            // Default to uint16
                            $length = readUint16($buffer, $offset, $littleEndian);
                            $offset += 2;
                        }
                    } else {
                        // No length element found, default to uint16
                        $length = readUint16($buffer, $offset, $littleEndian);
                        $offset += 2;
                    }
                } else {
                    // Fallback for unknown types - try to infer from name
                    if (strpos($dataField['type'], '8') !== false) {
                        $length = readUint8($buffer, $offset);
                        $offset += 1;
                    } else {
                        $length = readUint16($buffer, $offset, $littleEndian);
                        $offset += 2;
                    }
                }

                // Extract the data
                if (strpos($dataField['type'], 'String') !== false) {
                    // Decode as UTF-8 string
                    $dataBytes = substr($buffer, $offset, $length);
                    $result[$dataField['name']] = mb_convert_encoding($dataBytes, 'UTF-8', 'UTF-8');
                } else if ($dataField['type'] === 'messageData') {
                    // Return as binary string for nested message decoding
                    $result[$dataField['name']] = substr($buffer, $offset, $length);
                } else {
                    // Return as binary string for binary data
                    $result[$dataField['name']] = substr($buffer, $offset, $length);
                }
                $offset += $length;
            }

            return $result;
        },
    );
}

/**
 * Recursively decode groups and return both the decoded result and new offset
 */
function decodeGroups($buffer, $startOffset, $groups, $littleEndian, $schema) {
    $result = array();
    $offset = $startOffset;
    $bufferLength = strlen($buffer);

    foreach ($groups as $group) {
        // Check if offset is within bounds before reading dimensions
        if ($offset + 4 > $bufferLength) {
            // No more groups to read - this is normal at end of buffer
            break;
        }

        // Read group dimensions
        $groupBlockLength = readUint16($buffer, $offset, $littleEndian);
        $offset += 2;

        // Read numInGroup according to dimensionType
        $numInGroup = 0;
        if (isset($schema['composites'][$group['dimensionType']])) {
            $dimensionComposite = $schema['composites'][$group['dimensionType']];
            $numInGroupElem = null;
            foreach ($dimensionComposite['elements'] as $elem) {
                if ($elem['name'] === 'numInGroup') {
                    $numInGroupElem = $elem;
                    break;
                }
            }
            if ($numInGroupElem) {
                if ($numInGroupElem['primitiveType'] === 'uint32') {
                    $numInGroup = readUint32($buffer, $offset, $littleEndian);
                    $offset += 4;
                } else if ($numInGroupElem['primitiveType'] === 'uint16') {
                    $numInGroup = readUint16($buffer, $offset, $littleEndian);
                    $offset += 2;
                } else if ($numInGroupElem['primitiveType'] === 'uint8') {
                    $numInGroup = readUint8($buffer, $offset);
                    $offset += 1;
                } else {
                    $numInGroup = readUint16($buffer, $offset, $littleEndian);
                    $offset += 2;
                }
            } else {
                $numInGroup = readUint16($buffer, $offset, $littleEndian);
                $offset += 2;
            }
        } else {
            $numInGroup = readUint16($buffer, $offset, $littleEndian);
            $offset += 2;
        }

        // Validate numInGroup is reasonable (sanity check to catch corruption)
        if ($numInGroup > 1000000) {
            throw new \Exception('Invalid numInGroup value: ' . $numInGroup . ' for group ' . $group['name'] . '. This likely indicates corrupted data or incorrect schema.');
        }

        // SBE 2.0: Read numGroups and numVarDataFields
        if ($schema['sbeVersion'] === 2) {
            $offset += 2; // numGroups
            $offset += 2; // numVarDataFields
        }

        $groupItems = array();
        for ($i = 0; $i < $numInGroup; $i++) {
            $itemStart = $offset;
            $item = array();

            // Check we have enough space for this group item
            if ($itemStart + $groupBlockLength > $bufferLength) {
                throw new \Exception('Buffer overflow: Group ' . $group['name'] . ' item ' . $i . ' would read past buffer end.');
            }

            // Decode fixed fields in this group item (only read from fixed block)
            foreach ($group['fields'] as $field) {
                $fieldOffset = $itemStart + $field['offset'];
                $value = decodeField($buffer, $fieldOffset, $field['type'], $littleEndian, $schema);
                $item[$field['name']] = $value;
            }

            // Move offset to end of fixed fields block
            $offset = $itemStart + $groupBlockLength;

            // Now decode nested groups (they come AFTER fixed fields)
            if (isset($group['groups']) && count($group['groups']) > 0) {
                $nestedResult = decodeGroups($buffer, $offset, $group['groups'], $littleEndian, $schema);
                $item = array_merge($item, $nestedResult['result']);
                $offset = $nestedResult['offset'];
            }

            // Finally decode var data fields (they come AFTER nested groups)
            if (isset($group['data']) && count($group['data']) > 0) {
                foreach ($group['data'] as $dataField) {
                    // Check bounds before reading length
                    if ($offset + 1 > $bufferLength) {
                        throw new \Exception('Buffer overflow: Cannot read length for var data field ' . $dataField['name']);
                    }

                    // Read length prefix
                    $length = 0;
                    if (isset($schema['composites'][$dataField['type']])) {
                        $varComposite = $schema['composites'][$dataField['type']];
                        $lengthElem = null;
                        foreach ($varComposite['elements'] as $elem) {
                            if ($elem['name'] === 'length') {
                                $lengthElem = $elem;
                                break;
                            }
                        }
                        if ($lengthElem) {
                            if ($lengthElem['primitiveType'] === 'uint32') {
                                $length = readUint32($buffer, $offset, $littleEndian);
                                $offset += 4;
                            } else if ($lengthElem['primitiveType'] === 'uint16') {
                                $length = readUint16($buffer, $offset, $littleEndian);
                                $offset += 2;
                            } else if ($lengthElem['primitiveType'] === 'uint8') {
                                $length = readUint8($buffer, $offset);
                                $offset += 1;
                            } else {
                                $length = readUint16($buffer, $offset, $littleEndian);
                                $offset += 2;
                            }
                        } else {
                            $length = readUint16($buffer, $offset, $littleEndian);
                            $offset += 2;
                        }
                    } else {
                        if (strpos($dataField['type'], '8') !== false) {
                            $length = readUint8($buffer, $offset);
                            $offset += 1;
                        } else {
                            $length = readUint16($buffer, $offset, $littleEndian);
                            $offset += 2;
                        }
                    }

                    // Check bounds before reading data
                    if ($offset + $length > $bufferLength) {
                        throw new \Exception('Buffer overflow: Var data field ' . $dataField['name'] . ' would read past buffer end.');
                    }

                    // Extract data
                    if (strpos($dataField['type'], 'String') !== false) {
                        $dataBytes = substr($buffer, $offset, $length);
                        $item[$dataField['name']] = mb_convert_encoding($dataBytes, 'UTF-8', 'UTF-8');
                    } else if ($dataField['type'] === 'messageData') {
                        $item[$dataField['name']] = substr($buffer, $offset, $length);
                    } else {
                        $item[$dataField['name']] = substr($buffer, $offset, $length);
                    }
                    $offset += $length;
                }
            }

            $groupItems[] = $item;
        }

        $result[$group['name']] = $groupItems;
    }

    return array('result' => $result, 'offset' => $offset);
}

function decodeField($buffer, $offset, $type, $littleEndian, $schema) {
    switch ($type) {
        case 'int8':
            return unpack('c', substr($buffer, $offset, 1))[1];
        case 'uint8':
            return unpack('C', substr($buffer, $offset, 1))[1];
        case 'int16':
            $data = unpack($littleEndian ? 'v' : 'n', substr($buffer, $offset, 2))[1];
            if ($data > 0x7FFF) {
                $data = $data - 0x10000;
            }
            return $data;
        case 'uint16':
            return unpack($littleEndian ? 'v' : 'n', substr($buffer, $offset, 2))[1];
        case 'int32':
            $data = unpack($littleEndian ? 'V' : 'N', substr($buffer, $offset, 4))[1];
            if ($data > 0x7FFFFFFF) {
                $data = $data - 0x100000000;
            }
            return $data;
        case 'uint32':
            return unpack($littleEndian ? 'V' : 'N', substr($buffer, $offset, 4))[1];
        case 'int64':
            // Read as two 32-bit values and combine
            if ($littleEndian) {
                $low = unpack('V', substr($buffer, $offset, 4))[1];
                $high = unpack('V', substr($buffer, $offset + 4, 4))[1];
            } else {
                $high = unpack('N', substr($buffer, $offset, 4))[1];
                $low = unpack('N', substr($buffer, $offset + 4, 4))[1];
            }
            // Combine into 64-bit value
            if (PHP_INT_SIZE === 8) {
                // 64-bit PHP can handle this directly
                $result = $high * 0x100000000 + $low;
                // Handle sign extension for signed int64
                if ($result > 0x7FFFFFFFFFFFFFFF) {
                    $result = $result - 0x10000000000000000;
                }
                return $result;
            } else {
                // 32-bit PHP - return as float (loses precision for very large values)
                $result = floatval($high) * 4294967296.0 + floatval($low);
                if ($result > 9223372036854775807.0) {
                    $result = $result - 18446744073709551616.0;
                }
                return intval($result);
            }
        case 'uint64':
            // Read as two 32-bit values and combine
            if ($littleEndian) {
                $low = unpack('V', substr($buffer, $offset, 4))[1];
                $high = unpack('V', substr($buffer, $offset + 4, 4))[1];
            } else {
                $high = unpack('N', substr($buffer, $offset, 4))[1];
                $low = unpack('N', substr($buffer, $offset + 4, 4))[1];
            }
            // Combine into 64-bit value
            if (PHP_INT_SIZE === 8) {
                return $high * 0x100000000 + $low;
            } else {
                // 32-bit PHP - return as float (loses precision for very large values)
                return floatval($high) * 4294967296.0 + floatval($low);
            }
        case 'float':
            // IEEE 754-2008 binary32 single precision (section 2.5)
            $data = unpack($littleEndian ? 'g' : 'G', substr($buffer, $offset, 4))[1];
            return $data;
        case 'double':
            // IEEE 754-2008 binary64 double precision (section 2.5)
            $data = unpack($littleEndian ? 'e' : 'E', substr($buffer, $offset, 8))[1];
            return $data;
        case 'char':
            // Single-byte character (section 2.6.1)
            return chr(unpack('C', substr($buffer, $offset, 1))[1]);
        default:
            // Check if it's a custom type
            if (isset($schema['types'][$type])) {
                $customType = $schema['types'][$type];
                return decodeField($buffer, $offset, $customType['primitiveType'], $littleEndian, $schema);
            }
            return 0;
    }
}

// Helper functions for reading binary data
function readUint8($buffer, $offset) {
    return unpack('C', substr($buffer, $offset, 1))[1];
}

function readUint16($buffer, $offset, $littleEndian) {
    return unpack($littleEndian ? 'v' : 'n', substr($buffer, $offset, 2))[1];
}

function readUint32($buffer, $offset, $littleEndian) {
    return unpack($littleEndian ? 'V' : 'N', substr($buffer, $offset, 4))[1];
}

/**
 * Convert mantissa and exponent to decimal number
 * Used by exchanges that encode prices/amounts as mantissa * 10^exponent
 */
function applyExponent($mantissa, $exponent) {
    if (is_string($mantissa)) {
        $mantissa = floatval($mantissa);
    }
    return $mantissa * pow(10, $exponent);
}

/**
 * Convert mantissa128 byte array to number
 * mantissa128 is a signed 128-bit integer encoded as a little-endian byte array
 * Used by Binance SBE for large volume values
 */
function mantissa128ToNumber($bytes) {
    if (!$bytes || strlen($bytes) === 0) {
        return 0;
    }

    $result = 0;
    $multiplier = 1;

    // Read up to 8 bytes (64-bit safe range for PHP numbers)
    $limit = min(strlen($bytes), 8);
    for ($i = 0; $i < $limit; $i++) {
        $byte = ord($bytes[$i]);
        $result += $byte * $multiplier;
        $multiplier *= 256;
    }

    // Check if this is a negative number (bit 7 of the last byte we read)
    // For simplicity, we assume values fit in the positive range for volumes
    // If negative handling is needed, check the sign bit and apply two's complement

    return $result;
}

/**
 * Decode an orderbook from SBE binary data
 * This is a convenience function that handles the common orderbook format
 */
function decodeSbeOrderbook($buffer, $schema) {
    $decoder = createSbeDecoder($schema);
    $decoded = $decoder['decode']($buffer);

    $result = array(
        'bids' => array(),
        'asks' => array(),
        'timestamp' => null,
    );

    // Extract timestamp
    if (isset($decoded['tsUs'])) {
        $result['timestamp'] = intval($decoded['tsUs'] / 1000); // microseconds to milliseconds
    } else if (isset($decoded['timestamp'])) {
        $result['timestamp'] = $decoded['timestamp'];
    }

    // Get exponents
    $pxExponent = isset($decoded['pxExponent']) ? $decoded['pxExponent'] : 0;
    $szExponent = isset($decoded['szExponent']) ? $decoded['szExponent'] : 0;

    // Convert asks
    if (isset($decoded['asks']) && is_array($decoded['asks'])) {
        $result['asks'] = array_map(function($ask) use ($pxExponent, $szExponent) {
            $price = applyExponent(isset($ask['pxMantissa']) ? $ask['pxMantissa'] : (isset($ask['price']) ? $ask['price'] : 0), $pxExponent);
            $size = applyExponent(isset($ask['szMantissa']) ? $ask['szMantissa'] : (isset($ask['size']) ? $ask['size'] : 0), $szExponent);
            $ordCount = isset($ask['ordCount']) ? $ask['ordCount'] : 0;
            return array($price, $size, $ordCount);
        }, $decoded['asks']);
    }

    // Convert bids
    if (isset($decoded['bids']) && is_array($decoded['bids'])) {
        $result['bids'] = array_map(function($bid) use ($pxExponent, $szExponent) {
            $price = applyExponent(isset($bid['pxMantissa']) ? $bid['pxMantissa'] : (isset($bid['price']) ? $bid['price'] : 0), $pxExponent);
            $size = applyExponent(isset($bid['szMantissa']) ? $bid['szMantissa'] : (isset($bid['size']) ? $bid['size'] : 0), $szExponent);
            $ordCount = isset($bid['ordCount']) ? $bid['ordCount'] : 0;
            return array($price, $size, $ordCount);
        }, $decoded['bids']);
    }

    // Include other fields
    $result = array_merge($result, $decoded);

    return $result;
}

