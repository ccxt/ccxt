"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class RateLimits:
    """Repeating group item."""

    def __init__(self):
        self.interval_num = None
        self.rate_limit = None
        self.num_orders = None

class AccountOrderRateLimitResponse:
    """SBE message: AccountOrderRateLimitResponse."""

    TEMPLATE_ID = 402
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 0

    def __init__(self):
        self.rate_limits = []

    def _decode_rate_limits_group(self, data: bytes, offset: int) -> Tuple[List[RateLimits], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = RateLimits()

            item.interval_num = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.rate_limit = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.num_orders = struct.unpack_from('<q', data, pos)[0]
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

        self.rate_limits, pos = self._decode_rate_limits_group(data, pos)
