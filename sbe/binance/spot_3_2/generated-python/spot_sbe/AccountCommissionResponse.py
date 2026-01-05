"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class AccountCommissionResponse:
    """SBE message: AccountCommissionResponse."""

    TEMPLATE_ID = 405
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 108

    def __init__(self):
        self.commission_exponent = None
        self.discount_exponent = None
        self.standard_commission_maker = None
        self.standard_commission_taker = None
        self.standard_commission_buyer = None
        self.standard_commission_seller = None
        self.tax_commission_maker = None
        self.tax_commission_taker = None
        self.tax_commission_buyer = None
        self.tax_commission_seller = None
        self.discount_enabled_for_account = None
        self.discount_enabled_for_symbol = None
        self.discount = None
        self.special_commission_maker = None
        self.special_commission_taker = None
        self.special_commission_buyer = None
        self.special_commission_seller = None
        self.symbol = b''
        self.discount_asset = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.commission_exponent is not None:
            buffer.write(struct.pack('<b', self.commission_exponent))
        if self.discount_exponent is not None:
            buffer.write(struct.pack('<b', self.discount_exponent))
        if self.standard_commission_maker is not None:
            buffer.write(struct.pack('<q', self.standard_commission_maker))
        if self.standard_commission_taker is not None:
            buffer.write(struct.pack('<q', self.standard_commission_taker))
        if self.standard_commission_buyer is not None:
            buffer.write(struct.pack('<q', self.standard_commission_buyer))
        if self.standard_commission_seller is not None:
            buffer.write(struct.pack('<q', self.standard_commission_seller))
        if self.tax_commission_maker is not None:
            buffer.write(struct.pack('<q', self.tax_commission_maker))
        if self.tax_commission_taker is not None:
            buffer.write(struct.pack('<q', self.tax_commission_taker))
        if self.tax_commission_buyer is not None:
            buffer.write(struct.pack('<q', self.tax_commission_buyer))
        if self.tax_commission_seller is not None:
            buffer.write(struct.pack('<q', self.tax_commission_seller))
        if self.discount is not None:
            buffer.write(struct.pack('<q', self.discount))
        if self.special_commission_maker is not None:
            buffer.write(struct.pack('<q', self.special_commission_maker))
        if self.special_commission_taker is not None:
            buffer.write(struct.pack('<q', self.special_commission_taker))
        if self.special_commission_buyer is not None:
            buffer.write(struct.pack('<q', self.special_commission_buyer))
        if self.special_commission_seller is not None:
            buffer.write(struct.pack('<q', self.special_commission_seller))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.commission_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.discount_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.standard_commission_maker = struct.unpack('<q', buffer.read(8))[0]
        self.standard_commission_taker = struct.unpack('<q', buffer.read(8))[0]
        self.standard_commission_buyer = struct.unpack('<q', buffer.read(8))[0]
        self.standard_commission_seller = struct.unpack('<q', buffer.read(8))[0]
        self.tax_commission_maker = struct.unpack('<q', buffer.read(8))[0]
        self.tax_commission_taker = struct.unpack('<q', buffer.read(8))[0]
        self.tax_commission_buyer = struct.unpack('<q', buffer.read(8))[0]
        self.tax_commission_seller = struct.unpack('<q', buffer.read(8))[0]
        self.discount = struct.unpack('<q', buffer.read(8))[0]
        self.special_commission_maker = struct.unpack('<q', buffer.read(8))[0]
        self.special_commission_taker = struct.unpack('<q', buffer.read(8))[0]
        self.special_commission_buyer = struct.unpack('<q', buffer.read(8))[0]
        self.special_commission_seller = struct.unpack('<q', buffer.read(8))[0]
