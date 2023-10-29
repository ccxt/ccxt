from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_orderbook = publicGetOrderbook = Entry('orderbook', 'public', 'GET', {'cost': 1})
    public_get_ticker = publicGetTicker = Entry('ticker', 'public', 'GET', {'cost': 0.1})
    public_get_trades = publicGetTrades = Entry('trades', 'public', 'GET', {'cost': 1})
    public_get_server_exchangeinfo = publicGetServerExchangeinfo = Entry('server/exchangeinfo', 'public', 'GET', {'cost': 1})
    private_get_users_balances = privateGetUsersBalances = Entry('users/balances', 'private', 'GET', {'cost': 1})
    private_get_openorders = privateGetOpenOrders = Entry('openOrders', 'private', 'GET', {'cost': 1})
    private_get_allorders = privateGetAllOrders = Entry('allOrders', 'private', 'GET', {'cost': 1})
    private_get_users_transactions_trade = privateGetUsersTransactionsTrade = Entry('users/transactions/trade', 'private', 'GET', {'cost': 1})
    private_post_order = privatePostOrder = Entry('order', 'private', 'POST', {'cost': 1})
    private_post_cancelorder = privatePostCancelOrder = Entry('cancelOrder', 'private', 'POST', {'cost': 1})
    private_delete_order = privateDeleteOrder = Entry('order', 'private', 'DELETE', {'cost': 1})
    graph_get_ohlcs = graphGetOhlcs = Entry('ohlcs', 'graph', 'GET', {'cost': 1})
    graph_get_klines_history = graphGetKlinesHistory = Entry('klines/history', 'graph', 'GET', {'cost': 1})
