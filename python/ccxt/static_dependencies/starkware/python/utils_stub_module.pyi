from typing import Any, Generic, Iterable, Iterator, Tuple, TypeVar, overload


# Type variables.

_T_co = TypeVar("_T_co", covariant=True)
_T = TypeVar("_T")
_T1 = TypeVar("_T1")
_T2 = TypeVar("_T2")
_T3 = TypeVar("_T3")
_T4 = TypeVar("_T4")
_T5 = TypeVar("_T5")


# Stubs.

class safe_zip(Iterator[_T_co], Generic[_T_co]):
    @overload
    def __new__(cls, __iter1: Iterable[_T1]) -> safe_zip[Tuple[_T1]]: ...

    @overload
    def __new__(
        cls, __iter1: Iterable[_T1], __iter2: Iterable[_T2]
    ) -> safe_zip[Tuple[_T1, _T2]]: ...

    @overload
    def __new__(
        cls, __iter1: Iterable[_T1], __iter2: Iterable[_T2], __iter3: Iterable[_T3]
    ) -> safe_zip[Tuple[_T1, _T2, _T3]]: ...

    @overload
    def __new__(
        cls,
        __iter1: Iterable[_T1],
        __iter2: Iterable[_T2],
        __iter3: Iterable[_T3],
        __iter4: Iterable[_T4],
    ) -> safe_zip[Tuple[_T1, _T2, _T3, _T4]]: ...

    @overload
    def __new__(
        cls,
        __iter1: Iterable[_T1],
        __iter2: Iterable[_T2],
        __iter3: Iterable[_T3],
        __iter4: Iterable[_T4],
        __iter5: Iterable[_T5],
    ) -> safe_zip[Tuple[_T1, _T2, _T3, _T4, _T5]]: ...

    @overload
    def __new__(
        cls,
        __iter1: Iterable[_T1],
        __iter2: Iterable[_T2],
        __iter3: Iterable[_T3],
        __iter4: Iterable[_T4],
        __iter5: Iterable[_T5],
        *iterables: Iterable[Any],
    ) -> safe_zip[Tuple[Any, ...]]: ...

    def __iter__(self) -> Iterator[_T_co]: ...
    def __next__(self) -> _T_co: ...
