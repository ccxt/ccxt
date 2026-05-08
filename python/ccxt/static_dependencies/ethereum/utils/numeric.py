from abc import (
    ABC,
    abstractmethod,
)
import decimal
import numbers
from typing import (
    Any,
    TypeVar,
    Union,
)


class Comparable(ABC):
    @abstractmethod
    def __lt__(self, other: Any) -> bool:
        ...

    @abstractmethod
    def __gt__(self, other: Any) -> bool:
        ...


TComparable = Union[Comparable, numbers.Real, int, float, decimal.Decimal]


TValue = TypeVar("TValue", bound=TComparable)


def clamp(lower_bound: TValue, upper_bound: TValue, value: TValue) -> TValue:
    # The `mypy` ignore statements here are due to doing a comparison of
    # `Union` types which isn't allowed. (per cburgdorf). This approach was
    # chosen over using `typing.overload` to define multiple signatures for
    # each comparison type here since the added value of "proper" typing
    # doesn't seem to justify the complexity of having a bunch of different
    # signatures defined. The external library perspective on this function
    # should still be adequate under this approach
    if value < lower_bound:  # type: ignore
        return lower_bound
    elif value > upper_bound:  # type: ignore
        return upper_bound
    else:
        return value
