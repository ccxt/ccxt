"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
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
        pos = 0

        self.price_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.bid_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.bid_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.ask_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.ask_qty = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 34


        self.symbol, pos = self._decode_var_data(data, pos)
