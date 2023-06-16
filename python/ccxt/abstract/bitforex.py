from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_api_v1_ping = publicGetApiV1Ping = Entry('/api/v1/ping', 'public', 'GET', {'cost': 0.2})
    public_get_api_v1_time = publicGetApiV1Time = Entry('/api/v1/time', 'public', 'GET', {'cost': 0.2})
    public_get_api_v1_market_symbols = publicGetApiV1MarketSymbols = Entry('api/v1/market/symbols', 'public', 'GET', {'cost': 20})
    public_get_api_v1_market_ticker = publicGetApiV1MarketTicker = Entry('api/v1/market/ticker', 'public', 'GET', {'cost': 4})
    public_get_api_v1_market_ticker_all = publicGetApiV1MarketTickerAll = Entry('api/v1/market/ticker-all', 'public', 'GET', {'cost': 4})
    public_get_api_v1_market_depth = publicGetApiV1MarketDepth = Entry('api/v1/market/depth', 'public', 'GET', {'cost': 4})
    public_get_api_v1_market_depth_all = publicGetApiV1MarketDepthAll = Entry('api/v1/market/depth-all', 'public', 'GET', {'cost': 4})
    public_get_api_v1_market_trades = publicGetApiV1MarketTrades = Entry('api/v1/market/trades', 'public', 'GET', {'cost': 20})
    public_get_api_v1_market_kline = publicGetApiV1MarketKline = Entry('api/v1/market/kline', 'public', 'GET', {'cost': 20})
    private_post_api_v1_fund_mainaccount = privatePostApiV1FundMainAccount = Entry('api/v1/fund/mainAccount', 'private', 'POST', {'cost': 1})
    private_post_api_v1_fund_allaccount = privatePostApiV1FundAllAccount = Entry('api/v1/fund/allAccount', 'private', 'POST', {'cost': 30})
    private_post_api_v1_trade_placeorder = privatePostApiV1TradePlaceOrder = Entry('api/v1/trade/placeOrder', 'private', 'POST', {'cost': 1})
    private_post_api_v1_trade_placemultiorder = privatePostApiV1TradePlaceMultiOrder = Entry('api/v1/trade/placeMultiOrder', 'private', 'POST', {'cost': 10})
    private_post_api_v1_trade_cancelorder = privatePostApiV1TradeCancelOrder = Entry('api/v1/trade/cancelOrder', 'private', 'POST', {'cost': 1})
    private_post_api_v1_trade_cancelmultiorder = privatePostApiV1TradeCancelMultiOrder = Entry('api/v1/trade/cancelMultiOrder', 'private', 'POST', {'cost': 6.67})
    private_post_api_v1_trade_cancelallorder = privatePostApiV1TradeCancelAllOrder = Entry('api/v1/trade/cancelAllOrder', 'private', 'POST', {'cost': 20})
    private_post_api_v1_trade_orderinfo = privatePostApiV1TradeOrderInfo = Entry('api/v1/trade/orderInfo', 'private', 'POST', {'cost': 1})
    private_post_api_v1_trade_multiorderinfo = privatePostApiV1TradeMultiOrderInfo = Entry('api/v1/trade/multiOrderInfo', 'private', 'POST', {'cost': 10})
    private_post_api_v1_trade_orderinfos = privatePostApiV1TradeOrderInfos = Entry('api/v1/trade/orderInfos', 'private', 'POST', {'cost': 20})
    private_post_api_v1_trade_mytrades = privatePostApiV1TradeMyTrades = Entry('api/v1/trade/myTrades', 'private', 'POST', {'cost': 2})
