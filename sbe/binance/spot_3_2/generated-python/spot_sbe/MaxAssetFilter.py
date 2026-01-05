"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class MaxAssetFilter:
    """SBE message: MaxAssetFilter."""

    TEMPLATE_ID = 21
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 9

    def __init__(self):
        self.filter_type = None
        self.qty_exponent = None
        self.max_qty = None
        self.asset = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.max_qty is not None:
            buffer.write(struct.pack('<q', self.max_qty))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.qty_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.max_qty = struct.unpack('<q', buffer.read(8))[0]
