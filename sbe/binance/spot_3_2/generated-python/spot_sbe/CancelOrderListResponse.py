"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class CancelOrderListResponse:
    """SBE message: CancelOrderListResponse."""

    TEMPLATE_ID = 312
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
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
        buffer = BytesIO(data)

        self.order_list_id = struct.unpack('<q', buffer.read(8))[0]
        self.transaction_time = struct.unpack('<q', buffer.read(8))[0]
        self.price_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.qty_exponent = struct.unpack('<b', buffer.read(1))[0]
