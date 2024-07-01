from typing import Any, Dict, List, Tuple

from eth_hash.auto import keccak

from starkware.cairo.lang.vm.crypto import pedersen_hash
from starkware.python.utils import from_bytes

MASK_250 = 2**250 - 1

# MAX_STORAGE_ITEM_SIZE and ADDR_BOUND must be consistent with the corresponding constant in
# starkware/starknet/core/storage/storage.cairo.
MAX_STORAGE_ITEM_SIZE = 256
ADDR_BOUND = 2**251 - MAX_STORAGE_ITEM_SIZE

# OS context offset.
SYSCALL_PTR_OFFSET_IN_VERSION0 = 0

CONSTRUCTOR_ENTRY_POINT_NAME = "constructor"
DEFAULT_ENTRY_POINT_NAME = "__default__"
DEFAULT_L1_ENTRY_POINT_NAME = "__l1_default__"
DEFAULT_ENTRY_POINT_SELECTOR = 0
EXECUTE_ENTRY_POINT_NAME = "__execute__"
TRANSFER_ENTRY_POINT_NAME = "transfer"
VALIDATE_ENTRY_POINT_NAME = "__validate__"
VALIDATE_DECLARE_ENTRY_POINT_NAME = "__validate_declare__"
VALIDATE_DEPLOY_ENTRY_POINT_NAME = "__validate_deploy__"
ACCOUNT_ENTRY_POINT_NAMES = {
    EXECUTE_ENTRY_POINT_NAME,
    VALIDATE_ENTRY_POINT_NAME,
    VALIDATE_DECLARE_ENTRY_POINT_NAME,
}
EXTENDED_ACCOUNT_ENTRY_POINT_NAMES = {*ACCOUNT_ENTRY_POINT_NAMES, VALIDATE_DEPLOY_ENTRY_POINT_NAME}

AbiEntryType = Dict[str, Any]
AbiType = List[AbiEntryType]


def starknet_keccak(data: bytes) -> int:
    """
    A variant of eth-keccak that computes a value that fits in a StarkNet field element.
    """

    return from_bytes(keccak(data)) & MASK_250


def get_selector_from_name(func_name: str) -> int:
    if func_name in [DEFAULT_ENTRY_POINT_NAME, DEFAULT_L1_ENTRY_POINT_NAME]:
        return DEFAULT_ENTRY_POINT_SELECTOR

    return starknet_keccak(data=func_name.encode("ascii"))


CONSTRUCTOR_ENTRY_POINT_SELECTOR = get_selector_from_name(func_name=CONSTRUCTOR_ENTRY_POINT_NAME)
EXECUTE_ENTRY_POINT_SELECTOR = get_selector_from_name(func_name=EXECUTE_ENTRY_POINT_NAME)
TRANSFER_ENTRY_POINT_SELECTOR = get_selector_from_name(func_name=TRANSFER_ENTRY_POINT_NAME)
VALIDATE_ENTRY_POINT_SELECTOR = get_selector_from_name(func_name=VALIDATE_ENTRY_POINT_NAME)
VALIDATE_DECLARE_ENTRY_POINT_SELECTOR = get_selector_from_name(
    func_name=VALIDATE_DECLARE_ENTRY_POINT_NAME
)
VALIDATE_DEPLOY_ENTRY_POINT_SELECTOR = get_selector_from_name(
    func_name=VALIDATE_DEPLOY_ENTRY_POINT_NAME
)


SELECTOR_TO_NAME = {
    CONSTRUCTOR_ENTRY_POINT_SELECTOR: CONSTRUCTOR_ENTRY_POINT_NAME,
    EXECUTE_ENTRY_POINT_SELECTOR: EXECUTE_ENTRY_POINT_NAME,
    TRANSFER_ENTRY_POINT_SELECTOR: TRANSFER_ENTRY_POINT_NAME,
    VALIDATE_ENTRY_POINT_SELECTOR: VALIDATE_ENTRY_POINT_NAME,
    VALIDATE_DECLARE_ENTRY_POINT_SELECTOR: VALIDATE_DECLARE_ENTRY_POINT_NAME,
    VALIDATE_DEPLOY_ENTRY_POINT_SELECTOR: VALIDATE_DEPLOY_ENTRY_POINT_NAME,
}


def get_storage_var_address(var_name: str, *args) -> int:
    """
    Returns the storage address of a StarkNet storage variable given its name and arguments.
    """
    res = starknet_keccak(var_name.encode("ascii"))

    for arg in args:
        assert isinstance(arg, int), f"Expected arguments to be integers. Found: {arg}."
        res = pedersen_hash(res, arg)

    return res % ADDR_BOUND


def get_uint256_storage_var_keys(var_name: str, *args) -> Tuple[int, int]:
    low_key = get_storage_var_address(var_name, *args)
    return (low_key, low_key + 1)
