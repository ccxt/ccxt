"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class ExchangeMaxNumOrderListsFilter:
    """SBE message: ExchangeMaxNumOrderListsFilter."""

    TEMPLATE_ID = 19
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 8

    def __init__(self):
        self.filter_type = None
        self.max_num_order_lists = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.max_num_order_lists is not None:
            buffer.write(struct.pack('<q', self.max_num_order_lists))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.max_num_order_lists = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 8

