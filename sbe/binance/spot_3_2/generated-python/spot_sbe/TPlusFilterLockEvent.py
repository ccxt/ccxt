"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class TPlusFilterLockEvent:
    """SBE message: TPlusFilterLockEvent."""

    TEMPLATE_ID = 608
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 11

    def __init__(self):
        self.event_time = None
        self.qty_exponent = None
        self.subscription_id = None
        self.unlock_data = []
        self.symbol = b''
        self.base_asset = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.event_time is not None:
            buffer.write(struct.pack('<q', self.event_time))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.subscription_id is not None:
            buffer.write(struct.pack('<H', self.subscription_id))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.event_time = struct.unpack('<q', buffer.read(8))[0]
        self.qty_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.subscription_id = struct.unpack('<H', buffer.read(2))[0]
