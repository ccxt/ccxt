"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class FilterType:
    """Enum values."""
    MAX_POSITION = 0
    PRICE_FILTER = 1
    TPLUS_SELL = 2
    LOT_SIZE = 3
    MAX_NUM_ORDERS = 4
    MIN_NOTIONAL = 5
    MAX_NUM_ALGO_ORDERS = 6
    EXCHANGE_MAX_NUM_ORDERS = 7
    EXCHANGE_MAX_NUM_ALGO_ORDERS = 8
    ICEBERG_PARTS = 9
    MARKET_LOT_SIZE = 10
    PERCENT_PRICE = 11
    MAX_NUM_ICEBERG_ORDERS = 12
    EXCHANGE_MAX_NUM_ICEBERG_ORDERS = 13
    TRAILING_DELTA = 14
    PERCENT_PRICE_BY_SIDE = 15
    NOTIONAL = 16
    MAX_NUM_ORDER_LISTS = 17
    EXCHANGE_MAX_NUM_ORDER_LISTS = 18
    MAX_NUM_ORDER_AMENDS = 19
    MAX_ASSET = 20
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
