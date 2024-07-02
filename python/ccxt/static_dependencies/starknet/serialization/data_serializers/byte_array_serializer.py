from dataclasses import dataclass
from typing import Generator

from ...cairo.felt import decode_shortstring, encode_shortstring
from .._context import (
    DeserializationContext,
    SerializationContext,
)
from ._common import (
    deserialize_to_list,
    serialize_from_list,
)
from .cairo_data_serializer import (
    CairoDataSerializer,
)
from .felt_serializer import FeltSerializer

BYTES_31_SIZE = 31


@dataclass
class ByteArraySerializer(CairoDataSerializer[str, str]):
    """
    Serializer for ByteArrays. Serializes to and deserializes from str values.

    Examples:
    "" => [0,0,0]
    "hello" => [0,448378203247,5]
    """

    def deserialize_with_context(self, context: DeserializationContext) -> str:
        with context.push_entity("data_array_len"):
            [size] = context.reader.read(1)

        data = deserialize_to_list([FeltSerializer()] * size, context)

        with context.push_entity("pending_word"):
            [pending_word] = context.reader.read(1)

        with context.push_entity("pending_word_len"):
            [pending_word_len] = context.reader.read(1)

        pending_word = decode_shortstring(pending_word)
        context.ensure_valid_value(
            len(pending_word) == pending_word_len,
            f"Invalid length {pending_word_len} for pending word {pending_word}",
        )

        data_joined = "".join(map(decode_shortstring, data))
        return data_joined + pending_word

    def serialize_with_context(
        self, context: SerializationContext, value: str
    ) -> Generator[int, None, None]:
        context.ensure_valid_type(value, isinstance(value, str), "str")
        data = [
            value[i : i + BYTES_31_SIZE] for i in range(0, len(value), BYTES_31_SIZE)
        ]
        pending_word = (
            "" if len(data) == 0 or len(data[-1]) == BYTES_31_SIZE else data.pop(-1)
        )

        yield len(data)
        yield from serialize_from_list([FeltSerializer()] * len(data), context, data)
        yield encode_shortstring(pending_word)
        yield len(pending_word)
