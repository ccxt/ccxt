"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class GroupSizeEncoding:
    """Composite type."""

    def __init__(self):
        self.block_length = 0
        self.num_in_group = 0

    def encode(self, buffer: BytesIO) -> None:
        """Encode the composite to the buffer."""
        buffer.write(struct.pack('<H', self.block_length))
        buffer.write(struct.pack('<I', self.num_in_group))

    def decode(self, buffer: BytesIO) -> None:
        """Decode the composite from the buffer."""
        self.block_length = struct.unpack('<H', buffer.read(2))[0]
        self.num_in_group = struct.unpack('<I', buffer.read(4))[0]

    @staticmethod
    def encoded_length() -> int:
        return 6
