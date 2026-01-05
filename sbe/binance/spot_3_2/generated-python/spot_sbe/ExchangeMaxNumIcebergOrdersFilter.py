"""Generated SBE (Simple Binary Encoding) message codec."""

import struct
from typing import List, Optional, Tuple
from io import BytesIO

class ExchangeMaxNumIcebergOrdersFilter:
    """SBE message: ExchangeMaxNumIcebergOrdersFilter."""

    TEMPLATE_ID = 17
    SCHEMA_ID = 3
    SCHEMA_VERSION = 2
    BLOCK_LENGTH = 8

    def __init__(self):
        self.filter_type = None
        self.max_num_iceberg_orders = None

    def encode(self) -> bytes:
        """Encode the message to bytes."""
        buffer = BytesIO()

        if self.max_num_iceberg_orders is not None:
            buffer.write(struct.pack('<q', self.max_num_iceberg_orders))

        return buffer.getvalue()

    def decode(self, data: bytes) -> None:
        """Decode the message from bytes."""
        buffer = BytesIO(data)

        self.max_num_iceberg_orders = struct.unpack('<q', buffer.read(8))[0]
