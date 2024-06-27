from ..constants import (
    DEFAULT_ENTRY_POINT_NAME,
    DEFAULT_ENTRY_POINT_SELECTOR,
    DEFAULT_L1_ENTRY_POINT_NAME,
)
from ..hash.utils import _starknet_keccak


def get_selector_from_name(func_name: str) -> int:
    """
    Returns the selector of a contract's function name.
    """
    if func_name in [DEFAULT_ENTRY_POINT_NAME, DEFAULT_L1_ENTRY_POINT_NAME]:
        return DEFAULT_ENTRY_POINT_SELECTOR

    return _starknet_keccak(data=func_name.encode("ascii"))
