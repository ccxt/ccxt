"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class AccountCommissionResponse:
    """SBE message: AccountCommissionResponse."""

    TEMPLATE_ID = 405
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
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
        pos = 0

        self.commission_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.discount_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.standard_commission_maker = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.standard_commission_taker = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.standard_commission_buyer = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.standard_commission_seller = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.tax_commission_maker = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.tax_commission_taker = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.tax_commission_buyer = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.tax_commission_seller = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.discount = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.special_commission_maker = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.special_commission_taker = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.special_commission_buyer = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.special_commission_seller = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 108


        self.symbol, pos = self._decode_var_data(data, pos)
        self.discount_asset, pos = self._decode_var_data(data, pos)
