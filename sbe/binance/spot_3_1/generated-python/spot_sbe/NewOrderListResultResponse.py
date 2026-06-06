"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Orders:
    """Repeating group item."""

    def __init__(self):
        self.order_id = None

class OrderReports:
    """Repeating group item."""

    def __init__(self):
        self.order_id = None
        self.order_list_id = None
        self.transact_time = None
        self.price = None
        self.orig_qty = None
        self.executed_qty = None
        self.cummulative_quote_qty = None
        self.stop_price = None
        self.trailing_delta = None
        self.trailing_time = None
        self.working_time = None
        self.iceberg_qty = None
        self.strategy_id = None
        self.strategy_type = None
        self.trade_group_id = None
        self.prevented_quantity = None
        self.orig_quote_order_qty = None
        self.peg_offset_value = None
        self.pegged_price = None

class NewOrderListResultResponse:
    """SBE message: NewOrderListResultResponse."""

    TEMPLATE_ID = 310
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 21

    def __init__(self):
        self.order_list_id = None
        self.contingency_type = None
        self.list_status_type = None
        self.list_order_status = None
        self.transaction_time = None
        self.price_exponent = None
        self.qty_exponent = None
        self.orders = []
        self.order_reports = []
        self.list_client_order_id = b''
        self.symbol = b''

    def _decode_orders_group(self, data: bytes, offset: int) -> Tuple[List[Orders], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Orders()

            item.order_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_order_reports_group(self, data: bytes, offset: int) -> Tuple[List[OrderReports], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = OrderReports()

            item.order_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.order_list_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.transact_time = struct.unpack_from('<q', data, pos)[0]
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
            item.working_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.iceberg_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.strategy_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.strategy_type = struct.unpack_from('<i', data, pos)[0]
            pos += 4
            item.trade_group_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.prevented_quantity = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.orig_quote_order_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.peg_offset_value = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.pegged_price = struct.unpack_from('<q', data, pos)[0]
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

        if self.order_list_id is not None:
            buffer.write(struct.pack('<q', self.order_list_id))
        if self.transaction_time is not None:
            buffer.write(struct.pack('<q', self.transaction_time))
        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.order_list_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.transaction_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.price_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1

        # Skip to end of block for forward compatibility
        pos = 21

        self.orders, pos = self._decode_orders_group(data, pos)
        self.order_reports, pos = self._decode_order_reports_group(data, pos)

        self.list_client_order_id, pos = self._decode_var_data(data, pos)
        self.symbol, pos = self._decode_var_data(data, pos)
