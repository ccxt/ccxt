"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class RateLimitType:
    """Enum values."""
    RAW_REQUESTS = 0
    CONNECTIONS = 1
    REQUEST_WEIGHT = 2
    ORDERS = 3
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
