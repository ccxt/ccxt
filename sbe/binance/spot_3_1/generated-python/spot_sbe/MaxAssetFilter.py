"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class MaxAssetFilter:
    """SBE message: MaxAssetFilter."""

    TEMPLATE_ID = 21
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 9

    def __init__(self):
        self.filter_type = None
        self.qty_exponent = None
        self.max_qty = None
        self.asset = b''

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

        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.max_qty is not None:
            buffer.write(struct.pack('<q', self.max_qty))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.max_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 9


        self.asset, pos = self._decode_var_data(data, pos)
