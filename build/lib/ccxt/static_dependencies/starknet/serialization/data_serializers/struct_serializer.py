from dataclasses import dataclass
from typing import Dict, Generator, OrderedDict

from .._context import (
    DeserializationContext,
    SerializationContext,
)
from ._common import (
    deserialize_to_dict,
    serialize_from_dict,
)
from .cairo_data_serializer import (
    CairoDataSerializer,
)


@dataclass
class StructSerializer(CairoDataSerializer[Dict, Dict]):
    """
    Serializer of custom structures.
    Can serialize a dictionary.
    Deserializes data to a dictionary.

    Example:
    {"a": 1, "b": 2} => [1,2]
    """

    serializers: OrderedDict[str, CairoDataSerializer]

    def deserialize_with_context(self, context: DeserializationContext) -> Dict:
        return deserialize_to_dict(self.serializers, context)

    def serialize_with_context(
        self, context: SerializationContext, value: Dict
    ) -> Generator[int, None, None]:
        yield from serialize_from_dict(self.serializers, context, value)
