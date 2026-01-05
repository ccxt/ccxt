"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class SymbolStatus:
    """Enum values."""
    TRADING = 0
    END_OF_DAY = 1
    HALT = 2
    BREAK_ = 3
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
