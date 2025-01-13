from abc import ABC, abstractmethod
from typing import Generator, Generic, List, TypeVar

from .._calldata_reader import CairoData
from .._context import (
    DeserializationContext,
    SerializationContext,
)

# Python type that is accepted by a serializer
# pylint: disable=invalid-name
SerializationType = TypeVar("SerializationType")

# Python type that will be returned from a serializer. Often same as SerializationType.
# pylint: disable=invalid-name
DeserializationType = TypeVar("DeserializationType")


class CairoDataSerializer(ABC, Generic[SerializationType, DeserializationType]):
    """
    Base class for serializing/deserializing data to/from calldata.
    """

    def deserialize(self, data: List[int]) -> DeserializationType:
        """
        Transform calldata into python value.

        :param data: calldata to deserialize.
        :return: defined DeserializationType.
        """
        with DeserializationContext.create(data) as context:
            return self.deserialize_with_context(context)

    def serialize(self, data: SerializationType) -> CairoData:
        """
        Transform python data into calldata.

        :param data: data to serialize.
        :return: calldata.
        """
        with SerializationContext.create() as context:
            serialized_data = list(self.serialize_with_context(context, data))

            return self.remove_units_from_serialized_data(serialized_data)

    @abstractmethod
    def deserialize_with_context(
        self, context: DeserializationContext
    ) -> DeserializationType:
        """
        Transform calldata into python value.

        :param context: context of this deserialization.
        :return: defined DeserializationType.
        """

    @abstractmethod
    def serialize_with_context(
        self, context: SerializationContext, value: SerializationType
    ) -> Generator[int, None, None]:
        """
        Transform python value into calldata.

        :param context: context of this serialization.
        :param value: python value to serialize.
        :return: defined SerializationType.
        """

    @staticmethod
    def remove_units_from_serialized_data(serialized_data: List) -> List:
        return [x for x in serialized_data if x is not None]
