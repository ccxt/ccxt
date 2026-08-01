"""
Hand-rolled EIP-712 typed structured data hashing.

Behaviour-compatible with the previously vendored
``eth_account.messages.encode_typed_data`` /
``eth_account._utils.encode_typed_data.encoding_and_hashing`` implementation
(in a manner compatible with the MetaMask and Ethers ``signTypedData``
functions), see https://eips.ethereum.org/EIPS/eip-712
"""

import re
from typing import Any, Dict, List, NamedTuple, Tuple, Union

from ..keccak import SHA3 as keccak
from .abi import encode

_HEX_REGEXP = re.compile("(0[xX])?[0-9a-fA-F]*")


def _is_hexstr(value: Any) -> bool:
    if not isinstance(value, str) or not value:
        return False
    return _HEX_REGEXP.fullmatch(value) is not None


def _is_0x_prefixed_hexstr(value: Any) -> bool:
    return _is_hexstr(value) and value.startswith("0x")


def _hexstr_to_bytes(hexstr: str) -> bytes:
    if hexstr[:2] in ("0x", "0X"):
        hexstr = hexstr[2:]
    if len(hexstr) % 2:
        hexstr = "0" + hexstr
    return bytes.fromhex(hexstr)


def _int_to_bytes(value: int) -> bytes:
    # minimal big-endian representation, b"\x00" for 0
    return value.to_bytes((value.bit_length() + 7) // 8 or 1, "big")


def _text_to_bytes(text: str) -> bytes:
    return text.encode("utf-8")


def _get_eip712_solidity_types():
    types = ["bool", "address", "string", "bytes", "uint", "int"]
    ints = ["int{}".format((x + 1) * 8) for x in range(32)]
    uints = ["uint{}".format((x + 1) * 8) for x in range(32)]
    bytes_ = ["bytes{}".format(x + 1) for x in range(32)]
    return types + ints + uints + bytes_


EIP712_SOLIDITY_TYPES = _get_eip712_solidity_types()


def _is_array_type(type_: str) -> bool:
    return type_.endswith("]")


# strip all brackets: Person[][] -> Person
def _parse_core_array_type(type_: str) -> str:
    if _is_array_type(type_):
        type_ = type_[: type_.index("[")]
    return type_


# strip only last set of brackets: Person[3][1] -> Person[3]
def _parse_parent_array_type(type_: str) -> str:
    if _is_array_type(type_):
        type_ = type_[: type_.rindex("[")]
    return type_


def get_primary_type(types: Dict[str, List[Dict[str, str]]]) -> str:
    custom_types = set(types.keys())
    custom_types_that_are_deps = set()

    for type_ in custom_types:
        type_fields = types[type_]
        for field in type_fields:
            parsed_type = _parse_core_array_type(field["type"])
            if parsed_type in custom_types and parsed_type != type_:
                custom_types_that_are_deps.add(parsed_type)

    primary_type = list(custom_types.difference(custom_types_that_are_deps))
    if len(primary_type) == 1:
        return primary_type[0]
    else:
        raise ValueError("Unable to determine primary type")


def encode_field(
    types: Dict[str, List[Dict[str, str]]],
    name: str,
    type_: str,
    value: Any,
) -> Tuple[str, Union[int, bytes]]:
    if type_ in types.keys():
        # type is a custom type
        if value is None:
            return ("bytes32", b"\x00" * 32)
        else:
            return ("bytes32", keccak(encode_data(type_, types, value)))

    elif type_ in ["string", "bytes"] and value is None:
        return ("bytes32", b"")

    # None is allowed only for custom and dynamic types
    elif value is None:
        raise ValueError(
            "Missing value for field `{}` of type `{}`".format(name, type_)
        )

    elif _is_array_type(type_):
        # handle array type with non-array value
        if not isinstance(value, list):
            raise ValueError(
                "Invalid value for field `{}` of type `{}`: expected array, "
                "got `{}` of type `{}`".format(name, type_, value, type(value))
            )

        parsed_type = _parse_parent_array_type(type_)
        type_value_pairs = [
            encode_field(types, name, parsed_type, item) for item in value
        ]
        if not type_value_pairs:
            # the keccak hash of `encode((), ())`
            return (
                "bytes32",
                b"\xc5\xd2F\x01\x86\xf7#<\x92~}\xb2\xdc\xc7\x03\xc0\xe5\x00\xb6S\xca\x82';{\xfa\xd8\x04]\x85\xa4p",  # noqa: E501
            )

        data_types, data_hashes = zip(*type_value_pairs)
        return ("bytes32", keccak(encode(data_types, data_hashes)))

    elif type_ == "bool":
        return (type_, bool(value))

    # all bytes types allow hexstr and str values
    elif type_.startswith("bytes"):
        if not isinstance(value, bytes):
            if _is_0x_prefixed_hexstr(value):
                value = _hexstr_to_bytes(value)
            elif isinstance(value, str):
                value = _text_to_bytes(value)
            else:
                if isinstance(value, int) and value < 0:
                    value = 0

                value = _int_to_bytes(value)

        return (
            # keccak hash if dynamic `bytes` type
            ("bytes32", keccak(value))
            if type_ == "bytes"
            # if fixed bytesXX type, do not hash
            else (type_, value)
        )

    elif type_ == "string":
        if isinstance(value, int):
            value = _int_to_bytes(value)
        else:
            value = _text_to_bytes(value)
        return ("bytes32", keccak(value))

    # allow string values for int and uint types
    elif type(value) == str and type_.startswith(("int", "uint")):
        if _is_0x_prefixed_hexstr(value):
            return (type_, int(value, 16))
        else:
            return (type_, int(value))

    return (type_, value)


def find_type_dependencies(type_, types, results=None):
    if results is None:
        results = set()

    # a type must be a string
    if not isinstance(type_, str):
        raise ValueError(
            "Invalid find_type_dependencies input: expected string, got "
            "`{}` of type `{}`".format(type_, type(type_))
        )
    # get core type if it's an array type
    type_ = _parse_core_array_type(type_)

    if (
        # don't look for dependencies of solidity types
        type_ in EIP712_SOLIDITY_TYPES
        # found a type that's already been added
        or type_ in results
    ):
        return results

    # found a type that isn't defined
    elif type_ not in types:
        raise ValueError("No definition of type `{}`".format(type_))

    results.add(type_)

    for field in types[type_]:
        find_type_dependencies(field["type"], types, results)
    return results


def encode_type(type_: str, types: Dict[str, List[Dict[str, str]]]) -> str:
    result = ""
    unsorted_deps = find_type_dependencies(type_, types)
    if type_ in unsorted_deps:
        unsorted_deps.remove(type_)

    deps = [type_] + sorted(list(unsorted_deps))
    for type_ in deps:
        children_list = []
        for child in types[type_]:
            children_list.append("{} {}".format(child["type"], child["name"]))

        result += "{}({})".format(type_, ",".join(children_list))
    return result


def hash_type(type_: str, types: Dict[str, List[Dict[str, str]]]) -> bytes:
    return keccak(_text_to_bytes(encode_type(type_, types)))


def encode_data(
    type_: str,
    types: Dict[str, List[Dict[str, str]]],
    data: Dict[str, Any],
) -> bytes:
    encoded_types: List[str] = ["bytes32"]
    encoded_values: List[Union[bytes, int]] = [hash_type(type_, types)]

    for field in types[type_]:
        type, value = encode_field(
            types, field["name"], field["type"], data.get(field["name"])
        )
        encoded_types.append(type)
        encoded_values.append(value)

    return encode(encoded_types, encoded_values)


def hash_struct(
    type_: str,
    types: Dict[str, List[Dict[str, str]]],
    data: Dict[str, Any],
) -> bytes:
    encoded = encode_data(type_, types, data)
    return keccak(encoded)


def hash_eip712_message(
    # returns the same hash as `hash_struct`, but automatically determines primary type
    message_types: Dict[str, List[Dict[str, str]]],
    message_data: Dict[str, Any],
) -> bytes:
    primary_type = get_primary_type(message_types)
    return keccak(encode_data(primary_type, message_types, message_data))


def hash_domain(domain_data: Dict[str, Any]) -> bytes:
    eip712_domain_map = {
        "name": {"name": "name", "type": "string"},
        "version": {"name": "version", "type": "string"},
        "chainId": {"name": "chainId", "type": "uint256"},
        "verifyingContract": {"name": "verifyingContract", "type": "address"},
        "salt": {"name": "salt", "type": "bytes32"},
    }

    for k in domain_data.keys():
        if k not in eip712_domain_map.keys():
            raise ValueError("Invalid domain key: `{}`".format(k))

    domain_types = {
        "EIP712Domain": [
            eip712_domain_map[k] for k in eip712_domain_map.keys() if k in domain_data
        ]
    }

    return hash_struct("EIP712Domain", domain_types, domain_data)


class SignableMessage(NamedTuple):
    """
    A message compatible with EIP-191 that is ready to be signed.
    """

    version: bytes  # must be length 1
    header: bytes  # aka "version specific data"
    body: bytes  # aka "data to sign"


def encode_typed_data(
    domain_data: Dict[str, Any] = None,
    message_types: Dict[str, Any] = None,
    message_data: Dict[str, Any] = None,
) -> SignableMessage:
    """
    Encode an EIP-712 message in a manner compatible with other implementations
    in use, such as the MetaMask and Ethers ``signTypedData`` functions.
    """
    return SignableMessage(
        b"\x01",
        hash_domain(domain_data),
        hash_eip712_message(message_types, message_data),
    )
