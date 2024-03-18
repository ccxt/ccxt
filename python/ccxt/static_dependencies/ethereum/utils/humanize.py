from typing import (
    Any,
    Iterable,
    Iterator,
    Tuple,
    Union,
)
from urllib import (
    parse,
)

from ..typing import (
    URI,
    Hash32,
)

from .currency import (
    denoms,
    from_wei,
)

from .toolz import (
    sliding_window,
    take,
)


def humanize_seconds(seconds: Union[float, int]) -> str:
    if int(seconds) == 0:
        return "0s"

    unit_values = _consume_leading_zero_units(_humanize_seconds(int(seconds)))

    return "".join((f"{amount}{unit}" for amount, unit in take(3, unit_values)))


SECOND = 1
MINUTE = 60
HOUR = 60 * 60
DAY = 24 * HOUR
YEAR = 365 * DAY
MONTH = YEAR // 12
WEEK = 7 * DAY


UNITS = (
    (YEAR, "y"),
    (MONTH, "m"),
    (WEEK, "w"),
    (DAY, "d"),
    (HOUR, "h"),
    (MINUTE, "m"),
    (SECOND, "s"),
)


def _consume_leading_zero_units(
    units_iter: Iterator[Tuple[int, str]]
) -> Iterator[Tuple[int, str]]:
    for amount, unit in units_iter:
        if amount == 0:
            continue
        else:
            yield (amount, unit)
            break

    yield from units_iter


def _humanize_seconds(seconds: int) -> Iterator[Tuple[int, str]]:
    remainder = seconds

    for duration, unit in UNITS:
        if not remainder:
            break

        num = remainder // duration
        yield num, unit

        remainder %= duration


DISPLAY_HASH_CHARS = 4


def humanize_bytes(value: bytes) -> str:
    if len(value) <= DISPLAY_HASH_CHARS + 1:
        return value.hex()
    value_as_hex = value.hex()
    head = value_as_hex[:DISPLAY_HASH_CHARS]
    tail = value_as_hex[-1 * DISPLAY_HASH_CHARS :]
    return f"{head}..{tail}"


def humanize_hash(value: Hash32) -> str:
    return humanize_bytes(value)


def humanize_ipfs_uri(uri: URI) -> str:
    if not is_ipfs_uri(uri):
        raise TypeError(
            f"{uri} does not look like a valid IPFS uri. Currently, "
            "only CIDv0 hash schemes are supported."
        )

    parsed = parse.urlparse(uri)
    ipfs_hash = parsed.netloc
    head = ipfs_hash[:DISPLAY_HASH_CHARS]
    tail = ipfs_hash[-1 * DISPLAY_HASH_CHARS :]
    return f"ipfs://{head}..{tail}"


def is_ipfs_uri(value: Any) -> bool:
    if not isinstance(value, str):
        return False

    parsed = parse.urlparse(value)
    if parsed.scheme != "ipfs" or not parsed.netloc:
        return False

    return _is_CIDv0_ipfs_hash(parsed.netloc)


def _is_CIDv0_ipfs_hash(ipfs_hash: str) -> bool:
    if ipfs_hash.startswith("Qm") and len(ipfs_hash) == 46:
        return True
    return False


def _find_breakpoints(*values: int) -> Iterator[int]:
    yield 0
    for index, (left, right) in enumerate(sliding_window(2, values), 1):
        if left + 1 == right:
            continue
        else:
            yield index
    yield len(values)


def _extract_integer_ranges(*values: int) -> Iterator[Tuple[int, int]]:
    """
    Return a tuple of consecutive ranges of integers.

    :param values: a sequence of ordered integers

    - fn(1, 2, 3) -> ((1, 3),)
    - fn(1, 2, 3, 7, 8, 9) -> ((1, 3), (7, 9))
    - fn(1, 7, 8, 9) -> ((1, 1), (7, 9))
    """
    for left, right in sliding_window(2, _find_breakpoints(*values)):
        chunk = values[left:right]
        yield chunk[0], chunk[-1]


def _humanize_range(bounds: Tuple[int, int]) -> str:
    left, right = bounds
    if left == right:
        return str(left)
    else:
        return f"{left}-{right}"


def humanize_integer_sequence(values_iter: Iterable[int]) -> str:
    """
    Return a concise, human-readable string representing a sequence of integers.

    - fn((1, 2, 3)) -> '1-3'
    - fn((1, 2, 3, 7, 8, 9)) -> '1-3|7-9'
    - fn((1, 2, 3, 5, 7, 8, 9)) -> '1-3|5|7-9'
    - fn((1, 7, 8, 9)) -> '1|7-9'
    """
    values = tuple(values_iter)
    if not values:
        return "(empty)"
    else:
        return "|".join(map(_humanize_range, _extract_integer_ranges(*values)))


def humanize_wei(number: int) -> str:
    if number >= denoms.finney:
        unit = "ether"
    elif number >= denoms.mwei:
        unit = "gwei"
    else:
        unit = "wei"
    amount = from_wei(number, unit)
    x = f"{str(amount)} {unit}"
    return x
