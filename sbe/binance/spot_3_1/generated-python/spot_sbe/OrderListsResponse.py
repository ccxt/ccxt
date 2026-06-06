"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class OrderLists:
    """Repeating group item."""

    def __init__(self):
        self.order_list_id = None
        self.transaction_time = None
        self.order_id = None

class OrderListsResponse:
    """SBE message: OrderListsResponse."""

    TEMPLATE_ID = 314
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 0

    def __init__(self):
        self.order_lists = []

    def _decode_order_lists_group(self, data: bytes, offset: int) -> Tuple[List[OrderLists], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = OrderLists()

            item.order_list_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.transaction_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.order_id = struct.unpack_from('<q', data, pos)[0]
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

        self.order_lists, pos = self._decode_order_lists_group(data, pos)
