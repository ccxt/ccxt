from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_v2_tickers = publicGetV2Tickers = Entry('v2/tickers', 'public', 'GET', {'cost': 1})
    public_get_v2_ticker = publicGetV2Ticker = Entry('v2/ticker', 'public', 'GET', {'cost': 1})
    public_get_v2_chart = publicGetV2Chart = Entry('v2/chart', 'public', 'GET', {'cost': 1})
    public_get_v2_orderbook = publicGetV2Orderbook = Entry('v2/orderbook', 'public', 'GET', {'cost': 1})
