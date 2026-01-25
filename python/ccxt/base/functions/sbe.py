# -*- coding: utf-8 -*-

"""
SBE (Simple Binary Encoding) utilities

This module provides utilities for working with SBE schemas and decoding binary messages.
SBE is a high-performance binary encoding used by some exchanges (OKX, Binance) for
low-latency market data.

Supports both SBE versions:
- SBE 1.0 (2016 namespace): 8-byte header, 2-field group dimensions
- SBE 2.0 (2017+ namespace): 12-byte header, 4-field group dimensions

Version is auto-detected from the XML namespace in the schema.
"""

import struct
import re
from typing import Dict, List, Any, Optional, Callable, Tuple
from collections import namedtuple

# Type definitions
SbeField = namedtuple('SbeField', ['name', 'type', 'offset', 'size'])
SbeDataField = namedtuple('SbeDataField', ['name', 'type'])
SbeType = namedtuple('SbeType', ['primitiveType', 'length'])

class SbeGroup:
    def __init__(self, name: str, dimensionType: str, fields: List[SbeField] = None,
                 groups: List['SbeGroup'] = None, data: List[SbeDataField] = None):
        self.name = name
        self.dimensionType = dimensionType
        self.fields = fields or []
        self.groups = groups or []
        self.data = data or []

class SbeMessage:
    def __init__(self, id: int, name: str, fields: List[SbeField] = None,
                 groups: List[SbeGroup] = None, data: List[SbeDataField] = None):
        self.id = id
        self.name = name
        self.fields = fields or []
        self.groups = groups or []
        self.data = data or []

class SbeComposite:
    def __init__(self, name: str, elements: List[Dict[str, Any]]):
        self.name = name
        self.elements = elements

class SbeSchema:
    def __init__(self, package: str, id: int, byteOrder: str, sbeVersion: int):
        self.package = package
        self.id = id
        self.byteOrder = byteOrder
        self.messages: Dict[int, SbeMessage] = {}
        self.types: Dict[str, SbeType] = {}
        self.composites: Dict[str, SbeComposite] = {}
        self.sbeVersion = sbeVersion  # 1 = SBE 1.0 (2016), 2 = SBE 2.0 (2017+)


def parse_attribute_value(value: str) -> Any:
    """Parse attribute value based on type"""
    if value == 'true':
        return True
    if value == 'false':
        return False

    # Try to parse as number
    try:
        if '.' in value:
            return float(value)
        return int(value)
    except ValueError:
        return value


class XMLParser:
    """Minimal XML parser for SBE schema files"""

    def __init__(self, ignoreAttributes: bool = False, attributeNamePrefix: str = '@_',
                 parseAttributeValue: bool = False, isArray: Optional[Callable[[str], bool]] = None):
        self.ignoreAttributes = ignoreAttributes
        self.attributeNamePrefix = attributeNamePrefix
        self.parseAttributeValue = parseAttributeValue
        self.isArray = isArray or (lambda x: False)

    def parse(self, xml: str) -> Dict[str, Any]:
        """Parse XML string into a Python dict"""
        # Remove XML declaration and comments
        xml = re.sub(r'<\?xml[^>]*\?>', '', xml)
        xml = re.sub(r'<!--[\s\S]*?-->', '', xml)

        # Remove CDATA sections (replace with content)
        xml = re.sub(r'<!\[CDATA\[([\s\S]*?)\]\]>', r'\1', xml)

        result = self._parse_element(xml.strip())
        return result

    def _parse_element(self, xml: str) -> Dict[str, Any]:
        """Parse an XML element recursively"""
        if not xml or xml.strip() == '':
            return {}

        result = {}
        i = 0

        while i < len(xml):
            # Skip whitespace
            while i < len(xml) and xml[i].isspace():
                i += 1

            if i >= len(xml):
                break

            # Check for opening tag
            if xml[i] == '<':
                # Check for closing tag
                if i + 1 < len(xml) and xml[i + 1] == '/':
                    end_index = xml.find('>', i)
                    if end_index == -1:
                        break
                    i = end_index + 1
                    continue

                # Check for self-closing tag
                self_closing_match = re.match(r'<([^/>\s:]+(?::[^/>\s]+)?)([^>]*)\s*/>', xml[i:])
                if self_closing_match:
                    tag_name = self_closing_match.group(1)
                    attributes = self._parse_attributes(self_closing_match.group(2))
                    end_index = i + len(self_closing_match.group(0))

                    self._add_to_result(result, tag_name, {}, attributes)
                    i = end_index
                    continue

                # Parse opening tag
                tag_match = re.match(r'<([^>\s:]+(?::[^>\s]+)?)([^>]*)>', xml[i:])
                if not tag_match:
                    i += 1
                    continue

                tag_name = tag_match.group(1)
                attributes = self._parse_attributes(tag_match.group(2))
                i += len(tag_match.group(0))

                # Find matching closing tag
                closing_tag = f'</{tag_name}>'
                depth = 1
                content_start = i
                content_end = i

                while i < len(xml) and depth > 0:
                    next_close = xml.find(closing_tag, i)

                    if next_close == -1:
                        break

                    # Check for nested opening tags with same name
                    next_open = xml.find(f'<{tag_name}', i)
                    if next_open != -1 and next_open < next_close:
                        # Check if it's a self-closing tag
                        self_close_match = re.match(r'<[^>]+\s*/>', xml[next_open:])
                        if self_close_match:
                            i = next_open + len(self_close_match.group(0))
                            continue
                        # It's a nested opening tag
                        depth += 1
                        i = next_open + len(tag_name) + 2
                    else:
                        # Found closing tag
                        depth -= 1
                        if depth == 0:
                            content_end = next_close
                            i = next_close + len(closing_tag)
                            break
                        else:
                            i = next_close + len(closing_tag)

                # Extract content
                content = xml[content_start:content_end].strip()

                # Check if content has child elements
                has_child_elements = bool(re.search(r'<[^>]+>', content))
                if has_child_elements:
                    child_result = self._parse_element(content)
                elif content:
                    child_result = content
                else:
                    child_result = {}

                self._add_to_result(result, tag_name, child_result, attributes)
            else:
                i += 1

        return result

    def _parse_attributes(self, attr_string: str) -> Dict[str, Any]:
        """Parse attributes from a tag"""
        attrs = {}

        if not attr_string or attr_string.strip() == '':
            return attrs

        # Match attributes (name="value" or name='value')
        attr_regex = re.compile(r'([\w:]+)=["\']([^"\']*)["\']')
        for match in attr_regex.finditer(attr_string):
            name = match.group(1)
            string_value = match.group(2)
            value = string_value

            if self.parseAttributeValue:
                value = parse_attribute_value(string_value)

            prefixed_name = self.attributeNamePrefix + name
            attrs[prefixed_name] = value

        return attrs

    def _add_to_result(self, result: Dict[str, Any], tag_name: str, content: Any, attributes: Dict[str, Any]):
        """Add parsed element to result"""
        should_be_array = self.isArray(tag_name)

        # Handle text content
        if isinstance(content, (str, int, float, bool)):
            node_value = dict(attributes)
            if attributes:
                node_value['#text'] = content
            else:
                node_value = content
        elif isinstance(content, dict):
            node_value = {**content, **attributes}
        else:
            node_value = attributes

        if tag_name not in result:
            if should_be_array:
                result[tag_name] = [node_value]
            else:
                result[tag_name] = node_value
        else:
            if not isinstance(result[tag_name], list):
                result[tag_name] = [result[tag_name]]
            result[tag_name].append(node_value)


def parse_sbe_schema(schema_path: str) -> SbeSchema:
    """Parse an SBE XML schema file"""
    with open(schema_path, 'r', encoding='utf-8') as f:
        xml = f.read()

    # Detect SBE version from XML namespace
    namespace_match = re.search(r'xmlns:sbe="http://fixprotocol\.io/(\d+)/sbe"', xml)
    namespace_year = int(namespace_match.group(1)) if namespace_match else 2016
    sbe_version = 2 if namespace_year >= 2017 else 1

    # Configure XML parser
    parser = XMLParser(
        ignoreAttributes=False,
        attributeNamePrefix='@_',
        parseAttributeValue=True,
        isArray=lambda tag_name: tag_name in ['type', 'field', 'group', 'data', 'composite']
    )

    parsed = parser.parse(xml)
    message_schema = parsed.get('sbe:messageSchema')

    if not message_schema:
        raise ValueError('Invalid SBE schema format')

    schema = SbeSchema(
        package=message_schema.get('@_package', ''),
        id=message_schema.get('@_id', 0),
        byteOrder=message_schema.get('@_byteOrder', 'littleEndian'),
        sbeVersion=sbe_version
    )

    # Parse types
    if 'types' in message_schema and 'type' in message_schema['types']:
        types = message_schema['types']['type']
        if not isinstance(types, list):
            types = [types]
        for type_def in types:
            if '@_name' in type_def and '@_primitiveType' in type_def:
                schema.types[type_def['@_name']] = SbeType(
                    primitiveType=type_def['@_primitiveType'],
                    length=type_def.get('@_length')
                )

    # Parse composites
    if 'types' in message_schema and 'composite' in message_schema['types']:
        composites = message_schema['types']['composite']
        if not isinstance(composites, list):
            composites = [composites]
        for composite in composites:
            name = composite.get('@_name')
            elements = []

            if 'type' in composite:
                type_elems = composite['type']
                if not isinstance(type_elems, list):
                    type_elems = [type_elems]
                for elem in type_elems:
                    elem_name = elem.get('@_name')
                    prim_type = elem.get('@_primitiveType')
                    length = elem.get('@_length', 1)
                    elem_size = get_type_size(prim_type, schema) * length
                    elements.append({
                        'name': elem_name,
                        'type': prim_type,
                        'primitiveType': prim_type,
                        'size': elem_size
                    })

            if elements:
                schema.composites[name] = SbeComposite(name, elements)

    # Parse messages
    if 'sbe:message' in message_schema:
        messages = message_schema['sbe:message']
        if not isinstance(messages, list):
            messages = [messages]

        for msg in messages:
            message_id = msg.get('@_id')
            message = SbeMessage(
                id=message_id,
                name=msg.get('@_name', ''),
                fields=[],
                groups=[],
                data=[]
            )

            # Parse fields
            if 'field' in msg:
                offset = 0
                fields = msg['field']
                if not isinstance(fields, list):
                    fields = [fields]
                for field in fields:
                    size = get_type_size(field.get('@_type'), schema)
                    message.fields.append(SbeField(
                        name=field.get('@_name', ''),
                        type=field.get('@_type', ''),
                        offset=offset,
                        size=size
                    ))
                    offset += size

            # Parse groups
            if 'group' in msg:
                message.groups = parse_groups_from_xml_object(msg['group'], schema)

            # Parse data fields
            if 'data' in msg:
                data_fields = msg['data']
                if not isinstance(data_fields, list):
                    data_fields = [data_fields]
                for data in data_fields:
                    message.data.append(SbeDataField(
                        name=data.get('@_name', ''),
                        type=data.get('@_type', '')
                    ))

            schema.messages[message_id] = message

    return schema


def parse_groups_from_xml_object(group_obj: Any, schema: SbeSchema) -> List[SbeGroup]:
    """Parse groups recursively from parsed XML object"""
    groups = []
    group_array = group_obj if isinstance(group_obj, list) else [group_obj]

    for grp in group_array:
        group = SbeGroup(
            name=grp.get('@_name', ''),
            dimensionType=grp.get('@_dimensionType', 'groupSizeEncoding'),
            fields=[],
            groups=[],
            data=[]
        )

        # Parse fields in this group
        if 'field' in grp:
            offset = 0
            fields = grp['field']
            if not isinstance(fields, list):
                fields = [fields]
            for field in fields:
                size = get_type_size(field.get('@_type'), schema)
                group.fields.append(SbeField(
                    name=field.get('@_name', ''),
                    type=field.get('@_type', ''),
                    offset=offset,
                    size=size
                ))
                offset += size

        # Parse nested groups recursively
        if 'group' in grp:
            group.groups = parse_groups_from_xml_object(grp['group'], schema)

        # Parse data fields in this group
        if 'data' in grp:
            data_fields = grp['data']
            if not isinstance(data_fields, list):
                data_fields = [data_fields]
            for data in data_fields:
                group.data.append(SbeDataField(
                    name=data.get('@_name', ''),
                    type=data.get('@_type', '')
                ))

        groups.append(group)

    return groups


def get_type_size(type_name: str, schema: SbeSchema) -> int:
    """Get the size in bytes of a type"""
    primitive_size = {
        'char': 1,
        'int8': 1,
        'uint8': 1,
        'int16': 2,
        'uint16': 2,
        'int32': 4,
        'uint32': 4,
        'int64': 8,
        'uint64': 8,
        'float': 4,
        'double': 8,
    }

    if type_name in primitive_size:
        return primitive_size[type_name]

    custom_type = schema.types.get(type_name)
    if custom_type:
        length = custom_type.length or 1
        return get_type_size(custom_type.primitiveType, schema) * length

    return 0


class SbeDecoder:
    """SBE decoder for a given schema"""

    def __init__(self, schema: SbeSchema):
        self.schema = schema
        self.little_endian = schema.byteOrder == 'littleEndian'

    def decode(self, buffer: bytes) -> Dict[str, Any]:
        """Decode an SBE message"""
        offset = 0

        # Read message header based on SBE version
        block_length = self._read_uint16(buffer, offset)
        offset += 2
        template_id = self._read_uint16(buffer, offset)
        offset += 2
        schema_id = self._read_uint16(buffer, offset)
        offset += 2
        version = self._read_uint16(buffer, offset)
        offset += 2

        num_groups = 0
        num_var_data_fields = 0
        if self.schema.sbeVersion == 2:
            num_groups = self._read_uint16(buffer, offset)
            offset += 2
            num_var_data_fields = self._read_uint16(buffer, offset)
            offset += 2

        message = self.schema.messages.get(template_id)
        if not message:
            raise ValueError(f'Unknown message template ID: {template_id}')

        result = {
            'messageId': template_id,
            'messageName': message.name,
        }

        # Save the start of the message body
        message_body_start = offset

        # Only decode fields if blockLength > 0
        if block_length > 0:
            for field in message.fields:
                field_offset = message_body_start + field.offset
                try:
                    value = self._decode_field(buffer, field_offset, field.type)
                    result[field.name] = value
                except Exception as e:
                    raise ValueError(f'Error decoding field {field.name} (type: {field.type}) at offset {field_offset}: {e}')

        # Skip to the end of the fixed block
        offset = message_body_start + block_length

        # Decode groups recursively
        decode_result = self._decode_groups(buffer, offset, message.groups)
        result.update(decode_result['result'])
        offset = decode_result['offset']

        # Decode variable-length data fields
        for data_field in message.data:
            length = self._read_var_length(buffer, offset, data_field.type)
            offset += length[1]  # length[1] is the size of the length field

            # Extract the data
            if 'String' in data_field.type:
                data_bytes = buffer[offset:offset + length[0]]
                result[data_field.name] = data_bytes.decode('utf-8')
            elif data_field.type == 'messageData':
                result[data_field.name] = buffer[offset:offset + length[0]]
            else:
                result[data_field.name] = buffer[offset:offset + length[0]]
            offset += length[0]

        return result

    def _decode_groups(self, buffer: bytes, start_offset: int, groups: List[SbeGroup]) -> Dict[str, Any]:
        """Recursively decode groups"""
        result = {}
        offset = start_offset

        for group in groups:
            # Check bounds
            if offset + 4 > len(buffer):
                break

            # Read group dimensions
            group_block_length = self._read_uint16(buffer, offset)
            offset += 2

            # Read numInGroup
            num_in_group = self._read_group_count(buffer, offset, group.dimensionType)
            offset += num_in_group[1]  # num_in_group[1] is the size of the count field

            # Validate numInGroup
            if num_in_group[0] > 1000000:
                raise ValueError(f'Invalid numInGroup value: {num_in_group[0]} for group {group.name}')

            # SBE 2.0: Read numGroups and numVarDataFields
            if self.schema.sbeVersion == 2:
                offset += 2  # numGroups
                offset += 2  # numVarDataFields

            group_items = []
            for i in range(num_in_group[0]):
                item_start = offset
                item = {}

                # Check bounds
                if item_start + group_block_length > len(buffer):
                    raise ValueError(f'Buffer overflow: Group {group.name} item {i} would read past buffer end')

                # Decode fixed fields
                for field in group.fields:
                    field_offset = item_start + field.offset
                    value = self._decode_field(buffer, field_offset, field.type)
                    item[field.name] = value

                # Move offset to end of fixed fields block
                offset = item_start + group_block_length

                # Decode nested groups
                if group.groups:
                    nested_result = self._decode_groups(buffer, offset, group.groups)
                    item.update(nested_result['result'])
                    offset = nested_result['offset']

                # Decode var data fields
                if group.data:
                    for data_field in group.data:
                        if offset + 1 > len(buffer):
                            raise ValueError(f'Buffer overflow: Cannot read length for var data field {data_field.name}')

                        length = self._read_var_length(buffer, offset, data_field.type)
                        offset += length[1]

                        if offset + length[0] > len(buffer):
                            raise ValueError(f'Buffer overflow: Var data field {data_field.name} would read past buffer end')

                        # Extract data
                        if 'String' in data_field.type:
                            data_bytes = buffer[offset:offset + length[0]]
                            item[data_field.name] = data_bytes.decode('utf-8')
                        elif data_field.type == 'messageData':
                            item[data_field.name] = buffer[offset:offset + length[0]]
                        else:
                            item[data_field.name] = buffer[offset:offset + length[0]]
                        offset += length[0]

                group_items.append(item)

            result[group.name] = group_items

        return {'result': result, 'offset': offset}

    def _decode_field(self, buffer: bytes, offset: int, type_name: str) -> Any:
        """Decode a single field"""
        if type_name == 'int8':
            return struct.unpack_from('b', buffer, offset)[0]
        elif type_name == 'uint8':
            return struct.unpack_from('B', buffer, offset)[0]
        elif type_name == 'int16':
            fmt = '<h' if self.little_endian else '>h'
            return struct.unpack_from(fmt, buffer, offset)[0]
        elif type_name == 'uint16':
            fmt = '<H' if self.little_endian else '>H'
            return struct.unpack_from(fmt, buffer, offset)[0]
        elif type_name == 'int32':
            fmt = '<i' if self.little_endian else '>i'
            return struct.unpack_from(fmt, buffer, offset)[0]
        elif type_name == 'uint32':
            fmt = '<I' if self.little_endian else '>I'
            return struct.unpack_from(fmt, buffer, offset)[0]
        elif type_name == 'int64':
            fmt = '<q' if self.little_endian else '>q'
            return struct.unpack_from(fmt, buffer, offset)[0]
        elif type_name == 'uint64':
            fmt = '<Q' if self.little_endian else '>Q'
            return struct.unpack_from(fmt, buffer, offset)[0]
        elif type_name == 'float':
            fmt = '<f' if self.little_endian else '>f'
            return struct.unpack_from(fmt, buffer, offset)[0]
        elif type_name == 'double':
            fmt = '<d' if self.little_endian else '>d'
            return struct.unpack_from(fmt, buffer, offset)[0]
        elif type_name == 'char':
            return chr(buffer[offset])
        else:
            # Check if it's a custom type
            custom_type = self.schema.types.get(type_name)
            if custom_type:
                return self._decode_field(buffer, offset, custom_type.primitiveType)
            return 0

    def _read_uint16(self, buffer: bytes, offset: int) -> int:
        """Read uint16 from buffer"""
        fmt = '<H' if self.little_endian else '>H'
        return struct.unpack_from(fmt, buffer, offset)[0]

    def _read_uint32(self, buffer: bytes, offset: int) -> int:
        """Read uint32 from buffer"""
        fmt = '<I' if self.little_endian else '>I'
        return struct.unpack_from(fmt, buffer, offset)[0]

    def _read_uint8(self, buffer: bytes, offset: int) -> int:
        """Read uint8 from buffer"""
        return buffer[offset]

    def _read_var_length(self, buffer: bytes, offset: int, var_type: str) -> Tuple[int, int]:
        """Read variable length prefix, returns (length, size_of_length_field)"""
        var_composite = self.schema.composites.get(var_type)
        if var_composite:
            length_elem = next((e for e in var_composite.elements if e['name'] == 'length'), None)
            if length_elem:
                prim_type = length_elem.get('primitiveType', 'uint16')
                if prim_type == 'uint32':
                    return (self._read_uint32(buffer, offset), 4)
                elif prim_type == 'uint16':
                    return (self._read_uint16(buffer, offset), 2)
                elif prim_type == 'uint8':
                    return (self._read_uint8(buffer, offset), 1)

        # Fallback
        if '8' in var_type:
            return (self._read_uint8(buffer, offset), 1)
        else:
            return (self._read_uint16(buffer, offset), 2)

    def _read_group_count(self, buffer: bytes, offset: int, dimension_type: str) -> Tuple[int, int]:
        """Read group count, returns (count, size_of_count_field)"""
        dimension_composite = self.schema.composites.get(dimension_type)
        if dimension_composite:
            num_elem = next((e for e in dimension_composite.elements if e['name'] == 'numInGroup'), None)
            if num_elem:
                prim_type = num_elem.get('primitiveType', 'uint16')
                if prim_type == 'uint32':
                    return (self._read_uint32(buffer, offset), 4)
                elif prim_type == 'uint16':
                    return (self._read_uint16(buffer, offset), 2)
                elif prim_type == 'uint8':
                    return (self._read_uint8(buffer, offset), 1)

        return (self._read_uint16(buffer, offset), 2)


def create_sbe_decoder(schema: SbeSchema) -> SbeDecoder:
    """Create an SBE decoder for a given schema"""
    return SbeDecoder(schema)


def apply_exponent(mantissa: Any, exponent: int) -> float:
    """Convert mantissa and exponent to decimal number"""
    mantissa_num = float(mantissa) if isinstance(mantissa, (int, float)) else float(mantissa)
    return mantissa_num * (10 ** exponent)


def mantissa128_to_number(bytes_data: bytes) -> float:
    """Convert mantissa128 byte array to number"""
    if not bytes_data or len(bytes_data) == 0:
        return 0.0

    result = 0
    multiplier = 1

    # Read up to 8 bytes (64-bit safe range)
    limit = min(len(bytes_data), 8)
    for i in range(limit):
        result += bytes_data[i] * multiplier
        multiplier *= 256

    return float(result)


def decode_sbe_orderbook(buffer: bytes, schema: SbeSchema) -> Dict[str, Any]:
    """Decode an orderbook from SBE binary data"""
    decoder = create_sbe_decoder(schema)
    decoded = decoder.decode(buffer)

    result = {
        'bids': [],
        'asks': [],
        'timestamp': None,
    }

    # Extract timestamp
    if 'tsUs' in decoded:
        result['timestamp'] = decoded['tsUs'] // 1000  # microseconds to milliseconds
    elif 'timestamp' in decoded:
        result['timestamp'] = decoded['timestamp']

    # Get exponents
    px_exponent = decoded.get('pxExponent', 0)
    sz_exponent = decoded.get('szExponent', 0)

    # Convert asks
    if 'asks' in decoded and isinstance(decoded['asks'], list):
        result['asks'] = [
            [
                apply_exponent(ask.get('pxMantissa') or ask.get('price', 0), px_exponent),
                apply_exponent(ask.get('szMantissa') or ask.get('size', 0), sz_exponent),
                ask.get('ordCount', 0)
            ]
            for ask in decoded['asks']
        ]

    # Convert bids
    if 'bids' in decoded and isinstance(decoded['bids'], list):
        result['bids'] = [
            [
                apply_exponent(bid.get('pxMantissa') or bid.get('price', 0), px_exponent),
                apply_exponent(bid.get('szMantissa') or bid.get('size', 0), sz_exponent),
                bid.get('ordCount', 0)
            ]
            for bid in decoded['bids']
        ]

    # Include other fields
    result.update(decoded)

    return result

