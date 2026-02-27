from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_currencies = publicGetCurrencies = Entry('currencies/', 'public', 'GET', {'cost': 1})
    public_get_pairs = publicGetPairs = Entry('pairs/', 'public', 'GET', {'cost': 1})
    public_get_orderbook_pair_name = publicGetOrderbookPairName = Entry('orderbook/{pair_name}', 'public', 'GET', {'cost': 1})
    public_get_exchanges = publicGetExchanges = Entry('exchanges/', 'public', 'GET', {'cost': 1})
    public_get_charts_pair_type_chart = publicGetChartsPairTypeChart = Entry('charts/{pair}/{type}/chart/', 'public', 'GET', {'cost': 1})
    public_get_ticker = publicGetTicker = Entry('ticker/', 'public', 'GET', {'cost': 1})
    private_get_wallets = privateGetWallets = Entry('wallets/', 'private', 'GET', {'cost': 50})
    private_get_orders_own = privateGetOrdersOwn = Entry('orders/own/', 'private', 'GET', {'cost': 50})
    private_get_order_id = privateGetOrderId = Entry('order/{id}/', 'private', 'GET', {'cost': 50})
    private_get_exchanges_own = privateGetExchangesOwn = Entry('exchanges/own/', 'private', 'GET', {'cost': 50})
    private_get_deposits = privateGetDeposits = Entry('deposits/', 'private', 'GET', {'cost': 50})
    private_get_withdraws = privateGetWithdraws = Entry('withdraws/', 'private', 'GET', {'cost': 50})
    private_post_order = privatePostOrder = Entry('order/', 'private', 'POST', {'cost': 50})
    private_post_order_cancel = privatePostOrderCancel = Entry('order-cancel/', 'private', 'POST', {'cost': 50})
