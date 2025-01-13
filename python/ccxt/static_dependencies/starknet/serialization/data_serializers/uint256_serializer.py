from dataclasses import dataclass
from typing import Generator, TypedDict, Union

from ...cairo.felt import uint256_range_check
from .._context import (
    Context,
    DeserializationContext,
    SerializationContext,
)
from .cairo_data_serializer import (
    CairoDataSerializer,
)

U128_UPPER_BOUND = 2**128


class Uint256Dict(TypedDict):
    low: int
    high: int


@dataclass
class Uint256Serializer(CairoDataSerializer[Union[int, Uint256Dict], int]):
    """
    Serializer of Uint256. In Cairo it is represented by structure {low: Uint128, high: Uint128}.
    Can serialize an int.
    Deserializes data to an int.

    Examples:
    0 => [0,0]
    1 => [1,0]
    2**128 => [0,1]
    3 + 2**128 => [3,1]
    """

    def deserialize_with_context(self, context: DeserializationContext) -> int:
        [low, high] = context.reader.read(2)

        # Checking if resulting value is in [0, 2**256) range is not enough. Uint256 should be made of two uint128.
        with context.push_entity("low"):
            self._ensure_valid_uint128(low, context)
        with context.push_entity("high"):
            self._ensure_valid_uint128(high, context)

        return (high << 128) + low

    def serialize_with_context(
        self, context: SerializationContext, value: Union[int, Uint256Dict]
    ) -> Generator[int, None, None]:
        context.ensure_valid_type(value, isinstance(value, (int, dict)), "int or dict")
        if isinstance(value, int):
            yield from self._serialize_from_int(value)
        else:
            yield from self._serialize_from_dict(context, value)

    @staticmethod
    def _serialize_from_int(value: int) -> Generator[int, None, None]:
        uint256_range_check(value)
        result = (value % 2**128, value // 2**128)
        yield from result

    def _serialize_from_dict(
        self, context: SerializationContext, value: Uint256Dict
    ) -> Generator[int, None, None]:
        with context.push_entity("low"):
            self._ensure_valid_uint128(value["low"], context)
            yield value["low"]
        with context.push_entity("high"):
            self._ensure_valid_uint128(value["high"], context)
            yield value["high"]

    @staticmethod
    def _ensure_valid_uint128(value: int, context: Context):
        context.ensure_valid_value(
            0 <= value < U128_UPPER_BOUND, "expected value in range [0;2**128)"
        )
