"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class BalanceUpdateEvent:
    """SBE message: BalanceUpdateEvent."""

    TEMPLATE_ID = 601
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 27

    def __init__(self):
        self.event_time = None
        self.clear_time = None
        self.qty_exponent = None
        self.free_qty_delta = None
        self.subscription_id = None
        self.asset = b''

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

        if self.event_time is not None:
            buffer.write(struct.pack('<q', self.event_time))
        if self.clear_time is not None:
            buffer.write(struct.pack('<q', self.clear_time))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.free_qty_delta is not None:
            buffer.write(struct.pack('<q', self.free_qty_delta))
        if self.subscription_id is not None:
            buffer.write(struct.pack('<H', self.subscription_id))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.event_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.clear_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.free_qty_delta = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.subscription_id = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        # Skip to end of block for forward compatibility
        pos = 27


        self.asset, pos = self._decode_var_data(data, pos)
