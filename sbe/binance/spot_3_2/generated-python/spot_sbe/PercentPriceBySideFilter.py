"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class PercentPriceBySideFilter:
    """SBE message: PercentPriceBySideFilter."""

    TEMPLATE_ID = 3
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 37

    def __init__(self):
        self.filter_type = None
        self.multiplier_exponent = None
        self.bid_multiplier_up = None
        self.bid_multiplier_down = None
        self.ask_multiplier_up = None
        self.ask_multiplier_down = None
        self.avg_price_mins = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.multiplier_exponent is not None:
            buffer.write(struct.pack('<b', self.multiplier_exponent))
        if self.bid_multiplier_up is not None:
            buffer.write(struct.pack('<q', self.bid_multiplier_up))
        if self.bid_multiplier_down is not None:
            buffer.write(struct.pack('<q', self.bid_multiplier_down))
        if self.ask_multiplier_up is not None:
            buffer.write(struct.pack('<q', self.ask_multiplier_up))
        if self.ask_multiplier_down is not None:
            buffer.write(struct.pack('<q', self.ask_multiplier_down))
        if self.avg_price_mins is not None:
            buffer.write(struct.pack('<i', self.avg_price_mins))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.multiplier_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.bid_multiplier_up = struct.unpack('<q', buffer.read(8))[0]
        self.bid_multiplier_down = struct.unpack('<q', buffer.read(8))[0]
        self.ask_multiplier_up = struct.unpack('<q', buffer.read(8))[0]
        self.ask_multiplier_down = struct.unpack('<q', buffer.read(8))[0]
        self.avg_price_mins = struct.unpack('<i', buffer.read(4))[0]
