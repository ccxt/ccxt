"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class OrderStatus:
    """Enum values."""
    NEW = 0
    PARTIALLY_FILLED = 1
    FILLED = 2
    CANCELED = 3
    PENDING_CANCEL = 4
    REJECTED = 5
    EXPIRED = 6
    EXPIRED_IN_MATCH = 9
    PENDING_NEW = 11
    UNKNOWN = 253
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
