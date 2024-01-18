import collections
import functools
import itertools
from typing import (  # noqa: F401
    Any,
    Callable,
    Dict,
    Iterable,
    List,
    Mapping,
    Set,
    Tuple,
    TypeVar,
    Union,
)

from .toolz import (
    compose as _compose,
)

T = TypeVar("T")


def identity(value: T) -> T:
    return value


TGIn = TypeVar("TGIn")
TGOut = TypeVar("TGOut")
TFOut = TypeVar("TFOut")


def combine(
    f: Callable[[TGOut], TFOut], g: Callable[[TGIn], TGOut]
) -> Callable[[TGIn], TFOut]:
    return lambda x: f(g(x))


def apply_to_return_value(
    callback: Callable[..., T]
) -> Callable[..., Callable[..., T]]:
    def outer(fn: Callable[..., T]) -> Callable[..., T]:
        # We would need to type annotate *args and **kwargs but doing so segfaults
        # the PyPy builds. We ignore instead.
        @functools.wraps(fn)
        def inner(*args, **kwargs) -> T:  # type: ignore
            return callback(fn(*args, **kwargs))

        return inner

    return outer


TVal = TypeVar("TVal")
TKey = TypeVar("TKey")
to_tuple = apply_to_return_value(
    tuple
)  # type: Callable[[Callable[..., Iterable[TVal]]], Callable[..., Tuple[TVal, ...]]]  # noqa: E501
to_list = apply_to_return_value(
    list
)  # type: Callable[[Callable[..., Iterable[TVal]]], Callable[..., List[TVal]]]  # noqa: E501
to_set = apply_to_return_value(
    set
)  # type: Callable[[Callable[..., Iterable[TVal]]], Callable[..., Set[TVal]]]  # noqa: E501
to_dict = apply_to_return_value(
    dict
)  # type: Callable[[Callable[..., Iterable[Union[Mapping[TKey, TVal], Tuple[TKey, TVal]]]]], Callable[..., Dict[TKey, TVal]]]  # noqa: E501
to_ordered_dict = apply_to_return_value(
    collections.OrderedDict
)  # type: Callable[[Callable[..., Iterable[Union[Mapping[TKey, TVal], Tuple[TKey, TVal]]]]], Callable[..., collections.OrderedDict[TKey, TVal]]]  # noqa: E501
sort_return = _compose(to_tuple, apply_to_return_value(sorted))
flatten_return = _compose(
    to_tuple, apply_to_return_value(itertools.chain.from_iterable)
)
reversed_return = _compose(to_tuple, apply_to_return_value(reversed), to_tuple)
