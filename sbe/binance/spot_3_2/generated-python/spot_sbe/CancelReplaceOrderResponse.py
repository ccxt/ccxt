"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class CancelReplaceOrderResponse:
    """SBE message: CancelReplaceOrderResponse."""

    TEMPLATE_ID = 307
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 2

    def __init__(self):
        self.cancel_result = None
        self.new_order_result = None
        self.cancel_response = b''
        self.new_order_response = b''

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()


        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

