"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class PercentPriceFilter:
    """SBE message: PercentPriceFilter."""

    TEMPLATE_ID = 2
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
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
        buffer = BytesIO(data)

        self.multiplier_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.multiplier_up = struct.unpack('<q', buffer.read(8))[0]
        self.multiplier_down = struct.unpack('<q', buffer.read(8))[0]
        self.avg_price_mins = struct.unpack('<i', buffer.read(4))[0]
