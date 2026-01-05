"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class TrailingDeltaFilter:
    """SBE message: TrailingDeltaFilter."""

    TEMPLATE_ID = 13
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 32

    def __init__(self):
        self.filter_type = None
        self.min_trailing_above_delta = None
        self.max_trailing_above_delta = None
        self.min_trailing_below_delta = None
        self.max_trailing_below_delta = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.min_trailing_above_delta is not None:
            buffer.write(struct.pack('<q', self.min_trailing_above_delta))
        if self.max_trailing_above_delta is not None:
            buffer.write(struct.pack('<q', self.max_trailing_above_delta))
        if self.min_trailing_below_delta is not None:
            buffer.write(struct.pack('<q', self.min_trailing_below_delta))
        if self.max_trailing_below_delta is not None:
            buffer.write(struct.pack('<q', self.max_trailing_below_delta))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.min_trailing_above_delta = struct.unpack('<q', buffer.read(8))[0]
        self.max_trailing_above_delta = struct.unpack('<q', buffer.read(8))[0]
        self.min_trailing_below_delta = struct.unpack('<q', buffer.read(8))[0]
        self.max_trailing_below_delta = struct.unpack('<q', buffer.read(8))[0]
