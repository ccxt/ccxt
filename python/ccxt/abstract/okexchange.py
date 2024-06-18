from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_oapi_v1_market_tickers = publicGetOapiV1MarketTickers = Entry('oapi/v1/market/tickers', 'public', 'GET', {'cost': 1})
    public_get_oapi_v1_otc_tickers = publicGetOapiV1OtcTickers = Entry('oapi/v1/otc/tickers', 'public', 'GET', {'cost': 1})
    public_get_sno_oapi_market_candle = publicGetSnoOapiMarketCandle = Entry('sno/oapi/market/candle', 'public', 'GET', {'cost': 1})
    public_get_oapi_v1_market_orderbook = publicGetOapiV1MarketOrderbook = Entry('oapi/v1/market/orderbook', 'public', 'GET', {'cost': 1})
