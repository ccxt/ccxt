"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class AccountResponse:
    """SBE message: AccountResponse."""

    TEMPLATE_ID = 400
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 64

    def __init__(self):
        self.commission_exponent = None
        self.commission_rate_maker = None
        self.commission_rate_taker = None
        self.commission_rate_buyer = None
        self.commission_rate_seller = None
        self.can_trade = None
        self.can_withdraw = None
        self.can_deposit = None
        self.brokered = None
        self.require_self_trade_prevention = None
        self.prevent_sor = None
        self.update_time = None
        self.account_type = None
        self.trade_group_id = None
        self.uid = None
        self.balances = []
        self.permissions = []
        self.reduce_only_assets = []

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.commission_exponent is not None:
            buffer.write(struct.pack('<b', self.commission_exponent))
        if self.commission_rate_maker is not None:
            buffer.write(struct.pack('<q', self.commission_rate_maker))
        if self.commission_rate_taker is not None:
            buffer.write(struct.pack('<q', self.commission_rate_taker))
        if self.commission_rate_buyer is not None:
            buffer.write(struct.pack('<q', self.commission_rate_buyer))
        if self.commission_rate_seller is not None:
            buffer.write(struct.pack('<q', self.commission_rate_seller))
        if self.update_time is not None:
            buffer.write(struct.pack('<q', self.update_time))
        if self.trade_group_id is not None:
            buffer.write(struct.pack('<q', self.trade_group_id))
        if self.uid is not None:
            buffer.write(struct.pack('<q', self.uid))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.commission_exponent = struct.unpack('<b', buffer.read(1))[0]
        self.commission_rate_maker = struct.unpack('<q', buffer.read(8))[0]
        self.commission_rate_taker = struct.unpack('<q', buffer.read(8))[0]
        self.commission_rate_buyer = struct.unpack('<q', buffer.read(8))[0]
        self.commission_rate_seller = struct.unpack('<q', buffer.read(8))[0]
        self.update_time = struct.unpack('<q', buffer.read(8))[0]
        self.trade_group_id = struct.unpack('<q', buffer.read(8))[0]
        self.uid = struct.unpack('<q', buffer.read(8))[0]
