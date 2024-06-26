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


class Uint256Dict(TypedDict):
    low: int
    high: int


@dataclass
class UintSerializer(CairoDataSerializer[Union[int, Uint256Dict], int]):
    """
    Serializer of uint. In Cairo there are few uints (u8, ..., u128 and u256).
    u256 is represented by structure {low: u128, high: u128}.
    Can serialize an int and dict.
    Deserializes data to an int.

    Examples:
        if bits < 256:
            0 => [0]
            1 => [1]
            2**128-1 => [2**128-1]
        else:
            0 => [0,0]
            1 => [1,0]
            2**128 => [0,1]
            3 + 2**128 => [3,1]
    """

    bits: int

    def deserialize_with_context(self, context: DeserializationContext) -> int:
        if self.bits < 256:
            (uint,) = context.reader.read(1)
            with context.push_entity("uint" + str(self.bits)):
                self._ensure_valid_uint(uint, context, self.bits)

            return uint

        [low, high] = context.reader.read(2)

        # Checking if resulting value is in [0, 2**256) range is not enough. Uint256 should be made of two uint128.
        with context.push_entity("low"):
            self._ensure_valid_uint(low, context, bits=128)
        with context.push_entity("high"):
            self._ensure_valid_uint(high, context, bits=128)

        return (high << 128) + low

    def serialize_with_context(
        self, context: SerializationContext, value: Union[int, Uint256Dict]
    ) -> Generator[int, None, None]:
        context.ensure_valid_type(value, isinstance(value, (int, dict)), "int or dict")
        if isinstance(value, int):
            yield from self._serialize_from_int(value, context, self.bits)
        else:
            yield from self._serialize_from_dict(context, value)

    @staticmethod
    def _serialize_from_int(
        value: int, context: SerializationContext, bits: int
    ) -> Generator[int, None, None]:
        if bits < 256:
            UintSerializer._ensure_valid_uint(value, context, bits)

            yield value
        else:
            uint256_range_check(value)

            result = (value % 2**128, value >> 128)
            yield from result

    def _serialize_from_dict(
        self, context: SerializationContext, value: Uint256Dict
    ) -> Generator[int, None, None]:
        with context.push_entity("low"):
            self._ensure_valid_uint(value["low"], context, bits=128)
            yield value["low"]
        with context.push_entity("high"):
            self._ensure_valid_uint(value["high"], context, bits=128)
            yield value["high"]

    @staticmethod
    def _ensure_valid_uint(value: int, context: Context, bits: int):
        """
        Ensures that value is a valid uint on `bits` bits.
        """
        context.ensure_valid_value(
            0 <= value < 2**bits, "expected value in range [0;2**" + str(bits) + ")"
        )
