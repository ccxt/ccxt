"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

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
        buffer = BytesIO(data)

        self.transact_time = struct.unpack('<q', buffer.read(8))[0]
        self.execution_id = struct.unpack('<q', buffer.read(8))[0]
        self.price_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.qty_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.order_id = struct.unpack('<q', buffer.read(8))[0]
        self.order_list_id = struct.unpack('<q', buffer.read(8))[0]
        self.price = struct.unpack('<q', buffer.read(8))[0]
        self.qty = struct.unpack('<q', buffer.read(8))[0]
        self.executed_qty = struct.unpack('<q', buffer.read(8))[0]
        self.prevented_qty = struct.unpack('<q', buffer.read(8))[0]
        self.cumulative_quote_qty = struct.unpack('<q', buffer.read(8))[0]
        self.stop_price = struct.unpack('<q', buffer.read(8))[0]
        self.trailing_delta = struct.unpack('<q', buffer.read(8))[0]
        self.trailing_time = struct.unpack('<q', buffer.read(8))[0]
        self.iceberg_qty = struct.unpack('<q', buffer.read(8))[0]
        self.working_time = struct.unpack('<q', buffer.read(8))[0]
        self.strategy_id = struct.unpack('<q', buffer.read(8))[0]
        self.strategy_type = struct.unpack('<i', buffer.read(4))[0]
        self.peg_offset_value = struct.unpack('<B', buffer.read(1))[0]
        self.pegged_price = struct.unpack('<q', buffer.read(8))[0]
