"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class MarketLotSizeFilter:
    """SBE message: MarketLotSizeFilter."""

    TEMPLATE_ID = 8
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 25

    def __init__(self):
        self.filter_type = None
        self.qty_exponent = None
        self.min_qty = None
        self.max_qty = None
        self.step_size = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.min_qty is not None:
            buffer.write(struct.pack('<q', self.min_qty))
        if self.max_qty is not None:
            buffer.write(struct.pack('<q', self.max_qty))
        if self.step_size is not None:
            buffer.write(struct.pack('<q', self.step_size))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.qty_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.min_qty = struct.unpack('<q', buffer.read(8))[0]
        self.max_qty = struct.unpack('<q', buffer.read(8))[0]
        self.step_size = struct.unpack('<q', buffer.read(8))[0]
