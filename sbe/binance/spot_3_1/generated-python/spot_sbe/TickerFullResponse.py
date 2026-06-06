"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Tickers:
    """Repeating group item."""

    def __init__(self):
        self.price_exponent = None
        self.qty_exponent = None
        self.price_change = None
        self.price_change_percent = None
        self.weighted_avg_price = None
        self.open_price = None
        self.high_price = None
        self.low_price = None
        self.last_price = None
        self.volume = None
        self.quote_volume = None
        self.open_time = None
        self.close_time = None
        self.first_id = None
        self.last_id = None
        self.num_trades = None

class TickerFullResponse:
    """SBE message: TickerFullResponse."""

    TEMPLATE_ID = 214
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
            item.qty_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.price_change = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.price_change_percent = struct.unpack_from('<f', data, pos)[0]
            pos += 4
            item.weighted_avg_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.open_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.high_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.low_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.last_price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.volume = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.quote_volume = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.open_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.close_time = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.first_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.last_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.num_trades = struct.unpack_from('<q', data, pos)[0]
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
