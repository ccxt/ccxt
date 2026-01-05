"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class SideEnum:
    """Enum values."""
    SELL = 0
    BUY = 1
    NULL_VALUE = -128

    @staticmethod
    def encoded_length() -> int:
        return 1
