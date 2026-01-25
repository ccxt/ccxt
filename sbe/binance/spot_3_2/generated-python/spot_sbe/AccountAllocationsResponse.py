"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Allocations:
    """Repeating group item."""

    def __init__(self):
        self.price_exponent = None
        self.qty_exponent = None
        self.commission_exponent = None
        self.allocation_id = None
        self.order_id = None
        self.order_list_id = None
        self.source_trade_id = None
        self.source_allocation_id = None
        self.price = None
        self.qty = None
        self.quote_qty = None
        self.commission = None
        self.time = None

class AccountAllocationsResponse:
    """SBE message: AccountAllocationsResponse."""

    TEMPLATE_ID = 404
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 0

    def __init__(self):
        self.allocations = []

    def _decode_allocations_group(self, data: bytes, offset: int) -> Tuple[List[Allocations], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Allocations()

            item.price_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.qty_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.commission_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.allocation_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.order_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.order_list_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.source_trade_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.source_allocation_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.quote_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.commission = struct.unpack_from('<q', data, pos)[0]
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

        self.allocations, pos = self._decode_allocations_group(data, pos)
