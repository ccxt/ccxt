from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_market_stats = publicGetApiMarketStats = Entry('api/market/stats', 'public', 'GET', {'cost': 1})
    public_get_api_orderbook_depth = publicGetApiOrderbookDepth = Entry('api/orderbook/depth', 'public', 'GET', {'cost': 1})
    public_get_api_kline_history = publicGetApiKlineHistory = Entry('api/kline/history', 'public', 'GET', {'cost': 1})
