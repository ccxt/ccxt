from dataclasses import dataclass
from typing import Generator

from .._context import (
    Context,
    DeserializationContext,
    SerializationContext,
)
from .cairo_data_serializer import (
    CairoDataSerializer,
)


@dataclass
class BoolSerializer(CairoDataSerializer[bool, int]):
    """
    Serializer for boolean.
    """

    def deserialize_with_context(self, context: DeserializationContext) -> bool:
        [val] = context.reader.read(1)
        self._ensure_bool(context, val)
        return bool(val)

    def serialize_with_context(
        self, context: SerializationContext, value: bool
    ) -> Generator[int, None, None]:
        context.ensure_valid_type(value, isinstance(value, bool), "bool")
        self._ensure_bool(context, value)
        yield int(value)

    @staticmethod
    def _ensure_bool(context: Context, value: int):
        context.ensure_valid_value(
            value in [0, 1],
            f"invalid value '{value}' - must be in [0, 2) range",
        )
