"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
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
        buffer = BytesIO(data)

        self.subscription_id = struct.unpack('<H', buffer.read(2))[0]
        self.expiration_time = struct.unpack('<q', buffer.read(8))[0]
