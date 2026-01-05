"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class IcebergPartsFilter:
    """SBE message: IcebergPartsFilter."""

    TEMPLATE_ID = 7
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
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
        buffer = BytesIO(data)

        self.filter_limit = struct.unpack('<q', buffer.read(8))[0]
