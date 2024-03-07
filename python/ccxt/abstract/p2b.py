from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_markets = publicGetMarkets = Entry('markets', 'public', 'GET', {'cost': 1})
    public_get_market = publicGetMarket = Entry('market', 'public', 'GET', {'cost': 1})
    public_get_tickers = publicGetTickers = Entry('tickers', 'public', 'GET', {'cost': 1})
    public_get_ticker = publicGetTicker = Entry('ticker', 'public', 'GET', {'cost': 1})
    public_get_book = publicGetBook = Entry('book', 'public', 'GET', {'cost': 1})
    public_get_history = publicGetHistory = Entry('history', 'public', 'GET', {'cost': 1})
    public_get_depth_result = publicGetDepthResult = Entry('depth/result', 'public', 'GET', {'cost': 1})
    public_get_market_kline = publicGetMarketKline = Entry('market/kline', 'public', 'GET', {'cost': 1})
    private_post_account_balances = privatePostAccountBalances = Entry('account/balances', 'private', 'POST', {'cost': 1})
    private_post_account_balance = privatePostAccountBalance = Entry('account/balance', 'private', 'POST', {'cost': 1})
    private_post_order_new = privatePostOrderNew = Entry('order/new', 'private', 'POST', {'cost': 1})
    private_post_order_cancel = privatePostOrderCancel = Entry('order/cancel', 'private', 'POST', {'cost': 1})
    private_post_orders = privatePostOrders = Entry('orders', 'private', 'POST', {'cost': 1})
    private_post_account_market_order_history = privatePostAccountMarketOrderHistory = Entry('account/market_order_history', 'private', 'POST', {'cost': 1})
    private_post_account_market_deal_history = privatePostAccountMarketDealHistory = Entry('account/market_deal_history', 'private', 'POST', {'cost': 1})
    private_post_account_order = privatePostAccountOrder = Entry('account/order', 'private', 'POST', {'cost': 1})
    private_post_account_order_history = privatePostAccountOrderHistory = Entry('account/order_history', 'private', 'POST', {'cost': 1})
    private_post_account_executed_history = privatePostAccountExecutedHistory = Entry('account/executed_history', 'private', 'POST', {'cost': 1})
