"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class AllowedSelfTradePreventionModes:
    """Choice set values."""
    NONE = 0
    EXPIRE_TAKER = 1
    EXPIRE_MAKER = 2
    EXPIRE_BOTH = 3
    DECREMENT = 4
    TRANSFER = 5
    NON_REPRESENTABLE = 7

    @staticmethod
    def encoded_length() -> int:
        return 1
