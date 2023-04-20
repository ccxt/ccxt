import sys
from typing import Union

if sys.version_info.minor > 7:
    from typing import TypedDict, Literal
else:
    TypedDict = dict
    from typing_extensions import Literal


OrderSide = Literal['buy', 'sell']
OrderType = Literal['limit', 'market']


class Balance(TypedDict):
    free: Union[None, str, float]
    used: Union[None, str, float]
    total: Union[None, str, float]


IndexType = Union[str, int]
