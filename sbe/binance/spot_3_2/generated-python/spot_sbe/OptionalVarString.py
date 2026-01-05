"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class OptionalVarString:
    """Composite type."""

    def __init__(self):
        self.length = 0
        self.var_data = 0

    def encode(self, buffer: BytesIO) -> None:
        """Encode the composite to the buffer."""
        buffer.write(struct.pack('<H', self.length))
        buffer.write(struct.pack('<B', self.var_data))

    def decode(self, buffer: BytesIO) -> None:
        """Decode the composite from the buffer."""
        self.length = struct.unpack('<H', buffer.read(2))[0]
        self.var_data = struct.unpack('<B', buffer.read(1))[0]

    @staticmethod
    def encoded_length() -> int:
        return -1
