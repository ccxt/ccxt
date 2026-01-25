"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Asks:
    """Repeating group item."""

    def __init__(self):
        self.px_mantissa = None
        self.sz_mantissa = None
        self.ord_count = None

class Bids:
    """Repeating group item."""

    def __init__(self):
        self.px_mantissa = None
        self.sz_mantissa = None
        self.ord_count = None

class BooksL2TbtElpChannelEvent:
    """SBE message: BooksL2TbtElpChannelEvent."""

    TEMPLATE_ID = 1003
    SCHEMA_ID = 1
    SCHEMA_VERSION = 0
    BLOCK_LENGTH = 42

    def __init__(self):
        self.inst_id_code = None
        self.ts_us = None
        self.out_time = None
        self.seq_id = None
        self.prev_seq_id = None
        self.px_exponent = None
        self.sz_exponent = None
        self.asks = []
        self.bids = []

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

            item.px_mantissa = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.sz_mantissa = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.ord_count = struct.unpack_from('<i', data, pos)[0]
            pos += 4

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

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

            item.px_mantissa = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.sz_mantissa = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.ord_count = struct.unpack_from('<i', data, pos)[0]
            pos += 4

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.inst_id_code is not None:
            buffer.write(struct.pack('<q', self.inst_id_code))
        if self.ts_us is not None:
            buffer.write(struct.pack('<q', self.ts_us))
        if self.out_time is not None:
            buffer.write(struct.pack('<q', self.out_time))
        if self.seq_id is not None:
            buffer.write(struct.pack('<q', self.seq_id))
        if self.prev_seq_id is not None:
            buffer.write(struct.pack('<q', self.prev_seq_id))
        if self.px_exponent is not None:
            buffer.write(struct.pack('<b', self.px_exponent))
        if self.sz_exponent is not None:
            buffer.write(struct.pack('<b', self.sz_exponent))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.inst_id_code = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.ts_us = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.out_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.seq_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.prev_seq_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.px_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.sz_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1

        # Skip to end of block for forward compatibility
        pos = 42

        self.asks, pos = self._decode_asks_group(data, pos)
        self.bids, pos = self._decode_bids_group(data, pos)
