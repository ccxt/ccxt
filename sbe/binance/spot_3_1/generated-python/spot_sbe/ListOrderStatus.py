"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple, Set
from io import BytesIO

class ListOrderStatus:
    """Enum values."""
    CANCELING = 0
    EXECUTING = 1
    ALL_DONE = 2
    REJECT = 3
    NON_REPRESENTABLE = 254
    NULL_VALUE = 255

    @staticmethod
    def encoded_length() -> int:
        return 1
