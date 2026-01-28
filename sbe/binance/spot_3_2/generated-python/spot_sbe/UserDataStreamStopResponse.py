"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class UserDataStreamStopResponse:
    """SBE message: UserDataStreamStopResponse."""

    TEMPLATE_ID = 502
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 0

    def __init__(self):

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()


        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0


        # Skip to end of block for forward compatibility
        pos = 0

