"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class SelfTradePreventionMode:
    """Enum values."""
    NONE = 1
    EXPIRE_TAKER = 2
    EXPIRE_MAKER = 3
    EXPIRE_BOTH = 4
    DECREMENT = 5
    TRANSFER = 6
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
