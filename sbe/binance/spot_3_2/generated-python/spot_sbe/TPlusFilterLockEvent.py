"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class UnlockData:
    """Repeating group item."""

    def __init__(self):
        self.unlock_time = None
        self.qty = None

class TPlusFilterLockEvent:
    """SBE message: TPlusFilterLockEvent."""

    TEMPLATE_ID = 608
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 11

    def __init__(self):
        self.event_time = None
        self.qty_exponent = None
        self.subscription_id = None
        self.unlock_data = []
        self.symbol = b''
        self.base_asset = b''

    def _decode_unlock_data_group(self, data: bytes, offset: int) -> Tuple[List[UnlockData], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = UnlockData()

            item.unlock_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.qty = struct.unpack_from('<q', data, pos)[0]
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

        if self.event_time is not None:
            buffer.write(struct.pack('<q', self.event_time))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.subscription_id is not None:
            buffer.write(struct.pack('<H', self.subscription_id))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.event_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.subscription_id = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        # Skip to end of block for forward compatibility
        pos = 11

        self.unlock_data, pos = self._decode_unlock_data_group(data, pos)

        self.symbol, pos = self._decode_var_data(data, pos)
        self.base_asset, pos = self._decode_var_data(data, pos)
