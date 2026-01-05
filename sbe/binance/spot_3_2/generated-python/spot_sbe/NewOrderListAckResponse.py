"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

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
        buffer = BytesIO(data)

        self.order_list_id = struct.unpack('<q', buffer.read(8))[0]
        self.transaction_time = struct.unpack('<q', buffer.read(8))[0]
