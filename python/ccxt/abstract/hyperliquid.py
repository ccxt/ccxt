from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List, Union

_Dict = Dict[str, PythonAny]
_List = List[PythonAny]

class ImplicitAPI:
    public_post_info = publicPostInfo = Entry[Union[_Dict, _List, str]]('info', 'public', 'POST', {'cost': 20, 'byType': {'l2Book': 2, 'allMids': 2, 'clearinghouseState': 2, 'orderStatus': 2, 'spotClearinghouseState': 2, 'exchangeStatus': 2, 'candleSnapshot': 4}})
    private_post_exchange = privatePostExchange = Entry[_Dict]('exchange', 'private', 'POST', {'cost': 1})
