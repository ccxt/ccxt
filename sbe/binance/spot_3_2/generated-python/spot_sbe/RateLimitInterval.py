"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class RateLimitInterval:
    """Enum values."""
    SECOND = 0
    MINUTE = 1
    HOUR = 2
    DAY = 3
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
