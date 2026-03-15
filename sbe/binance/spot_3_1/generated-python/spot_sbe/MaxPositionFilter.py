"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class MaxPositionFilter:
    """SBE message: MaxPositionFilter."""

    TEMPLATE_ID = 12
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 9

    def __init__(self):
        self.filter_type = None
        self.qty_exponent = None
        self.max_position = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.max_position is not None:
            buffer.write(struct.pack('<q', self.max_position))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.max_position = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 9

