"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class MatchType:
    """Enum values."""
    AUTO_MATCH = 1
    ONE_PARTY_TRADE_REPORT = 2
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
