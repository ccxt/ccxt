from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_market_stats = publicGetMarketStats = Entry('market/stats', 'public', 'GET', {'cost': 1})
    public_get_market_udf_history = publicGetMarketUdfHistory = Entry('market/udf/history', 'public', 'GET', {'cost': 1})
    public_get_v2_orderbook = publicGetV2Orderbook = Entry('v2/orderbook', 'public', 'GET', {'cost': 1})
