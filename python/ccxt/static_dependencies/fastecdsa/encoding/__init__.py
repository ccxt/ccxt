from abc import ABCMeta, abstractmethod

from ..point import Point


class KeyEncoder:
    """Base class that any encoding class for EC keys should derive from.

    All overriding methods should be static. If your key encoder writes binary
    data you must have a field named :code:`binary_data` set to :code:`True` in
    order for keys to correctly read from and write to disk.
    """
    __metaclass__ = ABCMeta

    @staticmethod
    @abstractmethod
    def encode_public_key(Q: Point):
        pass

    @staticmethod
    @abstractmethod
    def encode_private_key(d: int):
        pass

    @staticmethod
    @abstractmethod
    def decode_public_key(data) -> Point:
        pass

    @staticmethod
    @abstractmethod
    def decode_private_key(data) -> (int, Point):
        pass


class SigEncoder:
    """Base class that any encoding class for EC signatures should derive from.

    All overriding methods should be static.
    """
    __metaclass__ = ABCMeta

    @staticmethod
    @abstractmethod
    def encode_signature(r: int, s: int) -> bytes:
        pass

    @staticmethod
    @abstractmethod
    def decode_signature(binary_data: bytes) -> (int, int):
        pass
