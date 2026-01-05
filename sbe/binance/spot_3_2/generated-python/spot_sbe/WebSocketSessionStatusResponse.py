"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class WebSocketSessionStatusResponse:
    """SBE message: WebSocketSessionStatusResponse."""

    TEMPLATE_ID = 52
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 26

    def __init__(self):
        self.authorized_since = None
        self.connected_since = None
        self.return_rate_limits = None
        self.server_time = None
        self.user_data_stream = None
        self.logged_on_api_key = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.authorized_since is not None:
            buffer.write(struct.pack('<q', self.authorized_since))
        if self.connected_since is not None:
            buffer.write(struct.pack('<q', self.connected_since))
        if self.server_time is not None:
            buffer.write(struct.pack('<q', self.server_time))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.authorized_since = struct.unpack('<q', buffer.read(8))[0]
        self.connected_since = struct.unpack('<q', buffer.read(8))[0]
        self.server_time = struct.unpack('<q', buffer.read(8))[0]
