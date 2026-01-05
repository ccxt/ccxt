"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class NewOrderAckResponse:
    """SBE message: NewOrderAckResponse."""

    TEMPLATE_ID = 300
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 24

    def __init__(self):
        self.order_id = None
        self.order_list_id = None
        self.transact_time = None
        self.symbol = b''
        self.client_order_id = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.order_id is not None:
            buffer.write(struct.pack('<q', self.order_id))
        if self.order_list_id is not None:
            buffer.write(struct.pack('<q', self.order_list_id))
        if self.transact_time is not None:
            buffer.write(struct.pack('<q', self.transact_time))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.order_id = struct.unpack('<q', buffer.read(8))[0]
        self.order_list_id = struct.unpack('<q', buffer.read(8))[0]
        self.transact_time = struct.unpack('<q', buffer.read(8))[0]
