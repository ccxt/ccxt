import inspect
from abc import ABC, abstractmethod
from json import JSONDecoder, JSONEncoder
from typing import ClassVar, Dict, Optional, Type, TypeVar

from starkware.python.utils import camel_to_snake_case

TSerializableObject = TypeVar("TSerializableObject", bound="Serializable")
TStrSerializableObject = TypeVar("TStrSerializableObject", bound="StringSerializable")


class Serializable(ABC):
    """
    Base class to classes whose objects can be (de)serialized.
    """

    class_name_prefix: ClassVar[bytes]

    @classmethod
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)  # type: ignore[call-arg]

        cls.class_name_prefix = camel_to_snake_case(camel_case_name=cls.__name__).encode("ascii")

    @classmethod
    def prefix(cls) -> bytes:
        """
        Converts the class name to a lower case name with '_' as separators and returns the
        bytes version of this name. For example HelloWorldAB -> b'hello_world_a_b'.
        """
        return cls.class_name_prefix

    @abstractmethod
    def serialize(self) -> bytes:
        pass

    @classmethod
    @abstractmethod
    def deserialize(cls: Type[TSerializableObject], data: bytes) -> TSerializableObject:
        pass


class StringSerializable(Serializable):
    """
    A class that has dumps and loads functions to convert its objects to and from strings.

    Classes implementing the dumps (and loads) methods can be automatically encoded using
    an extended JSON as follows:

    The get_encoder and get_decoder can be used to extend the JSON mechanism to encode and
    decode StringSerializable. This extended JSON can process any object built from
    1.  JSON-serializable objects: string, int, float, int or float derived enums, booleans, None
    2.  StringSerializable class,
    3.  Nested objects in lists, dictionaries and tuples.

    In order to be able to use this extended JSON to encode a StringSerializable class CLS,
    you need to:
    1.  Make sure the class CLS is defined before using json,
    2.  create an encoder=StringSerializable.get_encoder()
    3.  use it in JSON by json.dumps(object_to_dump, cls=self.encoder)
        Similarly, in the decoder use instead:
    4.  json.loads(encoded_string, cls=self.decoder)

    Remarks:
    1.  Note that in order to encode and decode a class CLS, it must be defined before you create
        the encoder and the decoder.
    2.  If a class B extends A which implements the dumps method, then when using this extended
        JSON mechanism, object of type B will be encoded and decoded as type A objects.
        If B wants to use a different loads function (even if it has the same dumps as A),
        then it needs to implement the dumps function.
    """

    _classes: ClassVar[Dict[str, Type["StringSerializable"]]] = {}
    _serialize_name: ClassVar[str]

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)  # type: ignore[call-arg]

        # Look for closest parent that implements the dumps method. Use this class when
        # dumping and loading.
        for mro_cls in inspect.getmro(cls):
            if mro_cls is StringSerializable:
                # The dumps method is abstract.
                continue
            if "dumps" in mro_cls.__dict__:
                cls._serialize_name = f"{mro_cls}"
                StringSerializable._classes[cls._serialize_name] = cls

    @abstractmethod
    def dumps(self, indent: Optional[int] = None, sort_keys: bool = False) -> str:
        pass

    @classmethod
    @abstractmethod
    def loads(cls: Type[TStrSerializableObject], data: str) -> TStrSerializableObject:
        pass

    def serialize(self) -> bytes:
        return self.dumps().encode("ascii")

    @classmethod
    def deserialize(cls: Type[TStrSerializableObject], data: bytes) -> TStrSerializableObject:
        return cls.loads(data=data.decode("ascii"))

    class SerializableEncoder(JSONEncoder):
        def default(self, obj):
            if isinstance(obj, StringSerializable):
                if obj._serialize_name in StringSerializable._classes:
                    return {"_serializable": obj._serialize_name, "value": obj.dumps()}

            return JSONEncoder.default(self, obj)

    @staticmethod
    def get_encoder() -> Type[JSONEncoder]:
        return StringSerializable.SerializableEncoder

    class SerializableDecoder(JSONDecoder):
        def __init__(self, *args, **kwargs):
            super().__init__(object_hook=self.object_hook, *args, **kwargs)

        def object_hook(self, obj):
            if "_serializable" not in obj:
                return obj
            cls_repr = obj["_serializable"]
            serialized_class = StringSerializable._classes.get(cls_repr, None)
            assert serialized_class is not None, f"Could not decode the class {cls_repr}."
            return serialized_class.loads(data=obj["value"])

    @staticmethod
    def get_decoder() -> Type[JSONDecoder]:
        return StringSerializable.SerializableDecoder
