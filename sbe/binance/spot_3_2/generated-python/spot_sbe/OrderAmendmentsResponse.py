"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Amendments:
    """Repeating group item."""

    def __init__(self):
        self.order_id = None
        self.execution_id = None
        self.qty_exponent = None
        self.orig_qty = None
        self.new_qty = None
        self.time = None

class OrderAmendmentsResponse:
    """SBE message: OrderAmendmentsResponse."""

    TEMPLATE_ID = 316
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 0

    def __init__(self):
        self.amendments = []

    def _decode_amendments_group(self, data: bytes, offset: int) -> Tuple[List[Amendments], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Amendments()

            item.order_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.execution_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.qty_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.orig_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.new_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.time = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()


        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0


        # Skip to end of block for forward compatibility
        pos = 0

        self.amendments, pos = self._decode_amendments_group(data, pos)
