"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class PriceTickerSymbolResponse:
    """SBE message: PriceTickerSymbolResponse."""

    TEMPLATE_ID = 209
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 9

    def __init__(self):
        self.price_exponent = None
        self.price = None
        self.symbol = b''

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
        buffer = BytesIO(data)

        self.price_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.price = struct.unpack('<q', buffer.read(8))[0]
