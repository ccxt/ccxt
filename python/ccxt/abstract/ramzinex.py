from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_exchange_api_v1_0_exchange_pairs = publicGetExchangeApiV10ExchangePairs = Entry('exchange/api/v1.0/exchange/pairs', 'public', 'GET', {'cost': 1})
    public_get_exchange_api_v1_0_exchange_chart_tv_history = publicGetExchangeApiV10ExchangeChartTvHistory = Entry('exchange/api/v1.0/exchange/chart/tv/history', 'public', 'GET', {'cost': 1})
    public_get_exchange_api_v1_0_exchange_orderbooks = publicGetExchangeApiV10ExchangeOrderbooks = Entry('exchange/api/v1.0/exchange/orderbooks', 'public', 'GET', {'cost': 1})
