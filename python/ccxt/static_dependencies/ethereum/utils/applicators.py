from typing import (
    Any,
    Callable,
    Dict,
    Generator,
    List,
    Tuple,
)
import warnings

from .decorators import (
    return_arg_type,
)
from .functional import (
    to_dict,
)
from .toolz import (
    compose,
    curry,
)

Formatters = Callable[[List[Any]], List[Any]]


@return_arg_type(2)
def apply_formatter_at_index(
    formatter: Callable[..., Any], at_index: int, value: List[Any]
) -> Generator[List[Any], None, None]:
    if at_index + 1 > len(value):
        raise IndexError(
            f"Not enough values in iterable to apply formatter. Got: {len(value)}. "
            f"Need: {at_index + 1}"
        )
    for index, item in enumerate(value):
        if index == at_index:
            yield formatter(item)
        else:
            yield item


def combine_argument_formatters(*formatters: List[Callable[..., Any]]) -> Formatters:
    warnings.warn(
        DeprecationWarning(
            "combine_argument_formatters(formatter1, formatter2)([item1, item2])"
            "has been deprecated and will be removed in a subsequent major version "
            "release of the eth-utils library. Update your calls to use "
            "apply_formatters_to_sequence([formatter1, formatter2], [item1, item2]) "
            "instead."
        ),
        stacklevel=2,
    )

    _formatter_at_index = curry(apply_formatter_at_index)
    return compose(  # type: ignore
        *(
            _formatter_at_index(formatter, index)
            for index, formatter in enumerate(formatters)
        )
    )


@return_arg_type(1)
def apply_formatters_to_sequence(
    formatters: List[Any], sequence: List[Any]
) -> Generator[List[Any], None, None]:
    if len(formatters) > len(sequence):
        raise IndexError(
            f"Too many formatters for sequence: {len(formatters)} formatters for "
            f"{repr(sequence)}"
        )
    elif len(formatters) < len(sequence):
        raise IndexError(
            f"Too few formatters for sequence: {len(formatters)} formatters for "
            f"{repr(sequence)}"
        )
    else:
        for formatter, item in zip(formatters, sequence):
            yield formatter(item)


def apply_formatter_if(
    condition: Callable[..., bool], formatter: Callable[..., Any], value: Any
) -> Any:
    if condition(value):
        return formatter(value)
    else:
        return value


@to_dict
def apply_formatters_to_dict(
    formatters: Dict[Any, Any], value: Dict[Any, Any]
) -> Generator[Tuple[Any, Any], None, None]:
    for key, item in value.items():
        if key in formatters:
            try:
                yield key, formatters[key](item)
            except ValueError as exc:
                new_error_message = (
                    f"Could not format invalid value {repr(item)} as field {repr(key)}"
                )
                raise ValueError(new_error_message) from exc
            except TypeError as exc:
                new_error_message = (
                    f"Could not format invalid type {repr(item)} as field {repr(key)}"
                )
                raise TypeError(new_error_message) from exc
        else:
            yield key, item


@return_arg_type(1)
def apply_formatter_to_array(
    formatter: Callable[..., Any], value: List[Any]
) -> Generator[List[Any], None, None]:
    for item in value:
        yield formatter(item)


def apply_one_of_formatters(
    formatter_condition_pairs: Tuple[Tuple[Callable[..., Any], Callable[..., Any]]],
    value: Any,
) -> Any:
    for condition, formatter in formatter_condition_pairs:
        if condition(value):
            return formatter(value)
    else:
        raise ValueError(
            "The provided value did not satisfy any of the formatter conditions"
        )


@to_dict
def apply_key_map(
    key_mappings: Dict[Any, Any], value: Dict[Any, Any]
) -> Generator[Tuple[Any, Any], None, None]:
    key_conflicts = (
        set(value.keys())
        .difference(key_mappings.keys())
        .intersection(v for k, v in key_mappings.items() if v in value)
    )
    if key_conflicts:
        raise KeyError(
            f"Could not apply key map due to conflicting key(s): {key_conflicts}"
        )

    for key, item in value.items():
        if key in key_mappings:
            yield key_mappings[key], item
        else:
            yield key, item
