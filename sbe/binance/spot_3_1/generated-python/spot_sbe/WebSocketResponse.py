"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class RateLimits:
    """Repeating group item."""

    def __init__(self):
        self.interval_num = None
        self.rate_limit = None
        self.current = None

class WebSocketResponse:
    """SBE message: WebSocketResponse."""

    TEMPLATE_ID = 50
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 3

    def __init__(self):
        self.sbe_schema_id_version_deprecated = None
        self.status = None
        self.rate_limits = []
        self.id = b''
        self.result = b''

    def _decode_rate_limits_group(self, data: bytes, offset: int) -> Tuple[List[RateLimits], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = RateLimits()

            item.interval_num = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.rate_limit = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.current = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_var_data(self, data: bytes, offset: int) -> Tuple[bytes, int]:
        """Decode variable-length binary data."""
        pos = offset
        length = struct.unpack_from('<I', data, pos)[0]
        pos += 4
        value = data[pos:pos+length]
        pos += length
        return (value, pos)

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.status is not None:
            buffer.write(struct.pack('<H', self.status))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.status = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        # Skip to end of block for forward compatibility
        pos = 3

        self.rate_limits, pos = self._decode_rate_limits_group(data, pos)

        self.id, pos = self._decode_var_data(data, pos)
        self.result, pos = self._decode_var_data(data, pos)
