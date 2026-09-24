from ccxt.base.types import Entry
_Dict = dict[str, object]
_List = list[object]


class ImplicitAPI:
    public_post_info = publicPostInfo = Entry[_Dict | _List | str]('info', 'public', 'POST', {'cost': 20, 'byType': {'l2Book': 2, 'allMids': 2, 'spotClearinghouseState': 2, 'candleSnapshot': 4, 'orderStatus': 2}})
    private_post_exchange = privatePostExchange = Entry[_Dict]('exchange', 'private', 'POST', {'cost': 1})
