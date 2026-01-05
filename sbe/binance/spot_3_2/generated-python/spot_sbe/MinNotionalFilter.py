"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class MinNotionalFilter:
    """SBE message: MinNotionalFilter."""

    TEMPLATE_ID = 5
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 14

    def __init__(self):
        self.filter_type = None
        self.price_exponent = None
        self.min_notional = None
        self.apply_to_market = None
        self.avg_price_mins = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.min_notional is not None:
            buffer.write(struct.pack('<q', self.min_notional))
        if self.avg_price_mins is not None:
            buffer.write(struct.pack('<i', self.avg_price_mins))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.price_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.min_notional = struct.unpack('<q', buffer.read(8))[0]
        self.avg_price_mins = struct.unpack('<i', buffer.read(4))[0]
