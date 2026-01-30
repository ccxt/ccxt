"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Klines:
    """Repeating group item."""

    def __init__(self):
        self.open_time = None
        self.open_price = None
        self.high_price = None
        self.low_price = None
        self.close_price = None
        self.volume = None
        self.close_time = None
        self.quote_volume = None
        self.num_trades = None
        self.taker_buy_base_volume = None
        self.taker_buy_quote_volume = None

class KlinesResponse:
    """SBE message: KlinesResponse."""

    TEMPLATE_ID = 203
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 2

    def __init__(self):
        self.price_exponent = None
        self.qty_exponent = None
        self.klines = []

    def _decode_klines_group(self, data: bytes, offset: int) -> Tuple[List[Klines], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Klines()

            item.open_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.open_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.high_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.low_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.close_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.volume = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.close_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.quote_volume = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.num_trades = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.taker_buy_base_volume = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.taker_buy_quote_volume = struct.unpack_from('<B', data, pos)[0]
            pos += 1

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.price_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1

        # Skip to end of block for forward compatibility
        pos = 2

        self.klines, pos = self._decode_klines_group(data, pos)
