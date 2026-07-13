from __future__ import annotations

from collections import OrderedDict
from typing import Dict, List, Union

from ..abi.v0 import Abi as AbiV0
from ..abi.v1 import Abi as AbiV1
from ..abi.v2 import Abi as AbiV2
from ..cairo.data_types import (
    ArrayType,
    BoolType,
    CairoType,
    EnumType,
    EventType,
    FeltType,
    NamedTupleType,
    OptionType,
    StructType,
    TupleType,
    UintType,
    UnitType,
)
from .data_serializers import (
    BoolSerializer,
    ByteArraySerializer,
)
from .data_serializers.array_serializer import ArraySerializer
from .data_serializers.cairo_data_serializer import (
    CairoDataSerializer,
)
from .data_serializers.enum_serializer import EnumSerializer
from .data_serializers.felt_serializer import FeltSerializer
from .data_serializers.named_tuple_serializer import (
    NamedTupleSerializer,
)
from .data_serializers.option_serializer import (
    OptionSerializer,
)
from .data_serializers.output_serializer import (
    OutputSerializer,
)
from .data_serializers.payload_serializer import (
    PayloadSerializer,
)
from .data_serializers.struct_serializer import (
    StructSerializer,
)
from .data_serializers.tuple_serializer import TupleSerializer
from .data_serializers.uint256_serializer import (
    Uint256Serializer,
)
from .data_serializers.uint_serializer import UintSerializer
from .data_serializers.unit_serializer import UnitSerializer
from .errors import InvalidTypeException
from .function_serialization_adapter import (
    FunctionSerializationAdapter,
    FunctionSerializationAdapterV1,
)

_uint256_type = StructType("Uint256", OrderedDict(low=FeltType(), high=FeltType()))
_byte_array_type = StructType(
    "core::byte_array::ByteArray",
    OrderedDict(
        data=ArrayType(FeltType()),
        pending_word=FeltType(),
        pending_word_len=UintType(bits=32),
    ),
)


def serializer_for_type(cairo_type: CairoType) -> CairoDataSerializer:
    """
    Create a serializer for cairo type.

    :param cairo_type: CairoType.
    :return: CairoDataSerializer.
    """
    # pylint: disable=too-many-return-statements, too-many-branches
    if isinstance(cairo_type, FeltType):
        return FeltSerializer()

    if isinstance(cairo_type, BoolType):
        return BoolSerializer()

    if isinstance(cairo_type, StructType):
        # Special case: Uint256 is represented as struct
        if cairo_type == _uint256_type:
            return Uint256Serializer()

        if cairo_type == _byte_array_type:
            return ByteArraySerializer()

        return StructSerializer(
            OrderedDict(
                (name, serializer_for_type(member_type))
                for name, member_type in cairo_type.types.items()
            )
        )

    if isinstance(cairo_type, ArrayType):
        return ArraySerializer(serializer_for_type(cairo_type.inner_type))

    if isinstance(cairo_type, TupleType):
        return TupleSerializer(
            [serializer_for_type(member) for member in cairo_type.types]
        )

    if isinstance(cairo_type, NamedTupleType):
        return NamedTupleSerializer(
            OrderedDict(
                (name, serializer_for_type(member_type))
                for name, member_type in cairo_type.types.items()
            )
        )

    if isinstance(cairo_type, UintType):
        return UintSerializer(bits=cairo_type.bits)

    if isinstance(cairo_type, OptionType):
        return OptionSerializer(serializer_for_type(cairo_type.type))

    if isinstance(cairo_type, UnitType):
        return UnitSerializer()

    if isinstance(cairo_type, EnumType):
        return EnumSerializer(
            OrderedDict(
                (name, serializer_for_type(variant_type))
                for name, variant_type in cairo_type.variants.items()
            )
        )
    if isinstance(cairo_type, EventType):
        return serializer_for_payload(cairo_type.types)

    raise InvalidTypeException(f"Received unknown Cairo type '{cairo_type}'.")


# We don't want to require users to use OrderedDict. Regular python requires order since python 3.7.
def serializer_for_payload(payload: Dict[str, CairoType]) -> PayloadSerializer:
    """
    Create PayloadSerializer for types listed in a dictionary. Please note that the order of fields in the dict is
    very important. Make sure the keys are provided in the right order.

    :param payload: dictionary with cairo types.
    :return: PayloadSerializer that can be used to (de)serialize events/function calls.
    """
    return PayloadSerializer(
        OrderedDict(
            (name, serializer_for_type(cairo_type))
            for name, cairo_type in payload.items()
        )
    )


def serializer_for_outputs(payload: List[CairoType]) -> OutputSerializer:
    """
    Create OutputSerializer for types in list. Please note that the order of fields in the list is
    very important. Make sure the types are provided in the right order.

    :param payload: list with cairo types.
    :return: OutputSerializer that can be used to deserialize function outputs.
    """
    return OutputSerializer(
        serializers=[serializer_for_type(cairo_type) for cairo_type in payload]
    )


EventV0 = AbiV0.Event
EventV1 = AbiV1.Event
EventV2 = EventType


def serializer_for_event(event: EventV0 | EventV1 | EventV2) -> PayloadSerializer:
    """
    Create serializer for an event.

    :param event: parsed event.
    :return: PayloadSerializer that can be used to (de)serialize events.
    """
    if isinstance(event, EventV0):
        return serializer_for_payload(event.data)
    if isinstance(event, EventV1):
        return serializer_for_payload(event.inputs)
    return serializer_for_payload(event.types)


def serializer_for_function(
    abi_function: AbiV0.Function,
) -> FunctionSerializationAdapter:
    """
    Create FunctionSerializationAdapter for serializing function inputs and deserializing function outputs.

    :param abi_function: parsed function's abi.
    :return: FunctionSerializationAdapter.
    """
    return FunctionSerializationAdapter(
        inputs_serializer=serializer_for_payload(abi_function.inputs),
        outputs_deserializer=serializer_for_payload(abi_function.outputs),
    )


def serializer_for_function_v1(
    abi_function: Union[AbiV1.Function, AbiV2.Function],
) -> FunctionSerializationAdapter:
    """
    Create FunctionSerializationAdapter for serializing function inputs and deserializing function outputs.

    :param abi_function: parsed function's abi.
    :return: FunctionSerializationAdapter.
    """
    return FunctionSerializationAdapterV1(
        inputs_serializer=serializer_for_payload(abi_function.inputs),
        outputs_deserializer=serializer_for_outputs(abi_function.outputs),
    )


def serializer_for_constructor_v2(
    abi_function: AbiV2.Constructor,
) -> FunctionSerializationAdapter:
    """
    Create FunctionSerializationAdapter for serializing constructor inputs.

    :param abi_function: parsed constructor's abi.
    :return: FunctionSerializationAdapter.
    """
    return FunctionSerializationAdapterV1(
        inputs_serializer=serializer_for_payload(abi_function.inputs),
        outputs_deserializer=serializer_for_outputs([]),
    )
