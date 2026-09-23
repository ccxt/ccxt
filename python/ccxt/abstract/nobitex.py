from ccxt.base.types import Entry
_Dict = dict[str, object]


class ImplicitAPI:
    public_get_v2_options = publicGetV2Options = Entry[_Dict]('v2/options', 'public', 'GET', {'cost': 1})
    public_get_market_stats = publicGetMarketStats = Entry[_Dict]('market/stats', 'public', 'GET', {'cost': 1})
    public_get_v3_orderbook_symbol = publicGetV3OrderbookSymbol = Entry[_Dict]('v3/orderbook/{symbol}', 'public', 'GET', {'cost': 1})
    public_get_v2_trades_symbol = publicGetV2TradesSymbol = Entry[_Dict]('v2/trades/{symbol}', 'public', 'GET', {'cost': 1})
    public_get_market_udf_history = publicGetMarketUdfHistory = Entry[_Dict]('market/udf/history', 'public', 'GET', {'cost': 1})
    private_get_market_trades_list = privateGetMarketTradesList = Entry[_Dict]('market/trades/list', 'private', 'GET', {'cost': 1})
    private_post_users_profile = privatePostUsersProfile = Entry[_Dict]('users/profile', 'private', 'POST', {'cost': 1})
    private_post_users_wallets_list = privatePostUsersWalletsList = Entry[_Dict]('users/wallets/list', 'private', 'POST', {'cost': 1})
    private_post_users_wallets_balance = privatePostUsersWalletsBalance = Entry[_Dict]('users/wallets/balance', 'private', 'POST', {'cost': 1})
    private_post_market_orders_add = privatePostMarketOrdersAdd = Entry[_Dict]('market/orders/add', 'private', 'POST', {'cost': 1})
    private_post_market_orders_status = privatePostMarketOrdersStatus = Entry[_Dict]('market/orders/status', 'private', 'POST', {'cost': 1})
    private_post_market_orders_list = privatePostMarketOrdersList = Entry[_Dict]('market/orders/list', 'private', 'POST', {'cost': 1})
    private_post_market_orders_update_status = privatePostMarketOrdersUpdateStatus = Entry[_Dict]('market/orders/update-status', 'private', 'POST', {'cost': 1})
    private_post_market_orders_cancel_old = privatePostMarketOrdersCancelOld = Entry[_Dict]('market/orders/cancel-old', 'private', 'POST', {'cost': 1})
