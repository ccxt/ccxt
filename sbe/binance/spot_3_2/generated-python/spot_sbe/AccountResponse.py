"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class Balances:
    """Repeating group item."""

    def __init__(self):
        self.exponent = None
        self.free = None
        self.locked = None

class Permissions:
    """Repeating group item."""

    def __init__(self):

class ReduceOnlyAssets:
    """Repeating group item."""

    def __init__(self):

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

    def _decode_balances_group(self, data: bytes, offset: int) -> Tuple[List[Balances], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Balances()

            item.exponent = struct.unpack_from('<b', data, pos)[0]
            pos += 1
            item.free = struct.unpack_from('<q', data, pos)[0]
            pos += 8
            item.locked = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_permissions_group(self, data: bytes, offset: int) -> Tuple[List[Permissions], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Permissions()


            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_reduce_only_assets_group(self, data: bytes, offset: int) -> Tuple[List[ReduceOnlyAssets], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = ReduceOnlyAssets()


            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

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
        pos = 0

        self.commission_exponent = struct.unpack_from('<b', data, pos)[0]
        pos += 1
        self.commission_rate_maker = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.commission_rate_taker = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.commission_rate_buyer = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.commission_rate_seller = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.update_time = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.trade_group_id = struct.unpack_from('<q', data, pos)[0]
        pos += 8
        self.uid = struct.unpack_from('<q', data, pos)[0]
        pos += 8

        # Skip to end of block for forward compatibility
        pos = 64

        self.balances, pos = self._decode_balances_group(data, pos)
        self.permissions, pos = self._decode_permissions_group(data, pos)
        self.reduce_only_assets, pos = self._decode_reduce_only_assets_group(data, pos)
