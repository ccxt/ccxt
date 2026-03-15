"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class ListStatus:
    """Repeating group item."""

    def __init__(self):
        self.order_list_id = None
        self.order_id = None

class RelatedOrders:
    """Repeating group item."""

    def __init__(self):
        self.order_id = None
        self.order_list_id = None
        self.price = None
        self.qty = None
        self.executed_qty = None
        self.prevented_qty = None
        self.cumulative_quote_qty = None
        self.stop_price = None
        self.trailing_delta = None
        self.trailing_time = None
        self.iceberg_qty = None
        self.working_time = None
        self.strategy_id = None
        self.strategy_type = None
        self.peg_offset_value = None
        self.pegged_price = None

class OrderAmendKeepPriorityResponse:
    """SBE message: OrderAmendKeepPriorityResponse."""

    TEMPLATE_ID = 317
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 145

    def __init__(self):
        self.transact_time = None
        self.execution_id = None
        self.price_exponent = None
        self.qty_exponent = None
        self.order_id = None
        self.order_list_id = None
        self.price = None
        self.qty = None
        self.executed_qty = None
        self.prevented_qty = None
        self.cumulative_quote_qty = None
        self.status = None
        self.time_in_force = None
        self.order_type = None
        self.side = None
        self.stop_price = None
        self.trailing_delta = None
        self.trailing_time = None
        self.iceberg_qty = None
        self.working_time = None
        self.strategy_id = None
        self.strategy_type = None
        self.order_capacity = None
        self.working_floor = None
        self.self_trade_prevention_mode = None
        self.used_sor = None
        self.peg_price_type = None
        self.peg_offset_type = None
        self.peg_offset_value = None
        self.pegged_price = None
        self.list_status = []
        self.related_orders = []
        self.symbol = b''
        self.orig_client_order_id = b''
        self.client_order_id = b''

    def _decode_list_status_group(self, data: bytes, offset: int) -> Tuple[List[ListStatus], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = ListStatus()

            item.order_list_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.order_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_related_orders_group(self, data: bytes, offset: int) -> Tuple[List[RelatedOrders], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = RelatedOrders()

            item.order_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.order_list_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.executed_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.prevented_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.cumulative_quote_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.stop_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.trailing_delta = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.trailing_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.iceberg_qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.working_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.strategy_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.strategy_type = struct.unpack_from('<i', data, pos)[0]
            pos += 4
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

        if self.transact_time is not None:
            buffer.write(struct.pack('<q', self.transact_time))
        if self.execution_id is not None:
            buffer.write(struct.pack('<q', self.execution_id))
        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.order_id is not None:
            buffer.write(struct.pack('<q', self.order_id))
        if self.order_list_id is not None:
            buffer.write(struct.pack('<q', self.order_list_id))
        if self.price is not None:
            buffer.write(struct.pack('<q', self.price))
        if self.qty is not None:
            buffer.write(struct.pack('<q', self.qty))
        if self.executed_qty is not None:
            buffer.write(struct.pack('<q', self.executed_qty))
        if self.prevented_qty is not None:
            buffer.write(struct.pack('<q', self.prevented_qty))
        if self.cumulative_quote_qty is not None:
            buffer.write(struct.pack('<q', self.cumulative_quote_qty))
        if self.stop_price is not None:
            buffer.write(struct.pack('<q', self.stop_price))
        if self.trailing_delta is not None:
            buffer.write(struct.pack('<q', self.trailing_delta))
        if self.trailing_time is not None:
            buffer.write(struct.pack('<q', self.trailing_time))
        if self.iceberg_qty is not None:
            buffer.write(struct.pack('<q', self.iceberg_qty))
        if self.working_time is not None:
            buffer.write(struct.pack('<q', self.working_time))
        if self.strategy_id is not None:
            buffer.write(struct.pack('<q', self.strategy_id))
        if self.strategy_type is not None:
            buffer.write(struct.pack('<i', self.strategy_type))
        if self.peg_offset_value is not None:
            buffer.write(struct.pack('<B', self.peg_offset_value))
        if self.pegged_price is not None:
            buffer.write(struct.pack('<q', self.pegged_price))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.transact_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.execution_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.price_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.order_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.order_list_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.executed_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.prevented_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.cumulative_quote_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.stop_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.trailing_delta = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.trailing_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.iceberg_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.working_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.strategy_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.strategy_type = struct.unpack_from('<i', data, pos)[0]
        pos += 4
        self.peg_offset_value = struct.unpack_from('<B', data, pos)[0]
        pos += 1
        self.pegged_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 145

        self.list_status, pos = self._decode_list_status_group(data, pos)
        self.related_orders, pos = self._decode_related_orders_group(data, pos)

        self.symbol, pos = self._decode_var_data(data, pos)
        self.orig_client_order_id, pos = self._decode_var_data(data, pos)
        self.client_order_id, pos = self._decode_var_data(data, pos)
