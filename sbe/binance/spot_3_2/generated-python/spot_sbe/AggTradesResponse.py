"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class AggTrades:
    """Repeating group item."""

    def __init__(self):
        self.agg_trade_id = None
        self.price = None
        self.qty = None
        self.first_trade_id = None
        self.last_trade_id = None
        self.time = None

class AggTradesResponse:
    """SBE message: AggTradesResponse."""

    TEMPLATE_ID = 202
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 2

    def __init__(self):
        self.price_exponent = None
        self.qty_exponent = None
        self.agg_trades = []

    def _decode_agg_trades_group(self, data: bytes, offset: int) -> Tuple[List[AggTrades], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = AggTrades()

            item.agg_trade_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.first_trade_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.last_trade_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.time = struct.unpack_from('<q', data, pos)[0]
            pos += 8

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

        self.agg_trades, pos = self._decode_agg_trades_group(data, pos)
