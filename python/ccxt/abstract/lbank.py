from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_currencypairs = publicGetCurrencyPairs = Entry('currencyPairs', 'public', 'GET', {})
    public_get_ticker = publicGetTicker = Entry('ticker', 'public', 'GET', {})
    public_get_depth = publicGetDepth = Entry('depth', 'public', 'GET', {})
    public_get_trades = publicGetTrades = Entry('trades', 'public', 'GET', {})
    public_get_kline = publicGetKline = Entry('kline', 'public', 'GET', {})
    public_get_accuracy = publicGetAccuracy = Entry('accuracy', 'public', 'GET', {})
    private_post_user_info = privatePostUserInfo = Entry('user_info', 'private', 'POST', {})
    private_post_create_order = privatePostCreateOrder = Entry('create_order', 'private', 'POST', {})
    private_post_cancel_order = privatePostCancelOrder = Entry('cancel_order', 'private', 'POST', {})
    private_post_orders_info = privatePostOrdersInfo = Entry('orders_info', 'private', 'POST', {})
    private_post_orders_info_history = privatePostOrdersInfoHistory = Entry('orders_info_history', 'private', 'POST', {})
    private_post_withdraw = privatePostWithdraw = Entry('withdraw', 'private', 'POST', {})
    private_post_withdrawcancel = privatePostWithdrawCancel = Entry('withdrawCancel', 'private', 'POST', {})
    private_post_withdraws = privatePostWithdraws = Entry('withdraws', 'private', 'POST', {})
    private_post_withdrawconfigs = privatePostWithdrawConfigs = Entry('withdrawConfigs', 'private', 'POST', {})
