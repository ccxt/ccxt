from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Set, Tuple

from ..cairo.felt import CairoData
from .data_serializers.output_serializer import (
    OutputSerializer,
)
from .data_serializers.payload_serializer import (
    PayloadSerializer,
)
from .errors import InvalidTypeException
from .tuple_dataclass import TupleDataclass


@dataclass
class FunctionSerializationAdapter:
    """
    Class serializing ``*args`` and ``**kwargs`` by adapting them to function inputs.
    """

    inputs_serializer: PayloadSerializer
    outputs_deserializer: PayloadSerializer

    expected_args: Tuple[str] = field(init=False)

    def __post_init__(self):
        self.expected_args = tuple(
            self.inputs_serializer.serializers.keys()
        )  # pyright: ignore

    def serialize(self, *args, **kwargs) -> CairoData:
        """
        Method using args and kwargs to match members and serialize them separately.

        :return: Members serialized separately in SerializedPayload.
        """
        named_arguments = self._merge_arguments(args, kwargs)
        return self.inputs_serializer.serialize(named_arguments)

    def deserialize(self, data: List[int]) -> TupleDataclass:
        """
        Deserializes data into TupleDataclass containing python representations.

        :return: cairo data.
        """
        return self.outputs_deserializer.deserialize(data)

    def _merge_arguments(self, args: Tuple, kwargs: Dict) -> Dict:
        """
        Merges positional and keyed arguments.
        """
        # After this line we know that len(args) <= len(self.expected_args)
        self._ensure_no_unnecessary_positional_args(args)

        named_arguments = dict(kwargs)
        for arg, input_name in zip(args, self.expected_args):
            if input_name in kwargs:
                raise InvalidTypeException(
                    f"Both positional and named argument provided for '{input_name}'."
                )
            named_arguments[input_name] = arg

        expected_args = set(self.expected_args)
        provided_args = set(named_arguments.keys())

        # named_arguments might have unnecessary arguments coming from kwargs (we ensure that
        # len(args) <= len(self.expected_args) above)
        self._ensure_no_unnecessary_args(expected_args, provided_args)

        # there might be some argument missing (not provided)
        self._ensure_no_missing_args(expected_args, provided_args)

        return named_arguments

    def _ensure_no_unnecessary_positional_args(self, args: Tuple):
        if len(args) > len(self.expected_args):
            raise InvalidTypeException(
                f"Provided {len(args)} positional arguments, {len(self.expected_args)} possible."
            )

    @staticmethod
    def _ensure_no_unnecessary_args(expected_args: Set[str], provided_args: Set[str]):
        excessive_arguments = provided_args - expected_args
        if excessive_arguments:
            raise InvalidTypeException(
                f"Unnecessary named arguments provided: '{', '.join(excessive_arguments)}'."
            )

    @staticmethod
    def _ensure_no_missing_args(expected_args: Set[str], provided_args: Set[str]):
        missing_arguments = expected_args - provided_args
        if missing_arguments:
            raise InvalidTypeException(
                f"Missing arguments: '{', '.join(missing_arguments)}'."
            )


@dataclass
class FunctionSerializationAdapterV1(FunctionSerializationAdapter):
    outputs_deserializer: OutputSerializer

    def deserialize(self, data: List[int]) -> Tuple:
        """
        Deserializes data into TupleDataclass containing python representations.

        :return: cairo data.
        """
        return self.outputs_deserializer.deserialize(data)
