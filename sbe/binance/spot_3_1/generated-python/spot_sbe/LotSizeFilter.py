"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class LotSizeFilter:
    """SBE message: LotSizeFilter."""

    TEMPLATE_ID = 4
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
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
        pos = 0

        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.min_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.max_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.step_size = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 25

