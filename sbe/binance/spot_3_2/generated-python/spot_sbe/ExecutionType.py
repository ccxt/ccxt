"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class ExecutionType:
    """Enum values."""
    NEW = 0
    CANCELED = 1
    REPLACED = 2
    REJECTED = 3
    TRADE = 4
    EXPIRED = 5
    TRADE_PREVENTION = 8
    UNKNOWN = 253
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
