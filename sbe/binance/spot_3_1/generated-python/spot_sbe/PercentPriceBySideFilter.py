"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class PercentPriceBySideFilter:
    """SBE message: PercentPriceBySideFilter."""

    TEMPLATE_ID = 3
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
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
        pos = 0

        self.multiplier_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.bid_multiplier_up = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.bid_multiplier_down = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.ask_multiplier_up = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.ask_multiplier_down = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.avg_price_mins = struct.unpack_from('<i', data, pos)[0]
        pos += 4

        # Skip to end of block for forward compatibility
        pos = 37

