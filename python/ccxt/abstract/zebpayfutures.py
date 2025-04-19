from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_system_time = publicGetSystemTime = Entry('system/time', 'public', 'GET', {'cost': 10})
    public_get_system_status = publicGetSystemStatus = Entry('system/status', 'public', 'GET', {'cost': 10})
    public_get_exchange_tradefee = publicGetExchangeTradefee = Entry('exchange/tradefee', 'public', 'GET', {'cost': 10})
    public_get_exchange_tradefees = publicGetExchangeTradefees = Entry('exchange/tradefees', 'public', 'GET', {'cost': 10})
    public_get_market_orderbook = publicGetMarketOrderBook = Entry('market/orderBook', 'public', 'GET', {'cost': 10})
    public_get_market_ticker24hr = publicGetMarketTicker24Hr = Entry('market/ticker24Hr', 'public', 'GET', {'cost': 10})
    public_get_market_markets = publicGetMarketMarkets = Entry('market/markets', 'public', 'GET', {'cost': 10})
    private_get_wallet_balance = privateGetWalletBalance = Entry('wallet/balance', 'private', 'GET', {'cost': 10})
    private_get_trade_order = privateGetTradeOrder = Entry('trade/order', 'private', 'GET', {'cost': 10})
    private_get_trade_order_open_orders = privateGetTradeOrderOpenOrders = Entry('trade/order/open-orders', 'private', 'GET', {'cost': 10})
    private_get_trade_userleverages = privateGetTradeUserLeverages = Entry('trade/userLeverages', 'private', 'GET', {'cost': 10})
    private_get_trade_userleverage = privateGetTradeUserLeverage = Entry('trade/userLeverage', 'private', 'GET', {'cost': 10})
    private_get_trade_positions = privateGetTradePositions = Entry('trade/positions', 'private', 'GET', {'cost': 10})
    private_post_trade_order = privatePostTradeOrder = Entry('trade/order', 'private', 'POST', {'cost': 10})
    private_post_trade_order_addtpsl = privatePostTradeOrderAddTPSL = Entry('trade/order/addTPSL', 'private', 'POST', {'cost': 10})
    private_post_trade_addmargin = privatePostTradeAddMargin = Entry('trade/addMargin', 'private', 'POST', {'cost': 10})
    private_post_trade_reducemargin = privatePostTradeReduceMargin = Entry('trade/reduceMargin', 'private', 'POST', {'cost': 10})
    private_post_trade_position_close = privatePostTradePositionClose = Entry('trade/position/close', 'private', 'POST', {'cost': 10})
    private_post_trade_update_userleverage = privatePostTradeUpdateUserLeverage = Entry('trade/update/userLeverage', 'private', 'POST', {'cost': 10})
    private_delete_trade_order = privateDeleteTradeOrder = Entry('trade/order', 'private', 'DELETE', {'cost': 10})
