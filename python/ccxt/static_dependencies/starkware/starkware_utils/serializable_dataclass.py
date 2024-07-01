from typing import ClassVar, Optional, Type, TypeVar

import marshmallow

from starkware.starkware_utils.serializable import StringSerializable

TSerializableDataclass = TypeVar("TSerializableDataclass", bound="SerializableMarshmallowDataclass")


class SerializableMarshmallowDataclass(StringSerializable):
    """
    Base class to classes decorated with marshmallow_dataclass.dataclass, implementing the
    Serializable interface.
    """

    Schema: ClassVar[Type[marshmallow.Schema]]

    def dump(self) -> dict:
        return self.Schema().dump(obj=self)

    @classmethod
    def load(cls: Type[TSerializableDataclass], data: dict) -> TSerializableDataclass:
        return cls.Schema().load(data=data)

    def dumps(self, indent: Optional[int] = None, sort_keys: Optional[bool] = None) -> str:
        sort_keys = False if sort_keys is None else sort_keys
        # An indent level of 0 will only insert newlines; 'None' is the most compact representation.
        return self.Schema().dumps(obj=self, indent=indent, sort_keys=sort_keys)

    @classmethod
    def loads(cls: Type[TSerializableDataclass], data: str) -> TSerializableDataclass:
        return cls.Schema().loads(json_data=data)
