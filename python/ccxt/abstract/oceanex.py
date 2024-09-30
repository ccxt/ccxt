from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_markets = publicGetMarkets = Entry('markets', 'public', 'GET', {})
    public_get_tickers_pair = publicGetTickersPair = Entry('tickers/{pair}', 'public', 'GET', {})
    public_get_tickers_multi = publicGetTickersMulti = Entry('tickers_multi', 'public', 'GET', {})
    public_get_order_book = publicGetOrderBook = Entry('order_book', 'public', 'GET', {})
    public_get_order_book_multi = publicGetOrderBookMulti = Entry('order_book/multi', 'public', 'GET', {})
    public_get_fees_trading = publicGetFeesTrading = Entry('fees/trading', 'public', 'GET', {})
    public_get_trades = publicGetTrades = Entry('trades', 'public', 'GET', {})
    public_get_timestamp = publicGetTimestamp = Entry('timestamp', 'public', 'GET', {})
    public_post_k = publicPostK = Entry('k', 'public', 'POST', {})
    private_get_key = privateGetKey = Entry('key', 'private', 'GET', {})
    private_get_members_me = privateGetMembersMe = Entry('members/me', 'private', 'GET', {})
    private_get_orders = privateGetOrders = Entry('orders', 'private', 'GET', {})
    private_get_orders_filter = privateGetOrdersFilter = Entry('orders/filter', 'private', 'GET', {})
    private_post_orders = privatePostOrders = Entry('orders', 'private', 'POST', {})
    private_post_orders_multi = privatePostOrdersMulti = Entry('orders/multi', 'private', 'POST', {})
    private_post_order_delete = privatePostOrderDelete = Entry('order/delete', 'private', 'POST', {})
    private_post_order_delete_multi = privatePostOrderDeleteMulti = Entry('order/delete/multi', 'private', 'POST', {})
    private_post_orders_clear = privatePostOrdersClear = Entry('orders/clear', 'private', 'POST', {})
