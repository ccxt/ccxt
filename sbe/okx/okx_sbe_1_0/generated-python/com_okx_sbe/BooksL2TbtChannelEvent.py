"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class BooksL2TbtChannelEvent:
    """SBE message: BooksL2TbtChannelEvent."""

    TEMPLATE_ID = 1001
    SCHEMA_ID = 1
    SCHEMA_VERSION = 0
    BLOCK_LENGTH = 42

    def __init__(self):
        self.inst_id_code = None
        self.ts_us = None
        self.out_time = None
        self.seq_id = None
        self.prev_seq_id = None
        self.px_exponent = None
        self.sz_exponent = None
        self.asks = []
        self.bids = []

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.inst_id_code is not None:
            buffer.write(struct.pack('<q', self.inst_id_code))
        if self.ts_us is not None:
            buffer.write(struct.pack('<q', self.ts_us))
        if self.out_time is not None:
            buffer.write(struct.pack('<q', self.out_time))
        if self.seq_id is not None:
            buffer.write(struct.pack('<q', self.seq_id))
        if self.prev_seq_id is not None:
            buffer.write(struct.pack('<q', self.prev_seq_id))
        if self.px_exponent is not None:
            buffer.write(struct.pack('<b', self.px_exponent))
        if self.sz_exponent is not None:
            buffer.write(struct.pack('<b', self.sz_exponent))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.inst_id_code = struct.unpack('<q', buffer.read(8))[0]
        self.ts_us = struct.unpack('<q', buffer.read(8))[0]
        self.out_time = struct.unpack('<q', buffer.read(8))[0]
        self.seq_id = struct.unpack('<q', buffer.read(8))[0]
        self.prev_seq_id = struct.unpack('<q', buffer.read(8))[0]
        self.px_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.sz_exponent = struct.unpack('<b', buffer.read(1))[0]
