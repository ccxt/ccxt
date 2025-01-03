import re
from typing import (
    Any,
    Union,
    cast,
)

from ..typing import (
    Address,
    AnyAddress,
    ChecksumAddress,
    HexAddress,
    HexStr,
)

from .conversions import (
    hexstr_if_str,
    to_hex,
    to_bytes,
)
from ...keccak import (
    SHA3 as keccak,
)
from .hexadecimal import (
    add_0x_prefix,
    decode_hex,
    encode_hex,
    remove_0x_prefix,
)
from .types import (
    is_bytes,
    is_text,
)

_HEX_ADDRESS_REGEXP = re.compile("(0x)?[0-9a-f]{40}", re.IGNORECASE | re.ASCII)


def is_hex_address(value: Any) -> bool:
    """
    Checks if the given string of text type is an address in hexadecimal encoded form.
    """
    if not is_text(value):
        return False
    return _HEX_ADDRESS_REGEXP.fullmatch(value) is not None


def is_binary_address(value: Any) -> bool:
    """
    Checks if the given string is an address in raw bytes form.
    """
    if not is_bytes(value):
        return False
    elif len(value) != 20:
        return False
    else:
        return True


def is_address(value: Any) -> bool:
    """
    Is the given string an address in any of the known formats?
    """
    if is_hex_address(value):
        if _is_checksum_formatted(value):
            return is_checksum_address(value)
        return True

    if is_binary_address(value):
        return True

    return False


def to_normalized_address(value: Union[AnyAddress, str, bytes]) -> HexAddress:
    """
    Converts an address to its normalized hexadecimal representation.
    """
    try:
        hex_address = hexstr_if_str(to_hex, value).lower()
    except AttributeError:
        raise TypeError(f"Value must be any string, instead got type {type(value)}")
    if is_address(hex_address):
        return HexAddress(HexStr(hex_address))
    else:
        raise ValueError(
            f"Unknown format {repr(value)}, attempted to normalize to "
            f"{repr(hex_address)}"
        )


def is_normalized_address(value: Any) -> bool:
    """
    Returns whether the provided value is an address in its normalized form.
    """
    if not is_address(value):
        return False
    else:
        is_equal = value == to_normalized_address(value)
        return cast(bool, is_equal)


def to_canonical_address(address: Union[AnyAddress, str, bytes]) -> Address:
    """
    Convert a valid address to its canonical form (20-length bytes).
    """
    return Address(decode_hex(to_normalized_address(address)))


def is_canonical_address(address: Any) -> bool:
    """
    Returns `True` if the `value` is an address in its canonical form.
    """
    if not is_bytes(address) or len(address) != 20:
        return False
    is_equal = address == to_canonical_address(address)
    return cast(bool, is_equal)


def is_same_address(left: AnyAddress, right: AnyAddress) -> bool:
    """
    Checks if both addresses are same or not.
    """
    if not is_address(left) or not is_address(right):
        raise ValueError("Both values must be valid addresses")
    else:
        return bool(to_normalized_address(left) == to_normalized_address(right))


def to_checksum_address(value: Union[AnyAddress, str, bytes]) -> ChecksumAddress:
    """
    Makes a checksum address given a supported format.
    """
    norm_address = to_normalized_address(value)
    address_hash = encode_hex(keccak(to_bytes(text=remove_0x_prefix(HexStr(norm_address)))))

    checksum_address = add_0x_prefix(
        HexStr(
            "".join(
                (
                    norm_address[i].upper()
                    if int(address_hash[i], 16) > 7
                    else norm_address[i]
                )
                for i in range(2, 42)
            )
        )
    )
    return ChecksumAddress(HexAddress(checksum_address))


def is_checksum_address(value: Any) -> bool:
    if not is_text(value):
        return False

    if not is_hex_address(value):
        return False
    is_equal = value == to_checksum_address(value)
    return cast(bool, is_equal)


def _is_checksum_formatted(value: Any) -> bool:
    unprefixed_value = remove_0x_prefix(value)
    return (
        not unprefixed_value.islower()
        and not unprefixed_value.isupper()
        and not unprefixed_value.isnumeric()
    )


def is_checksum_formatted_address(value: Any) -> bool:
    return is_hex_address(value) and _is_checksum_formatted(value)
