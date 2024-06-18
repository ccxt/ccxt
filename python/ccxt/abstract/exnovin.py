from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_v2_pairs = publicGetV2Pairs = Entry('v2/pairs', 'public', 'GET', {'cost': 1})
    public_get_v1_orderbook = publicGetV1Orderbook = Entry('v1/orderbook', 'public', 'GET', {'cost': 1})
