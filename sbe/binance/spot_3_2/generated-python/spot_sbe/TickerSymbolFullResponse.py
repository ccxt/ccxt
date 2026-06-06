"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class TickerSymbolFullResponse:
    """SBE message: TickerSymbolFullResponse."""

    TEMPLATE_ID = 213
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 126

    def __init__(self):
        self.price_exponent = None
        self.qty_exponent = None
        self.price_change = None
        self.price_change_percent = None
        self.weighted_avg_price = None
        self.open_price = None
        self.high_price = None
        self.low_price = None
        self.last_price = None
        self.volume = None
        self.quote_volume = None
        self.open_time = None
        self.close_time = None
        self.first_id = None
        self.last_id = None
        self.num_trades = None
        self.symbol = b''

    def _decode_var_data(self, data: bytes, offset: int) -> Tuple[bytes, int]:
        """Decode variable-length binary data."""
        pos = offset
        length = struct.unpack_from('<I', data, pos)[0]
        pos += 4
        value = data[pos:pos+length]
        pos += length
        return (value, pos)

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
        if self.price_change is not None:
            buffer.write(struct.pack('<q', self.price_change))
        if self.price_change_percent is not None:
            buffer.write(struct.pack('<f', self.price_change_percent))
        if self.weighted_avg_price is not None:
            buffer.write(struct.pack('<q', self.weighted_avg_price))
        if self.open_price is not None:
            buffer.write(struct.pack('<q', self.open_price))
        if self.high_price is not None:
            buffer.write(struct.pack('<q', self.high_price))
        if self.low_price is not None:
            buffer.write(struct.pack('<q', self.low_price))
        if self.last_price is not None:
            buffer.write(struct.pack('<q', self.last_price))
        if self.volume is not None:
            for val in self.volume:
                buffer.write(struct.pack('<B', val))
        if self.quote_volume is not None:
            for val in self.quote_volume:
                buffer.write(struct.pack('<B', val))
        if self.open_time is not None:
            buffer.write(struct.pack('<q', self.open_time))
        if self.close_time is not None:
            buffer.write(struct.pack('<q', self.close_time))
        if self.first_id is not None:
            buffer.write(struct.pack('<q', self.first_id))
        if self.last_id is not None:
            buffer.write(struct.pack('<q', self.last_id))
        if self.num_trades is not None:
            buffer.write(struct.pack('<q', self.num_trades))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0

        self.price_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.qty_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.price_change = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.price_change_percent = struct.unpack_from('<f', data, pos)[0]
        pos += 4
        self.weighted_avg_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.open_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.high_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.low_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.last_price = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.volume = []
        for _ in range(16):
            self.volume.append(struct.unpack_from('<B', data, pos)[0])
            pos += 1
        self.quote_volume = []
        for _ in range(16):
            self.quote_volume.append(struct.unpack_from('<B', data, pos)[0])
            pos += 1
        self.open_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.close_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.first_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.last_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.num_trades = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 126


        self.symbol, pos = self._decode_var_data(data, pos)
