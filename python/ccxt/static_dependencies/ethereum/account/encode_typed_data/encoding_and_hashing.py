from typing import (
    Any,
    Dict,
    List,
    Tuple,
    Union,
)

from ...abi import (
    encode,
)
from ....keccak import (
    SHA3 as keccak
)
from ...utils import (
    to_bytes,
    to_int,
)

from .helpers import (
    EIP712_SOLIDITY_TYPES,
    is_0x_prefixed_hexstr,
    is_array_type,
    parse_core_array_type,
    parse_parent_array_type,
)


def get_primary_type(types: Dict[str, List[Dict[str, str]]]) -> str:
    custom_types = set(types.keys())
    custom_types_that_are_deps = set()

    for type_ in custom_types:
        type_fields = types[type_]
        for field in type_fields:
            parsed_type = parse_core_array_type(field["type"])
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
        raise ValueError(f"Missing value for field `{name}` of type `{type_}`")

    elif is_array_type(type_):
        # handle array type with non-array value
        if not isinstance(value, list):
            raise ValueError(
                f"Invalid value for field `{name}` of type `{type_}`: "
                f"expected array, got `{value}` of type `{type(value)}`"
            )

        parsed_type = parse_parent_array_type(type_)
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
            if is_0x_prefixed_hexstr(value):
                value = to_bytes(hexstr=value)
            elif isinstance(value, str):
                value = to_bytes(text=value)
            else:
                if isinstance(value, int) and value < 0:
                    value = 0

                value = to_bytes(value)

        return (
            # keccak hash if dynamic `bytes` type
            ("bytes32", keccak(value))
            if type_ == "bytes"
            # if fixed bytesXX type, do not hash
            else (type_, value)
        )

    elif type_ == "string":
        if isinstance(value, int):
            value = to_bytes(value)
        else:
            value = to_bytes(text=value)
        return ("bytes32", keccak(value))

    # allow string values for int and uint types
    elif type(value) == str and type_.startswith(("int", "uint")):
        if is_0x_prefixed_hexstr(value):
            return (type_, to_int(hexstr=value))
        else:
            return (type_, to_int(text=value))

    return (type_, value)


def find_type_dependencies(type_, types, results=None):
    if results is None:
        results = set()

    # a type must be a string
    if not isinstance(type_, str):
        raise ValueError(
            "Invalid find_type_dependencies input: expected string, got "
            f"`{type_}` of type `{type(type_)}`"
        )
    # get core type if it's an array type
    type_ = parse_core_array_type(type_)

    if (
        # don't look for dependencies of solidity types
        type_ in EIP712_SOLIDITY_TYPES
        # found a type that's already been added
        or type_ in results
    ):
        return results

    # found a type that isn't defined
    elif type_ not in types:
        raise ValueError(f"No definition of type `{type_}`")

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
            child_type = child["type"]
            child_name = child["name"]
            children_list.append(f"{child_type} {child_name}")

        result += f"{type_}({','.join(children_list)})"
    return result


def hash_type(type_: str, types: Dict[str, List[Dict[str, str]]]) -> bytes:
    return keccak(to_bytes(text=encode_type(type_, types)))


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
            raise ValueError(f"Invalid domain key: `{k}`")

    domain_types = {
        "EIP712Domain": [
            eip712_domain_map[k] for k in eip712_domain_map.keys() if k in domain_data
        ]
    }

    return hash_struct("EIP712Domain", domain_types, domain_data)
