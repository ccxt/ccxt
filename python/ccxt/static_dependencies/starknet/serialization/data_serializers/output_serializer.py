from dataclasses import dataclass, field
from typing import Dict, Generator, List, Tuple

from .._context import (
    DeserializationContext,
    SerializationContext,
)
from .cairo_data_serializer import (
    CairoDataSerializer,
)


@dataclass
class OutputSerializer(CairoDataSerializer[List, Tuple]):
    """
    Serializer for function output.
    Can't serialize anything.
    Deserializes data to a Tuple.

    Example:
        [1, 1, 1] => (340282366920938463463374607431768211457)
    """

    serializers: List[CairoDataSerializer] = field(init=True)

    def deserialize_with_context(self, context: DeserializationContext) -> Tuple:
        result = []

        for index, serializer in enumerate(self.serializers):
            with context.push_entity("output[" + str(index) + "]"):
                result.append(serializer.deserialize_with_context(context))

        return tuple(result)

    def serialize_with_context(
        self, context: SerializationContext, value: Dict
    ) -> Generator[int, None, None]:
        raise ValueError(
            "Output serializer can't be used to transform python data into calldata."
        )
