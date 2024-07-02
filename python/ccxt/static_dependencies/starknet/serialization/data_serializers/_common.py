# We have to use parametrised type from typing
from collections import OrderedDict as _OrderedDict
from typing import Dict, Generator, List, OrderedDict

from .._context import (
    DeserializationContext,
    SerializationContext,
)
from .cairo_data_serializer import (
    CairoDataSerializer,
)

# The actual serialization logic is very similar among all serializers: they either serialize data based on
# position or their name. Having this logic reused adds indirection, but makes sure proper logic is used everywhere.


def deserialize_to_list(
    deserializers: List[CairoDataSerializer], context: DeserializationContext
) -> List:
    """
    Deserializes data from context to list. This logic is used in every sequential type (arrays and tuples).
    """
    result = []

    for index, serializer in enumerate(deserializers):
        with context.push_entity(f"[{index}]"):
            result.append(serializer.deserialize_with_context(context))

    return result


def deserialize_to_dict(
    deserializers: OrderedDict[str, CairoDataSerializer],
    context: DeserializationContext,
) -> OrderedDict:
    """
    Deserializes data from context to dictionary. This logic is used in every type with named fields (structs,
    named tuples and payloads).
    """
    result = _OrderedDict()

    for key, serializer in deserializers.items():
        with context.push_entity(key):
            result[key] = serializer.deserialize_with_context(context)

    return result


def serialize_from_list(
    serializers: List[CairoDataSerializer], context: SerializationContext, values: List
) -> Generator[int, None, None]:
    """
    Serializes data from list. This logic is used in every sequential type (arrays and tuples).
    """
    context.ensure_valid_value(
        len(serializers) == len(values),
        f"expected {len(serializers)} elements, {len(values)} provided",
    )

    for index, (serializer, value) in enumerate(zip(serializers, values)):
        with context.push_entity(f"[{index}]"):
            yield from serializer.serialize_with_context(context, value)


def serialize_from_dict(
    serializers: OrderedDict[str, CairoDataSerializer],
    context: SerializationContext,
    values: Dict,
) -> Generator[int, None, None]:
    """
    Serializes data from dict. This logic is used in every type with named fields (structs, named tuples and payloads).
    """
    excessive_keys = set(values.keys()).difference(serializers.keys())
    context.ensure_valid_value(
        not excessive_keys,
        f"unexpected keys '{','.join(excessive_keys)}' were provided",
    )

    for name, serializer in serializers.items():
        with context.push_entity(name):
            context.ensure_valid_value(name in values, f"key '{name}' is missing")
            yield from serializer.serialize_with_context(context, values[name])
