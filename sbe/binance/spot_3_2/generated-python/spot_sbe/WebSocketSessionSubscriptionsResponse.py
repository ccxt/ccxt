"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Subscriptions:
    """Repeating group item."""

    def __init__(self):
        self.subscription_id = None
        self.expiration_time = None

class WebSocketSessionSubscriptionsResponse:
    """SBE message: WebSocketSessionSubscriptionsResponse."""

    TEMPLATE_ID = 54
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 0

    def __init__(self):
        self.subscriptions = []

    def _decode_subscriptions_group(self, data: bytes, offset: int) -> Tuple[List[Subscriptions], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Subscriptions()

            item.subscription_id = struct.unpack_from('<H', data, pos)[0]
            pos += 2
            item.expiration_time = struct.unpack_from('<q', data, pos)[0]
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

        self.subscriptions, pos = self._decode_subscriptions_group(data, pos)
