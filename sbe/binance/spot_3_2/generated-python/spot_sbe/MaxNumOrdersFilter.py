"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class MaxNumOrdersFilter:
    """SBE message: MaxNumOrdersFilter."""

    TEMPLATE_ID = 9
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 8

    def __init__(self):
        self.filter_type = None
        self.max_num_orders = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.max_num_orders is not None:
            buffer.write(struct.pack('<q', self.max_num_orders))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.max_num_orders = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 8

