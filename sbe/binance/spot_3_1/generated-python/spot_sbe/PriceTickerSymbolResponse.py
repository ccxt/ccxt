"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class PriceTickerSymbolResponse:
    """SBE message: PriceTickerSymbolResponse."""

    TEMPLATE_ID = 209
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 9

    def __init__(self):
        self.price_exponent = None
        self.price = None
        self.symbol = b''

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

        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.price is not None:
            buffer.write(struct.pack('<q', self.price))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.price_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.price = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 9


        self.symbol, pos = self._decode_var_data(data, pos)
