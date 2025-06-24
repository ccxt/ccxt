from dataclasses import dataclass
from typing import Dict, Generator, OrderedDict, Tuple, Union

from .._context import (
    DeserializationContext,
    SerializationContext,
)
from .cairo_data_serializer import (
    CairoDataSerializer,
)
from ..tuple_dataclass import TupleDataclass


@dataclass
class EnumSerializer(CairoDataSerializer[Union[Dict, TupleDataclass], TupleDataclass]):
    """
    Serializer of enums.
    Can serialize a dictionary and TupleDataclass.
    Deserializes data to a TupleDataclass.

    Example:
        enum MyEnum {
          a: u128,
          b: u128
        }

        {"a": 1} => [0, 1]
        {"b": 100} => [1, 100]
        TupleDataclass(variant='a', value=100) => [0, 100]
    """

    serializers: OrderedDict[str, CairoDataSerializer]

    def deserialize_with_context(
        self, context: DeserializationContext
    ) -> TupleDataclass:
        [variant_index] = context.reader.read(1)
        variant_name, serializer = self._get_variant(variant_index)

        with context.push_entity("enum.variant: " + variant_name):
            result_dict = {
                "variant": variant_name,
                "value": serializer.deserialize_with_context(context),
            }

        return TupleDataclass.from_dict(result_dict)

    def serialize_with_context(
        self, context: SerializationContext, value: Union[Dict, TupleDataclass]
    ) -> Generator[int, None, None]:
        if isinstance(value, Dict):
            items = list(value.items())
            if len(items) != 1:
                raise ValueError(
                    "Can serialize only one enum variant, got: " + str(len(items))
                )

            variant_name, variant_value = items[0]
        else:
            variant_name, variant_value = value

        yield self._get_variant_index(variant_name)
        yield from self.serializers[variant_name].serialize_with_context(
            context, variant_value
        )

    def _get_variant(self, variant_index: int) -> Tuple[str, CairoDataSerializer]:
        return list(self.serializers.items())[variant_index]

    def _get_variant_index(self, variant_name: str) -> int:
        return list(self.serializers.keys()).index(variant_name)
