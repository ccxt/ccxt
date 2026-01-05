"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class AveragePriceResponse:
    """SBE message: AveragePriceResponse."""

    TEMPLATE_ID = 204
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 25

    def __init__(self):
        self.mins = None
        self.price_exponent = None
        self.price = None
        self.close_time = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.mins is not None:
            buffer.write(struct.pack('<q', self.mins))
        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.price is not None:
            buffer.write(struct.pack('<q', self.price))
        if self.close_time is not None:
            buffer.write(struct.pack('<q', self.close_time))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.mins = struct.unpack('<q', buffer.read(8))[0]
        self.price_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.price = struct.unpack('<q', buffer.read(8))[0]
        self.close_time = struct.unpack('<q', buffer.read(8))[0]
