"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class PercentPriceFilter:
    """SBE message: PercentPriceFilter."""

    TEMPLATE_ID = 2
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 21

    def __init__(self):
        self.filter_type = None
        self.multiplier_exponent = None
        self.multiplier_up = None
        self.multiplier_down = None
        self.avg_price_mins = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.multiplier_exponent is not None:
            buffer.write(struct.pack('<b', self.multiplier_exponent))
        if self.multiplier_up is not None:
            buffer.write(struct.pack('<q', self.multiplier_up))
        if self.multiplier_down is not None:
            buffer.write(struct.pack('<q', self.multiplier_down))
        if self.avg_price_mins is not None:
            buffer.write(struct.pack('<i', self.avg_price_mins))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.multiplier_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.multiplier_up = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.multiplier_down = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.avg_price_mins = struct.unpack_from('<i', data, pos)[0]
        pos += 4

        # Skip to end of block for forward compatibility
        pos = 21

