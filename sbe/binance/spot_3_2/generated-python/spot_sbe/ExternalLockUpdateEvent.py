"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class ExternalLockUpdateEvent:
    """SBE message: ExternalLockUpdateEvent."""

    TEMPLATE_ID = 604
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 27

    def __init__(self):
        self.event_time = None
        self.clear_time = None
        self.qty_exponent = None
        self.locked_qty_delta = None
        self.subscription_id = None
        self.asset = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.event_time is not None:
            buffer.write(struct.pack('<q', self.event_time))
        if self.clear_time is not None:
            buffer.write(struct.pack('<q', self.clear_time))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.locked_qty_delta is not None:
            buffer.write(struct.pack('<q', self.locked_qty_delta))
        if self.subscription_id is not None:
            buffer.write(struct.pack('<H', self.subscription_id))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.event_time = struct.unpack('<q', buffer.read(8))[0]
        self.clear_time = struct.unpack('<q', buffer.read(8))[0]
        self.qty_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.locked_qty_delta = struct.unpack('<q', buffer.read(8))[0]
        self.subscription_id = struct.unpack('<H', buffer.read(2))[0]
