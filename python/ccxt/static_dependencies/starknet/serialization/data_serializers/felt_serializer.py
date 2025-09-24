import warnings
from dataclasses import dataclass
from typing import Generator

from ...cairo.felt import encode_shortstring, is_in_felt_range
from ...constants import FIELD_PRIME
from .._context import (
    Context,
    DeserializationContext,
    SerializationContext,
)
from .cairo_data_serializer import (
    CairoDataSerializer,
)


@dataclass
class FeltSerializer(CairoDataSerializer[int, int]):
    """
    Serializer for field element. At the time of writing it is the only existing numeric type.
    """

    def deserialize_with_context(self, context: DeserializationContext) -> int:
        [val] = context.reader.read(1)
        self._ensure_felt(context, val)
        return val

    def serialize_with_context(
        self, context: SerializationContext, value: int
    ) -> Generator[int, None, None]:
        if isinstance(value, str):
            warnings.warn(
                "Serializing shortstrings in FeltSerializer is deprecated. "
                "Use starknet_py.cairo.felt.encode_shortstring instead.",
                category=DeprecationWarning,
            )
            value = encode_shortstring(value)
            yield value
            return

        context.ensure_valid_type(value, isinstance(value, int), "int")
        self._ensure_felt(context, value)
        yield value

    @staticmethod
    def _ensure_felt(context: Context, value: int):
        context.ensure_valid_value(
            is_in_felt_range(value),
            f"invalid value '{value}' - must be in [0, {FIELD_PRIME}) range",
        )
