"""Utility methods for marshmallow."""

from __future__ import annotations

import collections
import datetime as dt
import functools
import inspect
import json
import re
import typing
import warnings
from collections.abc import Mapping
from email.utils import format_datetime, parsedate_to_datetime
from pprint import pprint as py_pprint

from .base import FieldABC
from .exceptions import FieldInstanceResolutionError
from .warnings import RemovedInMarshmallow4Warning

EXCLUDE = "exclude"
INCLUDE = "include"
RAISE = "raise"
_UNKNOWN_VALUES = {EXCLUDE, INCLUDE, RAISE}


class _Missing:
    def __bool__(self):
        return False

    def __copy__(self):
        return self

    def __deepcopy__(self, _):
        return self

    def __repr__(self):
        return "<marshmallow.missing>"


# Singleton value that indicates that a field's value is missing from input
# dict passed to :meth:`Schema.load`. If the field's value is not required,
# it's ``default`` value is used.
missing = _Missing()


def is_generator(obj) -> bool:
    """Return True if ``obj`` is a generator"""
    return inspect.isgeneratorfunction(obj) or inspect.isgenerator(obj)


def is_iterable_but_not_string(obj) -> bool:
    """Return True if ``obj`` is an iterable object that isn't a string."""
    return (hasattr(obj, "__iter__") and not hasattr(obj, "strip")) or is_generator(obj)


def is_collection(obj) -> bool:
    """Return True if ``obj`` is a collection type, e.g list, tuple, queryset."""
    return is_iterable_but_not_string(obj) and not isinstance(obj, Mapping)


def is_instance_or_subclass(val, class_) -> bool:
    """Return True if ``val`` is either a subclass or instance of ``class_``."""
    try:
        return issubclass(val, class_)
    except TypeError:
        return isinstance(val, class_)


def is_keyed_tuple(obj) -> bool:
    """Return True if ``obj`` has keyed tuple behavior, such as
    namedtuples or SQLAlchemy's KeyedTuples.
    """
    return isinstance(obj, tuple) and hasattr(obj, "_fields")


def pprint(obj, *args, **kwargs) -> None:
    """Pretty-printing function that can pretty-print OrderedDicts
    like regular dictionaries. Useful for printing the output of
    :meth:`marshmallow.Schema.dump`.

    .. deprecated:: 3.7.0
        marshmallow.pprint will be removed in marshmallow 4.
    """
    warnings.warn(
        "marshmallow's pprint function is deprecated and will be removed in marshmallow 4.",
        RemovedInMarshmallow4Warning,
        stacklevel=2,
    )
    if isinstance(obj, collections.OrderedDict):
        print(json.dumps(obj, *args, **kwargs))
    else:
        py_pprint(obj, *args, **kwargs)


# https://stackoverflow.com/a/27596917
def is_aware(datetime: dt.datetime) -> bool:
    return (
        datetime.tzinfo is not None and datetime.tzinfo.utcoffset(datetime) is not None
    )


def from_rfc(datestring: str) -> dt.datetime:
    """Parse a RFC822-formatted datetime string and return a datetime object.

    https://stackoverflow.com/questions/885015/how-to-parse-a-rfc-2822-date-time-into-a-python-datetime  # noqa: B950
    """
    return parsedate_to_datetime(datestring)


def rfcformat(datetime: dt.datetime) -> str:
    """Return the RFC822-formatted representation of a datetime object.

    :param datetime datetime: The datetime.
    """
    return format_datetime(datetime)


# Hat tip to Django for ISO8601 deserialization functions

_iso8601_datetime_re = re.compile(
    r"(?P<year>\d{4})-(?P<month>\d{1,2})-(?P<day>\d{1,2})"
    r"[T ](?P<hour>\d{1,2}):(?P<minute>\d{1,2})"
    r"(?::(?P<second>\d{1,2})(?:\.(?P<microsecond>\d{1,6})\d{0,6})?)?"
    r"(?P<tzinfo>Z|[+-]\d{2}(?::?\d{2})?)?$"
)

_iso8601_date_re = re.compile(r"(?P<year>\d{4})-(?P<month>\d{1,2})-(?P<day>\d{1,2})$")

_iso8601_time_re = re.compile(
    r"(?P<hour>\d{1,2}):(?P<minute>\d{1,2})"
    r"(?::(?P<second>\d{1,2})(?:\.(?P<microsecond>\d{1,6})\d{0,6})?)?"
)


def get_fixed_timezone(offset: int | float | dt.timedelta) -> dt.timezone:
    """Return a tzinfo instance with a fixed offset from UTC."""
    if isinstance(offset, dt.timedelta):
        offset = offset.total_seconds() // 60
    sign = "-" if offset < 0 else "+"
    hhmm = "%02d%02d" % divmod(abs(offset), 60)
    name = sign + hhmm
    return dt.timezone(dt.timedelta(minutes=offset), name)


def from_iso_datetime(value):
    """Parse a string and return a datetime.datetime.

    This function supports time zone offsets. When the input contains one,
    the output uses a timezone with a fixed offset from UTC.
    """
    match = _iso8601_datetime_re.match(value)
    if not match:
        raise ValueError("Not a valid ISO8601-formatted datetime string")
    kw = match.groupdict()
    kw["microsecond"] = kw["microsecond"] and kw["microsecond"].ljust(6, "0")
    tzinfo = kw.pop("tzinfo")
    if tzinfo == "Z":
        tzinfo = dt.timezone.utc
    elif tzinfo is not None:
        offset_mins = int(tzinfo[-2:]) if len(tzinfo) > 3 else 0
        offset = 60 * int(tzinfo[1:3]) + offset_mins
        if tzinfo[0] == "-":
            offset = -offset
        tzinfo = get_fixed_timezone(offset)
    kw = {k: int(v) for k, v in kw.items() if v is not None}
    kw["tzinfo"] = tzinfo
    return dt.datetime(**kw)


def from_iso_time(value):
    """Parse a string and return a datetime.time.

    This function doesn't support time zone offsets.
    """
    match = _iso8601_time_re.match(value)
    if not match:
        raise ValueError("Not a valid ISO8601-formatted time string")
    kw = match.groupdict()
    kw["microsecond"] = kw["microsecond"] and kw["microsecond"].ljust(6, "0")
    kw = {k: int(v) for k, v in kw.items() if v is not None}
    return dt.time(**kw)


def from_iso_date(value):
    """Parse a string and return a datetime.date."""
    match = _iso8601_date_re.match(value)
    if not match:
        raise ValueError("Not a valid ISO8601-formatted date string")
    kw = {k: int(v) for k, v in match.groupdict().items()}
    return dt.date(**kw)


def from_timestamp(value: typing.Any) -> dt.datetime:
    if value is True or value is False:
        raise ValueError("Not a valid POSIX timestamp")
    value = float(value)
    if value < 0:
        raise ValueError("Not a valid POSIX timestamp")

    # Load a timestamp with utc as timezone to prevent using system timezone.
    # Then set timezone to None, to let the Field handle adding timezone info.
    try:
        return dt.datetime.fromtimestamp(value, tz=dt.timezone.utc).replace(tzinfo=None)
    except OverflowError as exc:
        raise ValueError("Timestamp is too large") from exc
    except OSError as exc:
        raise ValueError("Error converting value to datetime") from exc


def from_timestamp_ms(value: typing.Any) -> dt.datetime:
    value = float(value)
    return from_timestamp(value / 1000)


def timestamp(
    value: dt.datetime,
) -> float:
    if not is_aware(value):
        # When a date is naive, use UTC as zone info to prevent using system timezone.
        value = value.replace(tzinfo=dt.timezone.utc)
    return value.timestamp()


def timestamp_ms(value: dt.datetime) -> float:
    return timestamp(value) * 1000


def isoformat(datetime: dt.datetime) -> str:
    """Return the ISO8601-formatted representation of a datetime object.

    :param datetime datetime: The datetime.
    """
    return datetime.isoformat()


def to_iso_time(time: dt.time) -> str:
    return dt.time.isoformat(time)


def to_iso_date(date: dt.date) -> str:
    return dt.date.isoformat(date)


def ensure_text_type(val: str | bytes) -> str:
    if isinstance(val, bytes):
        val = val.decode("utf-8")
    return str(val)


def pluck(dictlist: list[dict[str, typing.Any]], key: str):
    """Extracts a list of dictionary values from a list of dictionaries.
    ::

        >>> dlist = [{'id': 1, 'name': 'foo'}, {'id': 2, 'name': 'bar'}]
        >>> pluck(dlist, 'id')
        [1, 2]
    """
    return [d[key] for d in dictlist]


# Various utilities for pulling keyed values from objects


def get_value(obj, key: int | str, default=missing):
    """Helper for pulling a keyed value off various types of objects. Fields use
    this method by default to access attributes of the source object. For object `x`
    and attribute `i`, this method first tries to access `x[i]`, and then falls back to
    `x.i` if an exception is raised.

    .. warning::
        If an object `x` does not raise an exception when `x[i]` does not exist,
        `get_value` will never check the value `x.i`. Consider overriding
        `marshmallow.fields.Field.get_value` in this case.
    """
    if not isinstance(key, int) and "." in key:
        return _get_value_for_keys(obj, key.split("."), default)
    else:
        return _get_value_for_key(obj, key, default)


def _get_value_for_keys(obj, keys, default):
    if len(keys) == 1:
        return _get_value_for_key(obj, keys[0], default)
    else:
        return _get_value_for_keys(
            _get_value_for_key(obj, keys[0], default), keys[1:], default
        )


def _get_value_for_key(obj, key, default):
    if not hasattr(obj, "__getitem__"):
        return getattr(obj, key, default)

    try:
        return obj[key]
    except (KeyError, IndexError, TypeError, AttributeError):
        return getattr(obj, key, default)


def set_value(dct: dict[str, typing.Any], key: str, value: typing.Any):
    """Set a value in a dict. If `key` contains a '.', it is assumed
    be a path (i.e. dot-delimited string) to the value's location.

    ::

        >>> d = {}
        >>> set_value(d, 'foo.bar', 42)
        >>> d
        {'foo': {'bar': 42}}
    """
    if "." in key:
        head, rest = key.split(".", 1)
        target = dct.setdefault(head, {})
        if not isinstance(target, dict):
            raise ValueError(
                f"Cannot set {key} in {head} " f"due to existing value: {target}"
            )
        set_value(target, rest, value)
    else:
        dct[key] = value


def callable_or_raise(obj):
    """Check that an object is callable, else raise a :exc:`TypeError`."""
    if not callable(obj):
        raise TypeError(f"Object {obj!r} is not callable.")
    return obj


def _signature(func: typing.Callable) -> list[str]:
    return list(inspect.signature(func).parameters.keys())


def get_func_args(func: typing.Callable) -> list[str]:
    """Given a callable, return a list of argument names. Handles
    `functools.partial` objects and class-based callables.

    .. versionchanged:: 3.0.0a1
        Do not return bound arguments, eg. ``self``.
    """
    if inspect.isfunction(func) or inspect.ismethod(func):
        return _signature(func)
    if isinstance(func, functools.partial):
        return _signature(func.func)
    # Callable class
    return _signature(func)


def resolve_field_instance(cls_or_instance):
    """Return a Schema instance from a Schema class or instance.

    :param type|Schema cls_or_instance: Marshmallow Schema class or instance.
    """
    if isinstance(cls_or_instance, type):
        if not issubclass(cls_or_instance, FieldABC):
            raise FieldInstanceResolutionError
        return cls_or_instance()
    else:
        if not isinstance(cls_or_instance, FieldABC):
            raise FieldInstanceResolutionError
        return cls_or_instance


def timedelta_to_microseconds(value: dt.timedelta) -> int:
    """Compute the total microseconds of a timedelta

    https://github.com/python/cpython/blob/bb3e0c240bc60fe08d332ff5955d54197f79751c/Lib/datetime.py#L665-L667  # noqa: B950
    """
    return (value.days * (24 * 3600) + value.seconds) * 1000000 + value.microseconds


def validate_unknown_parameter_value(obj: typing.Any) -> str:
    if obj not in _UNKNOWN_VALUES:
        raise ValueError(
            f"Object {obj!r} is not a valid value for the 'unknown' parameter"
        )
    return obj
