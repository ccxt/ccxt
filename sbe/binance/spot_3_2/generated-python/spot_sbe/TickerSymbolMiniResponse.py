"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class TickerSymbolMiniResponse:
    """SBE message: TickerSymbolMiniResponse."""

    TEMPLATE_ID = 215
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 106

    def __init__(self):
        self.price_exponent = None
        self.qty_exponent = None
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

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.price_exponent is not None:
            buffer.write(struct.pack('<b', self.price_exponent))
        if self.qty_exponent is not None:
            buffer.write(struct.pack('<b', self.qty_exponent))
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
        buffer = BytesIO(data)

        self.price_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.qty_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.open_price = struct.unpack('<q', buffer.read(8))[0]
        self.high_price = struct.unpack('<q', buffer.read(8))[0]
        self.low_price = struct.unpack('<q', buffer.read(8))[0]
        self.last_price = struct.unpack('<q', buffer.read(8))[0]
        self.volume = []
        for _ in range(16):
            self.volume.append(struct.unpack('<B', buffer.read(1))[0])
        self.quote_volume = []
        for _ in range(16):
            self.quote_volume.append(struct.unpack('<B', buffer.read(1))[0])
        self.open_time = struct.unpack('<q', buffer.read(8))[0]
        self.close_time = struct.unpack('<q', buffer.read(8))[0]
        self.first_id = struct.unpack('<q', buffer.read(8))[0]
        self.last_id = struct.unpack('<q', buffer.read(8))[0]
        self.num_trades = struct.unpack('<q', buffer.read(8))[0]
