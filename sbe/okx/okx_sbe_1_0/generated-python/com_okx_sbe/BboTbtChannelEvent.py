"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class BboTbtChannelEvent:
    """SBE message: BboTbtChannelEvent."""

    TEMPLATE_ID = 1000
    SCHEMA_ID = 1
    SCHEMA_VERSION = 0
    BLOCK_LENGTH = 74

    def __init__(self):
        self.inst_id_code = None
        self.ts_us = None
        self.out_time = None
        self.seq_id = None
        self.ask_px_mantissa = None
        self.ask_sz_mantissa = None
        self.bid_px_mantissa = None
        self.bid_sz_mantissa = None
        self.ask_ord_count = None
        self.bid_ord_count = None
        self.px_exponent = None
        self.sz_exponent = None

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
        if self.ask_px_mantissa is not None:
            buffer.write(struct.pack('<q', self.ask_px_mantissa))
        if self.ask_sz_mantissa is not None:
            buffer.write(struct.pack('<q', self.ask_sz_mantissa))
        if self.bid_px_mantissa is not None:
            buffer.write(struct.pack('<q', self.bid_px_mantissa))
        if self.bid_sz_mantissa is not None:
            buffer.write(struct.pack('<q', self.bid_sz_mantissa))
        if self.ask_ord_count is not None:
            buffer.write(struct.pack('<i', self.ask_ord_count))
        if self.bid_ord_count is not None:
            buffer.write(struct.pack('<i', self.bid_ord_count))
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
        self.ask_px_mantissa = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.ask_sz_mantissa = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.bid_px_mantissa = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.bid_sz_mantissa = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.ask_ord_count = struct.unpack_from('<i', data, pos)[0]
        pos += 4
        self.bid_ord_count = struct.unpack_from('<i', data, pos)[0]
        pos += 4
        self.px_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.sz_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1

        # Skip to end of block for forward compatibility
        pos = 74

