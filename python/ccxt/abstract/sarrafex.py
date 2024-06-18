from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_gateway_exchanger_query_market = publicGetApiGatewayExchangerQueryMarket = Entry('api/gateway/exchanger/query/market', 'public', 'GET', {'cost': 1})
    public_get_exchanger_tradingview_history = publicGetExchangerTradingviewHistory = Entry('exchanger/tradingview/history', 'public', 'GET', {'cost': 1})
    public_get_api_gateway_exchanger_orderbook = publicGetApiGatewayExchangerOrderbook = Entry('api/gateway/exchanger/orderbook', 'public', 'GET', {'cost': 1})
