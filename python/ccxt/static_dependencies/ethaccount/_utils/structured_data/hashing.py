from itertools import (
    groupby,
)
import json
from operator import (
    itemgetter,
)

from eth_abi import (
    encode,
    is_encodable,
    is_encodable_type,
)
from eth_abi.grammar import (
    parse,
)
from eth_utils import (
    keccak,
    to_tuple,
)

from .validation import (
    validate_structured_data,
)


def get_dependencies(primary_type, types):
    """
    Perform DFS to get all the dependencies of the primary_type.
    """
    deps = set()
    struct_names_yet_to_be_expanded = [primary_type]

    while len(struct_names_yet_to_be_expanded) > 0:
        struct_name = struct_names_yet_to_be_expanded.pop()

        deps.add(struct_name)
        fields = types[struct_name]
        for field in fields:
            field_type = field["type"]

            # Handle array types
            if is_array_type(field_type):
                field_type = field_type[: field_type.index("[")]

            if field_type not in types:
                # We don't need to expand types that are not user defined (customized)
                continue
            elif field_type not in deps:
                # Custom Struct Type
                struct_names_yet_to_be_expanded.append(field_type)
            elif field_type in deps:
                # skip types that we have already encountered
                continue
            else:
                raise TypeError(
                    f"Unable to determine type dependencies with type `{field_type}`."
                )
    # Don't need to make a struct as dependency of itself
    deps.remove(primary_type)

    return tuple(deps)


def field_identifier(field):
    """
    Convert a field dict into a typed-name string.

    Given a ``field`` of the format {'name': NAME, 'type': TYPE},
    this function converts it to ``TYPE NAME``
    """
    return f"{field['type']} {field['name']}"


def encode_struct(struct_name, struct_field_types):
    return f"{struct_name}({','.join(map(field_identifier, struct_field_types))})"


def encode_type(primary_type, types):
    """
    Serialize types into an encoded string.

    The type of a struct is encoded as:
    name ‖ "(" ‖ member₁ ‖ "," ‖ member₂ ‖ "," ‖ … ‖ memberₙ ")"
    where each member is written as type ‖ " " ‖ name.
    """
    # Getting the dependencies and sorting them alphabetically as per EIP712
    deps = get_dependencies(primary_type, types)
    sorted_deps = (primary_type,) + tuple(sorted(deps))

    result = "".join(
        [encode_struct(struct_name, types[struct_name]) for struct_name in sorted_deps]
    )
    return result


def hash_struct_type(primary_type, types):
    return keccak(text=encode_type(primary_type, types))


def is_array_type(type):
    return type.endswith("]")


@to_tuple
def get_depths_and_dimensions(data, depth):
    """
    Yields 2-length tuples of depth and dimension of each element at that depth.
    """
    if not isinstance(data, (list, tuple)):
        # Not checking for Iterable instance, because even Dictionaries and strings
        # are considered as iterables, but that's not what we want the condition to be.
        return ()

    yield depth, len(data)

    for item in data:
        # iterating over all 1 dimension less sub-data items
        yield from get_depths_and_dimensions(item, depth + 1)


def get_array_dimensions(data):
    """
    Given an array type data item, check that it is an array and return the dimensions
    as a tuple, in order from inside to outside.

    Ex: get_array_dimensions([[1, 2, 3], [4, 5, 6]]) returns (3, 2)
    """
    depths_and_dimensions = get_depths_and_dimensions(data, 0)

    # re-form as a dictionary with `depth` as key, and all of the dimensions
    # found at that depth.
    grouped_by_depth = {
        depth: tuple(dimension for depth, dimension in group)
        for depth, group in groupby(depths_and_dimensions, itemgetter(0))
    }

    dimensions = tuple(
        # check that all dimensions are the same, else use "dynamic"
        dimensions[0] if all(dim == dimensions[0] for dim in dimensions) else "dynamic"
        for _depth, dimensions in sorted(grouped_by_depth.items(), reverse=True)
    )

    return dimensions


def encode_field(types, name, field_type, value):
    if value is None:
        raise ValueError(f"Missing value for field {name} of type {field_type}")

    if field_type in types:
        return ("bytes32", keccak(encode_data(field_type, types, value)))

    if field_type == "bytes":
        if not isinstance(value, bytes):
            raise TypeError(
                f"Value of field `{name}` ({value}) is of the type `{type(value)}`, "
                f"but expected bytes value"
            )

        return ("bytes32", keccak(value))

    if field_type == "string":
        if not isinstance(value, str):
            raise TypeError(
                f"Value of field `{name}` ({value}) is of the type `{type(value)}`, "
                f"but expected string value"
            )

        return ("bytes32", keccak(text=value))

    if is_array_type(field_type):
        # Get the dimensions from the value
        array_dimensions = get_array_dimensions(value)
        # Get the dimensions from what was declared in the schema
        parsed_field_type = parse(field_type)

        for i in range(len(array_dimensions)):
            if len(parsed_field_type.arrlist[i]) == 0:
                # Skip empty or dynamically declared dimensions
                continue
            if array_dimensions[i] != parsed_field_type.arrlist[i][0]:
                # Dimensions should match with declared schema
                raise TypeError(
                    f"Array data `{value}` has dimensions `{array_dimensions}`"
                    f" whereas the schema has dimensions "
                    f"`{tuple(map(lambda x: x[0] if x else 'dynamic', parsed_field_type.arrlist))}`"  # noqa: E501
                )

        field_type_of_inside_array = field_type[: field_type.rindex("[")]
        field_type_value_pairs = [
            encode_field(types, name, field_type_of_inside_array, item)
            for item in value
        ]

        # handle empty array
        if value:
            data_types, data_hashes = zip(*field_type_value_pairs)
        else:
            data_types, data_hashes = [], []

        return ("bytes32", keccak(encode(data_types, data_hashes)))

    # First checking to see if field_type is valid as per abi
    if not is_encodable_type(field_type):
        raise TypeError(f"Received Invalid type `{field_type}` in field `{name}`")

    # Next, see if the value is encodable as the specified field_type
    if is_encodable(field_type, value):
        # field_type is a valid type and the provided value is encodable as that type
        return (field_type, value)
    else:
        raise TypeError(
            f"Value of `{name}` ({value}) is not encodable as type `{field_type}`. "
            f"If the base type is correct, verify that the value does not "
            f"exceed the specified size for the type."
        )


def encode_data(primary_type, types, data):
    encoded_types = ["bytes32"]
    encoded_values = [hash_struct_type(primary_type, types)]

    for field in types[primary_type]:
        type, value = encode_field(
            types, field["name"], field["type"], data[field["name"]]
        )
        encoded_types.append(type)
        encoded_values.append(value)

    return encode(encoded_types, encoded_values)


def load_and_validate_structured_message(structured_json_string_data):
    structured_data = json.loads(structured_json_string_data)
    validate_structured_data(structured_data)

    return structured_data


def hash_domain(structured_data):
    return keccak(
        encode_data("EIP712Domain", structured_data["types"], structured_data["domain"])
    )


def hash_message(structured_data):
    return keccak(
        encode_data(
            structured_data["primaryType"],
            structured_data["types"],
            structured_data["message"],
        )
    )
