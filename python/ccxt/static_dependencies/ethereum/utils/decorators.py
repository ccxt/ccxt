import functools
import itertools
from typing import (
    Any,
    Callable,
    Dict,
    Optional,
    Type,
    TypeVar,
)

from .types import (
    is_text,
)

T = TypeVar("T")


class combomethod:
    def __init__(self, method: Callable[..., Any]) -> None:
        self.method = method

    def __get__(
        self, obj: Optional[T] = None, objtype: Optional[Type[T]] = None
    ) -> Callable[..., Any]:
        @functools.wraps(self.method)
        def _wrapper(*args: Any, **kwargs: Any) -> Any:
            if obj is not None:
                return self.method(obj, *args, **kwargs)
            else:
                return self.method(objtype, *args, **kwargs)

        return _wrapper


def _has_one_val(*args: T, **kwargs: T) -> bool:
    vals = itertools.chain(args, kwargs.values())
    not_nones = list(filter(lambda val: val is not None, vals))
    return len(not_nones) == 1


def _assert_one_val(*args: T, **kwargs: T) -> None:
    if not _has_one_val(*args, **kwargs):
        raise TypeError(
            "Exactly one of the passed values can be specified. "
            f"Instead, values were: {repr(args)}, {repr(kwargs)}"
        )


def _hexstr_or_text_kwarg_is_text_type(**kwargs: T) -> bool:
    value = kwargs["hexstr"] if "hexstr" in kwargs else kwargs["text"]
    return is_text(value)


def _assert_hexstr_or_text_kwarg_is_text_type(**kwargs: T) -> None:
    if not _hexstr_or_text_kwarg_is_text_type(**kwargs):
        raise TypeError(
            "Arguments passed as hexstr or text must be of text type. "
            f"Instead, value was: {(repr(next(iter(list(kwargs.values())))))}"
        )


def _validate_supported_kwarg(kwargs: Any) -> None:
    if next(iter(kwargs)) not in ["primitive", "hexstr", "text"]:
        raise TypeError(
            "Kwarg must be 'primitive', 'hexstr', or 'text'. "
            f"Instead, kwarg was: {repr((next(iter(kwargs))))}"
        )


def validate_conversion_arguments(to_wrap: Callable[..., T]) -> Callable[..., T]:
    """
    Validates arguments for conversion functions.
    - Only a single argument is present
    - Kwarg must be 'primitive' 'hexstr' or 'text'
    - If it is 'hexstr' or 'text' that it is a text type
    """

    @functools.wraps(to_wrap)
    def wrapper(*args: Any, **kwargs: Any) -> T:
        _assert_one_val(*args, **kwargs)
        if kwargs:
            _validate_supported_kwarg(kwargs)

        if len(args) == 0 and "primitive" not in kwargs:
            _assert_hexstr_or_text_kwarg_is_text_type(**kwargs)
        return to_wrap(*args, **kwargs)

    return wrapper


def return_arg_type(at_position: int) -> Callable[..., Callable[..., T]]:
    """
    Wrap the return value with the result of `type(args[at_position])`.
    """

    def decorator(to_wrap: Callable[..., Any]) -> Callable[..., T]:
        @functools.wraps(to_wrap)
        def wrapper(*args: Any, **kwargs: Any) -> T:  # type: ignore
            result = to_wrap(*args, **kwargs)
            ReturnType = type(args[at_position])
            return ReturnType(result)  # type: ignore

        return wrapper

    return decorator


def replace_exceptions(
    old_to_new_exceptions: Dict[Type[BaseException], Type[BaseException]]
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """
    Replaces old exceptions with new exceptions to be raised in their place.
    """
    old_exceptions = tuple(old_to_new_exceptions.keys())

    def decorator(to_wrap: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(to_wrap)
        def wrapped(*args: Any, **kwargs: Any) -> T:
            try:
                return to_wrap(*args, **kwargs)
            except old_exceptions as err:
                try:
                    raise old_to_new_exceptions[type(err)](err) from err
                except KeyError:
                    raise TypeError(
                        f"could not look up new exception to use for {repr(err)}"
                    ) from err

        return wrapped

    return decorator
