from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_hapi_exchange_v1_public_alltickers_24hr = publicGetHapiExchangeV1PublicAlltickers24hr = Entry('hapi/exchange/v1/public/alltickers/24hr', 'public', 'GET', {'cost': 1})
    public_get_hapi_exchange_v1_public_ticker_24hr = publicGetHapiExchangeV1PublicTicker24hr = Entry('hapi/exchange/v1/public/ticker/24hr', 'public', 'GET', {'cost': 1})
    public_get_hapi_exchange_v1_public_klines = publicGetHapiExchangeV1PublicKlines = Entry('hapi/exchange/v1/public/klines', 'public', 'GET', {'cost': 1})
    public_get_hapi_exchange_v1_public_depth = publicGetHapiExchangeV1PublicDepth = Entry('hapi/exchange/v1/public/depth', 'public', 'GET', {'cost': 1})
