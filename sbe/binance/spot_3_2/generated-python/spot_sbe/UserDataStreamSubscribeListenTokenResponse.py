"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class UserDataStreamSubscribeListenTokenResponse:
    """SBE message: UserDataStreamSubscribeListenTokenResponse."""

    TEMPLATE_ID = 505
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 10

    def __init__(self):
        self.subscription_id = None
        self.expiration_time = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.subscription_id is not None:
            buffer.write(struct.pack('<H', self.subscription_id))
        if self.expiration_time is not None:
            buffer.write(struct.pack('<q', self.expiration_time))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.subscription_id = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        self.expiration_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 10

