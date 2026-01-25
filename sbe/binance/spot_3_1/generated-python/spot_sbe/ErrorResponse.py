"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class ErrorResponse:
    """SBE message: ErrorResponse."""

    TEMPLATE_ID = 100
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 18

    def __init__(self):
        self.code = None
        self.server_time = None
        self.retry_after = None
        self.msg = b''
        self.data = b''

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

        if self.code is not None:
            buffer.write(struct.pack('<h', self.code))
        if self.server_time is not None:
            buffer.write(struct.pack('<q', self.server_time))
        if self.retry_after is not None:
            buffer.write(struct.pack('<q', self.retry_after))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.code = struct.unpack_from('<h', data, pos)[0]
        pos += 2
        self.server_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.retry_after = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 18


        self.msg, pos = self._decode_var_data(data, pos)
        self.data, pos = self._decode_var_data(data, pos)
