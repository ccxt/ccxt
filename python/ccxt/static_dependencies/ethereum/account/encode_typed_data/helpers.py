from typing import (
    Any,
)

from ...utils import (
    is_hexstr,
)


def _get_eip712_solidity_types():
    types = ["bool", "address", "string", "bytes", "uint", "int"]
    ints = [f"int{(x + 1) * 8}" for x in range(32)]
    uints = [f"uint{(x + 1) * 8}" for x in range(32)]
    bytes_ = [f"bytes{x + 1}" for x in range(32)]
    return types + ints + uints + bytes_


EIP712_SOLIDITY_TYPES = _get_eip712_solidity_types()


def is_array_type(type_: str) -> bool:
    return type_.endswith("]")


def is_0x_prefixed_hexstr(value: Any) -> bool:
    return is_hexstr(value) and value.startswith("0x")


# strip all brackets: Person[][] -> Person
def parse_core_array_type(type_: str) -> str:
    if is_array_type(type_):
        type_ = type_[: type_.index("[")]
    return type_


# strip only last set of brackets: Person[3][1] -> Person[3]
def parse_parent_array_type(type_: str) -> str:
    if is_array_type(type_):
        type_ = type_[: type_.rindex("[")]
    return type_
