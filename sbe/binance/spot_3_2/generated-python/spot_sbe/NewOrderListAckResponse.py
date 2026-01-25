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

class NewOrderListAckResponse:
    """SBE message: NewOrderListAckResponse."""

    TEMPLATE_ID = 309
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 19

    def __init__(self):
        self.order_list_id = None
        self.contingency_type = None
        self.list_status_type = None
        self.list_order_status = None
        self.transaction_time = None
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

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.order_list_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.transaction_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 19

        self.orders, pos = self._decode_orders_group(data, pos)
        self.order_reports, pos = self._decode_order_reports_group(data, pos)

        self.list_client_order_id, pos = self._decode_var_data(data, pos)
        self.symbol, pos = self._decode_var_data(data, pos)
