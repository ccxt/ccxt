"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Bids:
    """Repeating group item."""

    def __init__(self):
        self.price = None
        self.qty = None

class Asks:
    """Repeating group item."""

    def __init__(self):
        self.price = None
        self.qty = None

class DepthDiffStreamEvent:
    """SBE message: DepthDiffStreamEvent."""

    TEMPLATE_ID = 10003
    SCHEMA_ID = 1
    SCHEMA_VERSION = 0
    BLOCK_LENGTH = 26

    def __init__(self):
        self.event_time = None
        self.first_book_update_id = None
        self.last_book_update_id = None
        self.price_exponent = None
        self.qty_exponent = None
        self.bids = []
        self.asks = []
        self.symbol = b''

    def _decode_bids_group(self, data: bytes, offset: int) -> Tuple[List[Bids], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Bids()

            item.price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_asks_group(self, data: bytes, offset: int) -> Tuple[List[Asks], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Asks()

            item.price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.qty = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

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

        if self.event_time is not None:
            buffer.write(struct.pack('<q', self.event_time))
        if self.first_book_update_id is not None:
            buffer.write(struct.pack('<q', self.first_book_update_id))
        if self.last_book_update_id is not None:
            buffer.write(struct.pack('<q', self.last_book_update_id))
        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.event_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.first_book_update_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.last_book_update_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.price_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1

        # Skip to end of block for forward compatibility
        pos = 26

        self.bids, pos = self._decode_bids_group(data, pos)
        self.asks, pos = self._decode_asks_group(data, pos)

        self.symbol, pos = self._decode_var_data(data, pos)
