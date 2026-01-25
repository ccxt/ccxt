"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class NotionalFilter:
    """SBE message: NotionalFilter."""

    TEMPLATE_ID = 6
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 23

    def __init__(self):
        self.filter_type = None
        self.price_exponent = None
        self.min_notional = None
        self.apply_min_to_market = None
        self.max_notional = None
        self.apply_max_to_market = None
        self.avg_price_mins = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.min_notional is not None:
            buffer.write(struct.pack('<q', self.min_notional))
        if self.max_notional is not None:
            buffer.write(struct.pack('<q', self.max_notional))
        if self.avg_price_mins is not None:
            buffer.write(struct.pack('<i', self.avg_price_mins))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.price_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.min_notional = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.max_notional = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.avg_price_mins = struct.unpack_from('<i', data, pos)[0]
        pos += 4

        # Skip to end of block for forward compatibility
        pos = 23

