"""
Minimal, hand-rolled replacement for the previously vendored `eth-abi`,
`eth-account` and `eth-utils`/`toolz` packages.

Only the functionality actually used by ccxt is implemented:

- ``encode(types, args)``: standard Ethereum ABI (head/tail) encoding of the
  elementary types ``uintN``/``intN``/``address``/``bool``/``bytesN``/
  ``bytes``/``string`` and (nested) fixed-size/dynamic arrays thereof.
- ``hash_domain`` / ``hash_eip712_message``: EIP-712 typed structured data
  hashing, behaviour-compatible with ``eth_account.messages.encode_typed_data``.
"""

from .abi import encode
from .typed_data import (
    encode_typed_data,
    get_primary_type,
    hash_domain,
    hash_eip712_message,
)

__all__ = [
    'encode',
    'encode_typed_data',
    'get_primary_type',
    'hash_domain',
    'hash_eip712_message',
]
