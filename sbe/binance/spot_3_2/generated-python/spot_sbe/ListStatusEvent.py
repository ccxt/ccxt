"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class ListStatusEvent:
    """SBE message: ListStatusEvent."""

    TEMPLATE_ID = 606
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 29

    def __init__(self):
        self.event_time = None
        self.transact_time = None
        self.order_list_id = None
        self.contingency_type = None
        self.list_status_type = None
        self.list_order_status = None
        self.subscription_id = None
        self.orders = []
        self.symbol = b''
        self.list_client_order_id = b''
        self.reject_reason = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.event_time is not None:
            buffer.write(struct.pack('<q', self.event_time))
        if self.transact_time is not None:
            buffer.write(struct.pack('<q', self.transact_time))
        if self.order_list_id is not None:
            buffer.write(struct.pack('<q', self.order_list_id))
        if self.subscription_id is not None:
            buffer.write(struct.pack('<H', self.subscription_id))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.event_time = struct.unpack('<q', buffer.read(8))[0]
        self.transact_time = struct.unpack('<q', buffer.read(8))[0]
        self.order_list_id = struct.unpack('<q', buffer.read(8))[0]
        self.subscription_id = struct.unpack('<H', buffer.read(2))[0]
