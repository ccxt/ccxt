"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class ExecutionReportEvent:
    """SBE message: ExecutionReportEvent."""

    TEMPLATE_ID = 603
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 281

    def __init__(self):
        self.event_time = None
        self.transact_time = None
        self.price_exponent = None
        self.qty_exponent = None
        self.commission_exponent = None
        self.order_creation_time = None
        self.working_time = None
        self.order_id = None
        self.order_list_id = None
        self.orig_qty = None
        self.price = None
        self.orig_quote_order_qty = None
        self.iceberg_qty = None
        self.stop_price = None
        self.order_type = None
        self.side = None
        self.time_in_force = None
        self.execution_type = None
        self.order_status = None
        self.trade_id = None
        self.execution_id = None
        self.executed_qty = None
        self.cummulative_quote_qty = None
        self.last_qty = None
        self.last_price = None
        self.quote_qty = None
        self.commission = None
        self.is_working = None
        self.is_maker = None
        self.is_best_match = None
        self.match_type = None
        self.self_trade_prevention_mode = None
        self.order_capacity = None
        self.working_floor = None
        self.used_sor = None
        self.alloc_id = None
        self.trailing_delta = None
        self.trailing_time = None
        self.trade_group_id = None
        self.prevented_qty = None
        self.last_prevented_qty = None
        self.prevented_match_id = None
        self.prevented_execution_qty = None
        self.prevented_execution_price = None
        self.prevented_execution_quote_qty = None
        self.strategy_type = None
        self.strategy_id = None
        self.counter_order_id = None
        self.subscription_id = None
        self.peg_price_type = None
        self.peg_offset_type = None
        self.peg_offset_value = None
        self.pegged_price = None
        self.symbol = b''
        self.client_order_id = b''
        self.orig_client_order_id = b''
        self.commission_asset = b''
        self.reject_reason = b''
        self.counter_symbol = b''

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
        if self.transact_time is not None:
            buffer.write(struct.pack('<q', self.transact_time))
        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.commission_exponent is not None:
            buffer.write(struct.pack('<b', self.commission_exponent))
        if self.order_creation_time is not None:
            buffer.write(struct.pack('<q', self.order_creation_time))
        if self.working_time is not None:
            buffer.write(struct.pack('<q', self.working_time))
        if self.order_id is not None:
            buffer.write(struct.pack('<q', self.order_id))
        if self.order_list_id is not None:
            buffer.write(struct.pack('<q', self.order_list_id))
        if self.orig_qty is not None:
            buffer.write(struct.pack('<q', self.orig_qty))
        if self.price is not None:
            buffer.write(struct.pack('<q', self.price))
        if self.orig_quote_order_qty is not None:
            buffer.write(struct.pack('<q', self.orig_quote_order_qty))
        if self.iceberg_qty is not None:
            buffer.write(struct.pack('<q', self.iceberg_qty))
        if self.stop_price is not None:
            buffer.write(struct.pack('<q', self.stop_price))
        if self.trade_id is not None:
            buffer.write(struct.pack('<q', self.trade_id))
        if self.execution_id is not None:
            buffer.write(struct.pack('<q', self.execution_id))
        if self.executed_qty is not None:
            buffer.write(struct.pack('<q', self.executed_qty))
        if self.cummulative_quote_qty is not None:
            buffer.write(struct.pack('<q', self.cummulative_quote_qty))
        if self.last_qty is not None:
            buffer.write(struct.pack('<q', self.last_qty))
        if self.last_price is not None:
            buffer.write(struct.pack('<q', self.last_price))
        if self.quote_qty is not None:
            buffer.write(struct.pack('<q', self.quote_qty))
        if self.commission is not None:
            buffer.write(struct.pack('<q', self.commission))
        if self.alloc_id is not None:
            buffer.write(struct.pack('<q', self.alloc_id))
        if self.trailing_delta is not None:
            buffer.write(struct.pack('<Q', self.trailing_delta))
        if self.trailing_time is not None:
            buffer.write(struct.pack('<q', self.trailing_time))
        if self.trade_group_id is not None:
            buffer.write(struct.pack('<q', self.trade_group_id))
        if self.prevented_qty is not None:
            buffer.write(struct.pack('<q', self.prevented_qty))
        if self.last_prevented_qty is not None:
            buffer.write(struct.pack('<q', self.last_prevented_qty))
        if self.prevented_match_id is not None:
            buffer.write(struct.pack('<q', self.prevented_match_id))
        if self.prevented_execution_qty is not None:
            buffer.write(struct.pack('<q', self.prevented_execution_qty))
        if self.prevented_execution_price is not None:
            buffer.write(struct.pack('<q', self.prevented_execution_price))
        if self.prevented_execution_quote_qty is not None:
            buffer.write(struct.pack('<q', self.prevented_execution_quote_qty))
        if self.strategy_type is not None:
            buffer.write(struct.pack('<i', self.strategy_type))
        if self.strategy_id is not None:
            buffer.write(struct.pack('<q', self.strategy_id))
        if self.counter_order_id is not None:
            buffer.write(struct.pack('<q', self.counter_order_id))
        if self.subscription_id is not None:
            buffer.write(struct.pack('<H', self.subscription_id))
        if self.peg_offset_value is not None:
            buffer.write(struct.pack('<B', self.peg_offset_value))
        if self.pegged_price is not None:
            buffer.write(struct.pack('<q', self.pegged_price))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.event_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.transact_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.price_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.commission_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.order_creation_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.working_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.order_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.order_list_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.orig_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.orig_quote_order_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.iceberg_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.stop_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.trade_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.execution_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.executed_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.cummulative_quote_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.last_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.last_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.quote_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.commission = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.alloc_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.trailing_delta = struct.unpack_from('<Q', data, pos)[0]
        pos += 8
        self.trailing_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.trade_group_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.prevented_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.last_prevented_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.prevented_match_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.prevented_execution_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.prevented_execution_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.prevented_execution_quote_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.strategy_type = struct.unpack_from('<i', data, pos)[0]
        pos += 4
        self.strategy_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.counter_order_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.subscription_id = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        self.peg_offset_value = struct.unpack_from('<B', data, pos)[0]
        pos += 1
        self.pegged_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 281


        self.symbol, pos = self._decode_var_data(data, pos)
        self.client_order_id, pos = self._decode_var_data(data, pos)
        self.orig_client_order_id, pos = self._decode_var_data(data, pos)
        self.commission_asset, pos = self._decode_var_data(data, pos)
        self.reject_reason, pos = self._decode_var_data(data, pos)
        self.counter_symbol, pos = self._decode_var_data(data, pos)
