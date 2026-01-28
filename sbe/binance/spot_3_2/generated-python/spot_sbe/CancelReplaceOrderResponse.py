"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class CancelReplaceOrderResponse:
    """SBE message: CancelReplaceOrderResponse."""

    TEMPLATE_ID = 307
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 2

    def __init__(self):
        self.cancel_result = None
        self.new_order_result = None
        self.cancel_response = b''
        self.new_order_response = b''

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


        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0


        # Skip to end of block for forward compatibility
        pos = 2


        self.cancel_response, pos = self._decode_var_data(data, pos)
        self.new_order_response, pos = self._decode_var_data(data, pos)
