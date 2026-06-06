"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class RateLimits:
    """Repeating group item."""

    def __init__(self):
        self.interval_num = None
        self.rate_limit = None

class ExchangeFilters:
    """Repeating group item."""

    def __init__(self):

class Symbols:
    """Repeating group item."""

    def __init__(self):
        self.base_asset_precision = None
        self.quote_asset_precision = None
        self.base_commission_precision = None
        self.quote_commission_precision = None

class Sors:
    """Repeating group item."""

    def __init__(self):

class ExchangeInfoResponse:
    """SBE message: ExchangeInfoResponse."""

    TEMPLATE_ID = 103
    SCHEMA_ID = 3
    SCHEMA_VERSION = 1
    BLOCK_LENGTH = 0

    def __init__(self):
        self.rate_limits = []
        self.exchange_filters = []
        self.symbols = []
        self.sors = []

    def _decode_rate_limits_group(self, data: bytes, offset: int) -> Tuple[List[RateLimits], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = RateLimits()

            item.interval_num = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.rate_limit = struct.unpack_from('<q', data, pos)[0]
            pos += 8

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_exchange_filters_group(self, data: bytes, offset: int) -> Tuple[List[ExchangeFilters], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = ExchangeFilters()


            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_symbols_group(self, data: bytes, offset: int) -> Tuple[List[Symbols], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Symbols()

            item.base_asset_precision = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.quote_asset_precision = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.base_commission_precision = struct.unpack_from('<B', data, pos)[0]
            pos += 1
            item.quote_commission_precision = struct.unpack_from('<B', data, pos)[0]
            pos += 1

            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_sors_group(self, data: bytes, offset: int) -> Tuple[List[Sors], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = Sors()


            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()


        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        pos = 0


        # Skip to end of block for forward compatibility
        pos = 0

        self.rate_limits, pos = self._decode_rate_limits_group(data, pos)
        self.exchange_filters, pos = self._decode_exchange_filters_group(data, pos)
        self.symbols, pos = self._decode_symbols_group(data, pos)
        self.sors, pos = self._decode_sors_group(data, pos)
