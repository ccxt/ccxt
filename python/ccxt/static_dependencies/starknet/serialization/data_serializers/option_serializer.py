from dataclasses import dataclass
from typing import Any, Generator, Optional

from .._context import (
    DeserializationContext,
    SerializationContext,
)
from .cairo_data_serializer import (
    CairoDataSerializer,
)


@dataclass
class OptionSerializer(CairoDataSerializer[Optional[Any], Optional[Any]]):
    """
    Serializer for Option type.
    Can serialize None and common CairoTypes.
    Deserializes data to None or CairoType.

    Example:
        None => [1]
        {"option1": 123, "option2": None} => [0, 123, 1]
    """

    serializer: CairoDataSerializer

    def deserialize_with_context(
        self, context: DeserializationContext
    ) -> Optional[Any]:
        (is_none,) = context.reader.read(1)
        if is_none == 1:
            return None

        return self.serializer.deserialize_with_context(context)

    def serialize_with_context(
        self, context: SerializationContext, value: Optional[Any]
    ) -> Generator[int, None, None]:
        if value is None:
            yield 1
        else:
            yield 0
            yield from self.serializer.serialize_with_context(context, value)
