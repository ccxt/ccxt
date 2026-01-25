"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class SourceEnum:
    """Enum values."""
    NORMAL = 0
    ELP = 1
    NULL_VALUE = -128

    @staticmethod
    def encoded_length() -> int:
        return 1
