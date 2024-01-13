from cytoolz import (
    identity,
)
from eth_utils import (
    is_binary_address,
    is_checksum_address,
    is_dict,
)
from eth_utils.curried import (
    apply_one_of_formatters,
    hexstr_if_str,
    is_0x_prefixed,
    is_address,
    is_bytes,
    is_integer,
    is_list_like,
    is_string,
    to_bytes,
    to_int,
)

VALID_EMPTY_ADDRESSES = {None, b"", ""}


def is_none(val):
    return val is None


def is_valid_address(value):
    return is_binary_address(value) or is_checksum_address(value)


def is_int_or_prefixed_hexstr(val):
    if is_integer(val):
        return True
    elif isinstance(val, str) and is_0x_prefixed(val):
        return True
    else:
        return False


def is_empty_or_checksum_address(val):
    if val in VALID_EMPTY_ADDRESSES:
        return True
    else:
        return is_valid_address(val)


def is_rpc_structured_access_list(val):
    """Returns true if 'val' is a valid JSON-RPC structured access list."""
    if not is_list_like(val):
        return False
    for d in val:
        if not is_dict(d):
            return False
        if len(d) != 2:
            return False
        address = d.get("address")
        storage_keys = d.get("storageKeys")
        if any(_ is None for _ in (address, storage_keys)):
            return False
        if not is_address(address):
            return False
        if not is_list_like(storage_keys):
            return False
        for storage_key in storage_keys:
            if not is_int_or_prefixed_hexstr(storage_key):
                return False
    return True


def is_rlp_structured_access_list(val):
    """Returns true if 'val' is a valid rlp-structured access list."""
    if not is_list_like(val):
        return False
    for item in val:
        if not is_list_like(item):
            return False
        if len(item) != 2:
            return False
        address, storage_keys = item
        if not is_address(address):
            return False
        for storage_key in storage_keys:
            if not is_int_or_prefixed_hexstr(storage_key):
                return False
    return True


LEGACY_TRANSACTION_FORMATTERS = {
    "nonce": hexstr_if_str(to_int),
    "gasPrice": hexstr_if_str(to_int),
    "gas": hexstr_if_str(to_int),
    "to": apply_one_of_formatters(
        (
            (is_string, hexstr_if_str(to_bytes)),
            (is_bytes, identity),
            (is_none, lambda val: b""),
        )
    ),
    "value": hexstr_if_str(to_int),
    "data": hexstr_if_str(to_bytes),
    "v": hexstr_if_str(to_int),
    "r": hexstr_if_str(to_int),
    "s": hexstr_if_str(to_int),
}

LEGACY_TRANSACTION_VALID_VALUES = {
    "nonce": is_int_or_prefixed_hexstr,
    "gasPrice": is_int_or_prefixed_hexstr,
    "gas": is_int_or_prefixed_hexstr,
    "to": is_empty_or_checksum_address,
    "value": is_int_or_prefixed_hexstr,
    "data": lambda val: isinstance(val, (int, str, bytes, bytearray)),
    "chainId": lambda val: val is None or is_int_or_prefixed_hexstr(val),
}
