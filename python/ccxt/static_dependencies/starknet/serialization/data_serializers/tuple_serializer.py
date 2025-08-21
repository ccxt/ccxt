from dataclasses import dataclass
from typing import Generator, Iterable, List, Tuple

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


@dataclass
class TupleSerializer(CairoDataSerializer[Iterable, Tuple]):
    """
    Serializer for tuples without named fields.
    Can serialize any iterable.
    Deserializes data to a python tuple.

    Example:
    (1,2,(3,4)) => [1,2,3,4]
    """

    serializers: List[CairoDataSerializer]

    def deserialize_with_context(self, context: DeserializationContext) -> Tuple:
        return tuple(deserialize_to_list(self.serializers, context))

    def serialize_with_context(
        self, context: SerializationContext, value: Iterable
    ) -> Generator[int, None, None]:
        yield from serialize_from_list(self.serializers, context, [*value])
