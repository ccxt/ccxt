import sys
import types
from typing import Union

if sys.version_info.minor > 7:
    from typing import TypedDict, Literal
else:
    TypedDict = dict
    from typing_extensions import Literal


OrderSide = Literal['buy', 'sell']
OrderType = Literal['limit', 'market']


class Entry:
    def __init__(self, path, api, method, config):
        self.name = None
        self.path = path
        self.api = api
        self.method = method
        self.config = config

        def unbound_method(_self, params={}):
            return _self.request(self.path, self.api, self.method, params, config=self.config)

        self.unbound_method = unbound_method

    def __get__(self, instance, owner):
        if instance is None:
            return self.unbound_method
        else:
            return types.MethodType(self.unbound_method, instance)

    def __set_name__(self, owner, name):
        self.name = name


class Balance(TypedDict):
    free: Union[None, str, float]
    used: Union[None, str, float]
    total: Union[None, str, float]


IndexType = Union[str, int]


class Trade(TypedDict):
    amount: Union[None, str, float]
    datetime: str
    id: str
    info: None
    order: str
    price: Union[None, str, float]
    timestamp: int
    type: str
    side: str
    symbol: str
    takerOrMaker: str
    cost: Union[None, str, float]
    fee: TypedDict
