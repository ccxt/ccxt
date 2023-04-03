import sys
from typing import Union, Literal

if sys.version_info.minor > 7:
    from typing import TypedDict
else:
    TypedDict = dict


OrderSide = Literal['buy', 'sell']
OrderType = Literal['limit', 'market']


class Balance(TypedDict):
    free: Union[None, str, float]
    used: Union[None, str, float]
    total: Union[None, str, float]


IndexType = Union[str, int]
