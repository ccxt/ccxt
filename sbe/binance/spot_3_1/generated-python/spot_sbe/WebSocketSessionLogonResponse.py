"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class WebSocketSessionLogonResponse:
    """SBE message: WebSocketSessionLogonResponse."""

    TEMPLATE_ID = 51
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 26

    def __init__(self):
        self.authorized_since = None
        self.connected_since = None
        self.return_rate_limits = None
        self.server_time = None
        self.user_data_stream = None
        self.logged_on_api_key = b''

    def _decode_var_data(self, data: bytes, offset: int) -> Tuple[bytes, int]:
        """Decode variable-length binary data."""
        pos = offset
        length = struct.unpack_from('<I', data, pos)[0]
        pos += 4
        value = data[pos:pos+length]
        pos += length
        return (value, pos)

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
        pos = 0

        self.authorized_since = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.connected_since = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.server_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 26


        self.logged_on_api_key, pos = self._decode_var_data(data, pos)
