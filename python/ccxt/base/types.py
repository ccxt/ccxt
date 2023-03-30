import sys
import enum
from typing import Union

if sys.version_info.minor > 7:
    from typing import TypedDict
else:
    TypedDict = dict

if sys.version_info.minor >= 11:
    StrEnum = enum.StrEnum
else:
    class StrEnum(str, enum.Enum):
        """
        StrEnum is a Python ``enum.Enum`` that inherits from ``str``. The default
        ``auto()`` behavior uses the member name as its value.
        """

        def __new__(cls, value, *args, **kwargs):
            if not isinstance(value, (str, enum.auto)):
                raise TypeError(
                    f"Values of StrEnums must be strings: {value!r} is a {type(value)}"
                )
            return super().__new__(cls, value, *args, **kwargs)

        def __str__(self):
            return str(self.value)

        def _generate_next_value_(name, *_):
            return name.lower()


class OrderSide(StrEnum):
    Buy = 'buy'
    Sell = 'sell'


class OrderType(StrEnum):
    Limit = 'limit'
    Market = 'market'


class Balance(TypedDict):
    free: Union[None, str, float]
    used: Union[None, str, float]
    total: Union[None, str, float]


IndexType = Union[str, int]
