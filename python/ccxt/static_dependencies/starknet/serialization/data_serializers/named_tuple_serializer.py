from dataclasses import dataclass
from typing import Dict, Generator, NamedTuple, OrderedDict, Union

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
from ..tuple_dataclass import TupleDataclass


@dataclass
class NamedTupleSerializer(
    CairoDataSerializer[Union[Dict, NamedTuple, TupleDataclass], TupleDataclass]
):
    """
    Serializer for tuples with named fields.
    Can serialize a dictionary, a named tuple and TupleDataclass.
    Deserializes data to a TupleDataclass.

    Example:
    {"a": 1, "b": 2} => [1,2]
    """

    serializers: OrderedDict[str, CairoDataSerializer]

    def deserialize_with_context(
        self, context: DeserializationContext
    ) -> TupleDataclass:
        as_dictionary = deserialize_to_dict(self.serializers, context)
        return TupleDataclass.from_dict(as_dictionary)

    def serialize_with_context(
        self,
        context: SerializationContext,
        value: Union[Dict, NamedTuple, TupleDataclass],
    ) -> Generator[int, None, None]:
        # We can't use isinstance(value, NamedTuple), because there is no NamedTuple type.
        context.ensure_valid_type(
            value,
            isinstance(value, (dict, TupleDataclass)) or self._is_namedtuple(value),
            "dict, NamedTuple or TupleDataclass",
        )

        # noinspection PyUnresolvedReferences, PyProtectedMember
        values: Dict = value if isinstance(value, dict) else value._asdict()

        yield from serialize_from_dict(self.serializers, context, values)

    @staticmethod
    def _is_namedtuple(value) -> bool:
        return isinstance(value, tuple) and hasattr(value, "_fields")
