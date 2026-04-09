from ccxt.base.types import Entry


class ImplicitAPI:
    public_post_info = publicPostInfo = Entry('info', 'public', 'POST', {'cost': 20, 'byType': {'l2Book': 2, 'allMids': 2, 'clearinghouseState': 2, 'orderStatus': 2, 'spotClearinghouseState': 2, 'exchangeStatus': 2, 'candleSnapshot': 4}})
    private_post_exchange = privatePostExchange = Entry('exchange', 'private', 'POST', {'cost': 1})
