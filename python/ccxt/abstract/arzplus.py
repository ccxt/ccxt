from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_v1_market_symbols = publicGetApiV1MarketSymbols = Entry('api/v1/market/symbols', 'public', 'GET', {'cost': 1})
    public_get_api_v1_market_tradingview_ohlcv = publicGetApiV1MarketTradingviewOhlcv = Entry('api/v1/market/tradingview/ohlcv', 'public', 'GET', {'cost': 1})
    public_get_api_v1_market_depth = publicGetApiV1MarketDepth = Entry('api/v1/market/depth', 'public', 'GET', {'cost': 1})
    public_get_api_v1_market_irt_info = publicGetApiV1MarketIrtInfo = Entry('api/v1/market/irt/info', 'public', 'GET', {'cost': 1})
