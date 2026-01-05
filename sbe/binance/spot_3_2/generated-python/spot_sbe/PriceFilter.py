"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class PriceFilter:
    """SBE message: PriceFilter."""

    TEMPLATE_ID = 1
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 25

    def __init__(self):
        self.filter_type = None
        self.price_exponent = None
        self.min_price = None
        self.max_price = None
        self.tick_size = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.min_price is not None:
            buffer.write(struct.pack('<q', self.min_price))
        if self.max_price is not None:
            buffer.write(struct.pack('<q', self.max_price))
        if self.tick_size is not None:
            buffer.write(struct.pack('<q', self.tick_size))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.price_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.min_price = struct.unpack('<q', buffer.read(8))[0]
        self.max_price = struct.unpack('<q', buffer.read(8))[0]
        self.tick_size = struct.unpack('<q', buffer.read(8))[0]
