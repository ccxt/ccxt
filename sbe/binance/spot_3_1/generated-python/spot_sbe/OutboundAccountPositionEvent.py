"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Balances:
    """Repeating group item."""

    def __init__(self):
        self.exponent = None
        self.free = None
        self.locked = None

class OutboundAccountPositionEvent:
    """SBE message: OutboundAccountPositionEvent."""

    TEMPLATE_ID = 607
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 18

    def __init__(self):
        self.event_time = None
        self.update_time = None
        self.subscription_id = None
        self.balances = []

    def _decode_balances_group(self, data: bytes, offset: int) -> Tuple[List[Balances], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Balances()

            item.exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.free = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.locked = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.event_time is not None:
            buffer.write(struct.pack('<q', self.event_time))
        if self.update_time is not None:
            buffer.write(struct.pack('<q', self.update_time))
        if self.subscription_id is not None:
            buffer.write(struct.pack('<H', self.subscription_id))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.event_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.update_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.subscription_id = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        # Skip to end of block for forward compatibility
        pos = 18

        self.balances, pos = self._decode_balances_group(data, pos)
