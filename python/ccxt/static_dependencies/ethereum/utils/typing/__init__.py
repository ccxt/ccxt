import warnings

from .misc import (
    Address,
    AnyAddress,
    ChecksumAddress,
    HexAddress,
    HexStr,
    Primitives,
    T,
)

warnings.warn(
    "The eth_utils.typing module will be deprecated in favor "
    "of eth-typing in the next major version bump.",
    category=DeprecationWarning,
    stacklevel=2,
)
