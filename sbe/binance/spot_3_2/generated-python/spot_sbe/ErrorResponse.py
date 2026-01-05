"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class ErrorResponse:
    """SBE message: ErrorResponse."""

    TEMPLATE_ID = 100
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 18

    def __init__(self):
        self.code = None
        self.server_time = None
        self.retry_after = None
        self.msg = b''
        self.data = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.code is not None:
            buffer.write(struct.pack('<h', self.code))
        if self.server_time is not None:
            buffer.write(struct.pack('<q', self.server_time))
        if self.retry_after is not None:
            buffer.write(struct.pack('<q', self.retry_after))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.code = struct.unpack('<h', buffer.read(2))[0]
        self.server_time = struct.unpack('<q', buffer.read(8))[0]
        self.retry_after = struct.unpack('<q', buffer.read(8))[0]
