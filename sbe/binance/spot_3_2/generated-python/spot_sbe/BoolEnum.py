"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class BoolEnum:
    """Enum values."""
    FALSE = 0
    TRUE = 1
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
