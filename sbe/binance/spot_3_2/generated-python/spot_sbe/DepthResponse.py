"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class DepthResponse:
    """SBE message: DepthResponse."""

    TEMPLATE_ID = 200
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 10

    def __init__(self):
        self.last_update_id = None
        self.price_exponent = None
        self.qty_exponent = None
        self.bids = []
        self.asks = []

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.last_update_id is not None:
            buffer.write(struct.pack('<q', self.last_update_id))
        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.last_update_id = struct.unpack('<q', buffer.read(8))[0]
        self.price_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.qty_exponent = struct.unpack('<b', buffer.read(1))[0]
