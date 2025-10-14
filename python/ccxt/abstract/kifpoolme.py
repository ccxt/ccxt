from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_spot_price = publicGetApiSpotPrice = Entry('api/spot/price', 'public', 'GET', {'cost': 1})
    public_get_api_spot_tickers_1m = publicGetApiSpotTickers1m = Entry('api/spot/tickers/1m', 'public', 'GET', {'cost': 1})
