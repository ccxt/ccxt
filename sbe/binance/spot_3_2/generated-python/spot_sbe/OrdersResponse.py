"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Orders:
    """Repeating group item."""

    def __init__(self):
        self.price_exponent = None
        self.qty_exponent = None
        self.order_id = None
        self.order_list_id = None
        self.price = None
        self.orig_qty = None
        self.executed_qty = None
        self.cummulative_quote_qty = None
        self.stop_price = None
        self.trailing_delta = None
        self.trailing_time = None
        self.iceberg_qty = None
        self.time = None
        self.update_time = None
        self.working_time = None
        self.orig_quote_order_qty = None
        self.strategy_id = None
        self.strategy_type = None
        self.prevented_match_id = None
        self.prevented_quantity = None
        self.peg_offset_value = None
        self.pegged_price = None

class OrdersResponse:
    """SBE message: OrdersResponse."""

    TEMPLATE_ID = 308
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 0

    def __init__(self):
        self.orders = []

    def _decode_orders_group(self, data: bytes, offset: int) -> Tuple[List[Orders], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Orders()

            item.price_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.qty_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.order_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.order_list_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.orig_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.executed_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.cummulative_quote_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.stop_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.trailing_delta = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.trailing_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.iceberg_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.update_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.working_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.orig_quote_order_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.strategy_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.strategy_type = struct.unpack_from('<i', data, pos)[0]
            pos += 4
            item.prevented_match_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.prevented_quantity = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.peg_offset_value = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.pegged_price = struct.unpack_from('<q', data, pos)[0]
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

        self.orders, pos = self._decode_orders_group(data, pos)
