"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Tickers:
    """Repeating group item."""

    def __init__(self):
        self.price_exponent = None
        self.price = None

class PriceTickerResponse:
    """SBE message: PriceTickerResponse."""

    TEMPLATE_ID = 210
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 0

    def __init__(self):
        self.tickers = []

    def _decode_tickers_group(self, data: bytes, offset: int) -> Tuple[List[Tickers], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Tickers()

            item.price_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.price = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()


        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0


        # Skip to end of block for forward compatibility
        pos = 0

        self.tickers, pos = self._decode_tickers_group(data, pos)
