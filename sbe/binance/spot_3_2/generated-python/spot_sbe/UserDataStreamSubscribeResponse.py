"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class UserDataStreamSubscribeResponse:
    """SBE message: UserDataStreamSubscribeResponse."""

    TEMPLATE_ID = 503
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 2

    def __init__(self):
        self.subscription_id = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.subscription_id is not None:
            buffer.write(struct.pack('<H', self.subscription_id))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.subscription_id = struct.unpack_from('<H', data, pos)[0]
        pos += 2

        # Skip to end of block for forward compatibility
        pos = 2

