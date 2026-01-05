"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class WebSocketResponse:
    """SBE message: WebSocketResponse."""

    TEMPLATE_ID = 50
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 3

    def __init__(self):
        self.sbe_schema_id_version_deprecated = None
        self.status = None
        self.rate_limits = []
        self.id = b''
        self.result = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.status is not None:
            buffer.write(struct.pack('<H', self.status))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.status = struct.unpack('<H', buffer.read(2))[0]
