"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class PreventedMatches:
    """Repeating group item."""

    def __init__(self):
        self.price_exponent = None
        self.qty_exponent = None
        self.prevented_match_id = None
        self.taker_order_id = None
        self.maker_order_id = None
        self.trade_group_id = None
        self.price = None
        self.taker_prevented_quantity = None
        self.maker_prevented_quantity = None
        self.transact_time = None

class AccountPreventedMatchesResponse:
    """SBE message: AccountPreventedMatchesResponse."""

    TEMPLATE_ID = 403
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 0

    def __init__(self):
        self.prevented_matches = []

    def _decode_prevented_matches_group(self, data: bytes, offset: int) -> Tuple[List[PreventedMatches], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = PreventedMatches()

            item.price_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.qty_exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.prevented_match_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.taker_order_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.maker_order_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.trade_group_id = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.price = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.taker_prevented_quantity = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.maker_prevented_quantity = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.transact_time = struct.unpack_from('<q', data, pos)[0]
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

        self.prevented_matches, pos = self._decode_prevented_matches_group(data, pos)
