"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class IcebergPartsFilter:
    """SBE message: IcebergPartsFilter."""

    TEMPLATE_ID = 7
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 8

    def __init__(self):
        self.filter_type = None
        self.filter_limit = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.filter_limit is not None:
            buffer.write(struct.pack('<q', self.filter_limit))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.filter_limit = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 8

