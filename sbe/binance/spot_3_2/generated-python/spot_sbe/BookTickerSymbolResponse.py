"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class BookTickerSymbolResponse:
    """SBE message: BookTickerSymbolResponse."""

    TEMPLATE_ID = 211
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 34

    def __init__(self):
        self.price_exponent = None
        self.qty_exponent = None
        self.bid_price = None
        self.bid_qty = None
        self.ask_price = None
        self.ask_qty = None
        self.symbol = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.bid_price is not None:
            buffer.write(struct.pack('<q', self.bid_price))
        if self.bid_qty is not None:
            buffer.write(struct.pack('<q', self.bid_qty))
        if self.ask_price is not None:
            buffer.write(struct.pack('<q', self.ask_price))
        if self.ask_qty is not None:
            buffer.write(struct.pack('<q', self.ask_qty))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.price_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.qty_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.bid_price = struct.unpack('<q', buffer.read(8))[0]
        self.bid_qty = struct.unpack('<q', buffer.read(8))[0]
        self.ask_price = struct.unpack('<q', buffer.read(8))[0]
        self.ask_qty = struct.unpack('<q', buffer.read(8))[0]
