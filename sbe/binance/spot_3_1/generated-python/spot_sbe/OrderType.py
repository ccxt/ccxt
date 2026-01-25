"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class OrderType:
    """Enum values."""
    MARKET = 0
    LIMIT = 1
    STOP_LOSS = 2
    STOP_LOSS_LIMIT = 3
    TAKE_PROFIT = 4
    TAKE_PROFIT_LIMIT = 5
    LIMIT_MAKER = 6
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
