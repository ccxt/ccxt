"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class ExchangeFilters:
    """Repeating group item."""

    def __init__(self):

class SymbolFilters:
    """Repeating group item."""

    def __init__(self):

class AssetFilters:
    """Repeating group item."""

    def __init__(self):

class MyFiltersResponse:
    """SBE message: MyFiltersResponse."""

    TEMPLATE_ID = 105
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 0

    def __init__(self):
        self.exchange_filters = []
        self.symbol_filters = []
        self.asset_filters = []

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

    def _decode_symbol_filters_group(self, data: bytes, offset: int) -> Tuple[List[SymbolFilters], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = SymbolFilters()


            # Skip to next block for forward compatibility
            pos = item_start + block_length
            items.append(item)

        return (items, pos)

    def _decode_asset_filters_group(self, data: bytes, offset: int) -> Tuple[List[AssetFilters], int]:
        """Decode repeating group."""
        pos = offset

        block_length = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        num_in_group = struct.unpack_from('<I', data, pos)[0]
        pos += 4

        items = []
        for _ in range(num_in_group):
            item_start = pos
            item = AssetFilters()


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

        self.exchange_filters, pos = self._decode_exchange_filters_group(data, pos)
        self.symbol_filters, pos = self._decode_symbol_filters_group(data, pos)
        self.asset_filters, pos = self._decode_asset_filters_group(data, pos)
