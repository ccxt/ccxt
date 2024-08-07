from dataclasses import dataclass
from typing import Generator, Iterable, List

from .._context import (
    DeserializationContext,
    SerializationContext,
)
from ..data_serializers._common import (
    deserialize_to_list,
    serialize_from_list,
)
from ..data_serializers.cairo_data_serializer import (
    CairoDataSerializer,
)


@dataclass
class ArraySerializer(CairoDataSerializer[Iterable, List]):
    """
    Serializer for arrays. In abi they are represented as a pointer to a type.
    Can serialize any iterable and prepends its length to resulting list.
    Deserializes data to a list.

    Examples:
    [1,2,3] => [3,1,2,3]
    [] => [0]
    """

    inner_serializer: CairoDataSerializer

    def deserialize_with_context(self, context: DeserializationContext) -> List:
        with context.push_entity("len"):
            [size] = context.reader.read(1)

        return deserialize_to_list([self.inner_serializer] * size, context)

    def serialize_with_context(
        self, context: SerializationContext, value: List
    ) -> Generator[int, None, None]:
        yield len(value)
        yield from serialize_from_list(
            [self.inner_serializer] * len(value), context, value
        )
