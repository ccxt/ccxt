"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class TradesChannelEvent:
    """SBE message: TradesChannelEvent."""

    TEMPLATE_ID = 1005
    SCHEMA_ID = 1
    SCHEMA_VERSION = 0
    BLOCK_LENGTH = 62

    def __init__(self):
        self.inst_id_code = None
        self.ts_us = None
        self.out_time = None
        self.seq_id = None
        self.px_mantissa = None
        self.sz_mantissa = None
        self.trade_id = None
        self.count = None
        self.side = None
        self.px_exponent = None
        self.sz_exponent = None
        self.source = None

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
        if self.px_mantissa is not None:
            buffer.write(struct.pack('<q', self.px_mantissa))
        if self.sz_mantissa is not None:
            buffer.write(struct.pack('<q', self.sz_mantissa))
        if self.trade_id is not None:
            buffer.write(struct.pack('<q', self.trade_id))
        if self.count is not None:
            buffer.write(struct.pack('<h', self.count))
        if self.px_exponent is not None:
            buffer.write(struct.pack('<b', self.px_exponent))
        if self.sz_exponent is not None:
            buffer.write(struct.pack('<b', self.sz_exponent))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.inst_id_code = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.ts_us = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.out_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.seq_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.px_mantissa = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.sz_mantissa = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.trade_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.count = struct.unpack_from('<h', data, pos)[0]
        pos += 2
        self.px_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.sz_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1

        # Skip to end of block for forward compatibility
        pos = 62

