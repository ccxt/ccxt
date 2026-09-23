from ccxt.base.types import Entry
_Dict = dict[str, object]


class ImplicitAPI:
    public_get_v1_markets = publicGetV1Markets = Entry[_Dict]('v1/markets', 'public', 'GET', {'cost': 1})
    public_get_v1_currencies_stats = publicGetV1CurrenciesStats = Entry[_Dict]('v1/currencies/stats', 'public', 'GET', {'cost': 1})
    public_get_v1_depth = publicGetV1Depth = Entry[_Dict]('v1/depth', 'public', 'GET', {'cost': 1})
    public_get_v1_trades = publicGetV1Trades = Entry[_Dict]('v1/trades', 'public', 'GET', {'cost': 1})
    public_get_v1_udf_history = publicGetV1UdfHistory = Entry[_Dict]('v1/udf/history', 'public', 'GET', {'cost': 1})
    private_get_v1_account_profile = privateGetV1AccountProfile = Entry[_Dict]('v1/account/profile', 'private', 'GET', {'cost': 1})
    private_get_v1_account_balances = privateGetV1AccountBalances = Entry[_Dict]('v1/account/balances', 'private', 'GET', {'cost': 1})
    private_get_v1_account_openorders = privateGetV1AccountOpenOrders = Entry[_Dict]('v1/account/openOrders', 'private', 'GET', {'cost': 1})
    private_get_v1_account_trades = privateGetV1AccountTrades = Entry[_Dict]('v1/account/trades', 'private', 'GET', {'cost': 1})
    private_get_v1_account_orders_clientorderid = privateGetV1AccountOrdersClientOrderId = Entry[_Dict]('v1/account/orders/{clientOrderId}', 'private', 'GET', {'cost': 1})
    private_post_v1_account_orders = privatePostV1AccountOrders = Entry[_Dict]('v1/account/orders', 'private', 'POST', {'cost': 1})
    private_delete_v1_account_orders = privateDeleteV1AccountOrders = Entry[_Dict]('v1/account/orders', 'private', 'DELETE', {'cost': 1})
