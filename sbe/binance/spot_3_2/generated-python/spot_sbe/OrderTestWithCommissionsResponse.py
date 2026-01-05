"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class OrderTestWithCommissionsResponse:
    """SBE message: OrderTestWithCommissionsResponse."""

    TEMPLATE_ID = 315
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 60

    def __init__(self):
        self.commission_exponent = None
        self.discount_exponent = None
        self.standard_commission_for_order_maker = None
        self.standard_commission_for_order_taker = None
        self.tax_commission_for_order_maker = None
        self.tax_commission_for_order_taker = None
        self.discount_enabled_for_account = None
        self.discount_enabled_for_symbol = None
        self.discount = None
        self.special_commission_for_order_maker = None
        self.special_commission_for_order_taker = None
        self.discount_asset = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.commission_exponent is not None:
            buffer.write(struct.pack('<b', self.commission_exponent))
        if self.discount_exponent is not None:
            buffer.write(struct.pack('<b', self.discount_exponent))
        if self.standard_commission_for_order_maker is not None:
            buffer.write(struct.pack('<q', self.standard_commission_for_order_maker))
        if self.standard_commission_for_order_taker is not None:
            buffer.write(struct.pack('<q', self.standard_commission_for_order_taker))
        if self.tax_commission_for_order_maker is not None:
            buffer.write(struct.pack('<q', self.tax_commission_for_order_maker))
        if self.tax_commission_for_order_taker is not None:
            buffer.write(struct.pack('<q', self.tax_commission_for_order_taker))
        if self.discount is not None:
            buffer.write(struct.pack('<q', self.discount))
        if self.special_commission_for_order_maker is not None:
            buffer.write(struct.pack('<q', self.special_commission_for_order_maker))
        if self.special_commission_for_order_taker is not None:
            buffer.write(struct.pack('<q', self.special_commission_for_order_taker))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.commission_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.discount_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.standard_commission_for_order_maker = struct.unpack('<q', buffer.read(8))[0]
        self.standard_commission_for_order_taker = struct.unpack('<q', buffer.read(8))[0]
        self.tax_commission_for_order_maker = struct.unpack('<q', buffer.read(8))[0]
        self.tax_commission_for_order_taker = struct.unpack('<q', buffer.read(8))[0]
        self.discount = struct.unpack('<q', buffer.read(8))[0]
        self.special_commission_for_order_maker = struct.unpack('<q', buffer.read(8))[0]
        self.special_commission_for_order_taker = struct.unpack('<q', buffer.read(8))[0]
