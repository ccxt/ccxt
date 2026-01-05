"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class MessageHeader:
    """Composite type."""

    def __init__(self):
        self.block_length = 0
        self.template_id = 0
        self.schema_id = 0
        self.version = 0

    def encode(self, buffer: BytesIO) -> None:
        """Encode the composite to the buffer."""
        buffer.write(struct.pack('<H', self.block_length))
        buffer.write(struct.pack('<H', self.template_id))
        buffer.write(struct.pack('<H', self.schema_id))
        buffer.write(struct.pack('<H', self.version))

    def decode(self, buffer: BytesIO) -> None:
        """Decode the composite from the buffer."""
        self.block_length = struct.unpack('<H', buffer.read(2))[0]
        self.template_id = struct.unpack('<H', buffer.read(2))[0]
        self.schema_id = struct.unpack('<H', buffer.read(2))[0]
        self.version = struct.unpack('<H', buffer.read(2))[0]

    @staticmethod
    def encoded_length() -> int:
        return 8
