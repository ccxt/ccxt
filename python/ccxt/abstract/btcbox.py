from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_depth = publicGetDepth = Entry('depth', 'public', 'GET', {})
    public_get_orders = publicGetOrders = Entry('orders', 'public', 'GET', {})
    public_get_ticker = publicGetTicker = Entry('ticker', 'public', 'GET', {})
    private_post_balance = privatePostBalance = Entry('balance', 'private', 'POST', {})
    private_post_trade_add = privatePostTradeAdd = Entry('trade_add', 'private', 'POST', {})
    private_post_trade_cancel = privatePostTradeCancel = Entry('trade_cancel', 'private', 'POST', {})
    private_post_trade_list = privatePostTradeList = Entry('trade_list', 'private', 'POST', {})
    private_post_trade_view = privatePostTradeView = Entry('trade_view', 'private', 'POST', {})
    private_post_wallet = privatePostWallet = Entry('wallet', 'private', 'POST', {})
