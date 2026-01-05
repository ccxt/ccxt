"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class ListStatusType:
    """Enum values."""
    RESPONSE = 0
    EXEC_STARTED = 1
    ALL_DONE = 2
    UPDATED = 3
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
