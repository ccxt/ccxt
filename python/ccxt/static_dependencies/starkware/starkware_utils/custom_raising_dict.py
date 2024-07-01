from abc import ABC
from collections import UserDict
from typing import Generic, Type, TypeVar

from frozendict import frozendict

KT = TypeVar("KT")
VT = TypeVar("VT")


class CustomRaisingDict(ABC, UserDict, Generic[KT, VT]):
    """
    A dictionary that raises a custom exception.
    The exception's type must be a subclass of KeyError.
    """

    @property
    @classmethod
    def exception_type(cls) -> Type[Exception]:
        raise NotImplementedError()

    @classmethod
    def __init_subclass__(cls, exception_type: Type[Exception], **kwargs):
        super().__init_subclass__(**kwargs)  # type: ignore[call-arg]

        assert issubclass(exception_type, KeyError), "Exception type must subclass KeyError."
        cls.exception_type = exception_type  # type: ignore

    def __getitem__(self, key: KT) -> VT:
        try:
            return super().__getitem__(key)
        except KeyError:
            raise self.exception_type(key) from None

    def __delitem__(self, key: KT):
        try:
            super().__delitem__(key)
        except KeyError:
            raise self.exception_type(key) from None


class CustomRaisingFrozenDict(frozendict, Generic[KT, VT]):
    """
    A frozen CustomRaisingDict.
    For a nonexistent key k in D, D[k] will raise a custom exception; del D[k] will raise a
    TypeError (as in frozendict).
    """

    @classmethod
    def __init_subclass__(cls, exception_type: Type[Exception], **kwargs):
        super().__init_subclass__(**kwargs)  # type: ignore[call-arg]

        class _CustomRaisingFrozenDict(CustomRaisingDict[KT, VT], exception_type=exception_type):
            pass

        _CustomRaisingFrozenDict.__name__ = (
            _CustomRaisingFrozenDict.__qualname__
        ) = "CustomRaisingFrozenDict"

        cls.dict_cls = _CustomRaisingFrozenDict  # type: ignore

    def __hash__(self):
        """
        Calculates the hash of the dictionary, without taking its order into account.
        The type is concatenated so that the hash will not equal the hash of the tuple of items.
        This is implemented in order to avoid using frozendict's __hash__, which does not use
        cls.dict_cls.items().
        """
        return hash((self.dict_cls, frozenset(self.items())))
