from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_1_markets = publicGetApi1Markets = Entry('api/1/markets', 'public', 'GET', {'cost': 1})
    public_get_api_1_ohlcvs_tradingview = publicGetApi1OhlcvsTradingView = Entry('api/1/ohlcvs/tradingView', 'public', 'GET', {'cost': 1})
    public_get_api_1_orders_orderbook_market = publicGetApi1OrdersOrderBookMarket = Entry('api/1/orders/orderBook/market', 'public', 'GET', {'cost': 1})
