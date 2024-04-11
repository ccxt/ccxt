from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_markets = publicGetMarkets = Entry('markets', 'public', 'GET', {'cost': 1})
    public_get_orders_market = publicGetOrdersMarket = Entry('orders/{market}', 'public', 'GET', {'cost': 1})
    public_get_ticker_market = publicGetTickerMarket = Entry('ticker/{market}', 'public', 'GET', {'cost': 1})
    public_get_history_market = publicGetHistoryMarket = Entry('history/{market}', 'public', 'GET', {'cost': 1})
    private_get_account_balance = privateGetAccountBalance = Entry('account/balance', 'private', 'GET', {'cost': 1})
    private_get_account_balances = privateGetAccountBalances = Entry('account/balances', 'private', 'GET', {'cost': 1})
    private_get_account_order_uuid = privateGetAccountOrderUuid = Entry('account/order/{uuid}', 'private', 'GET', {'cost': 1})
    private_post_order_buy = privatePostOrderBuy = Entry('order/buy', 'private', 'POST', {'cost': 1})
    private_post_order_sell = privatePostOrderSell = Entry('order/sell', 'private', 'POST', {'cost': 1})
    private_post_order_cancel = privatePostOrderCancel = Entry('order/cancel', 'private', 'POST', {'cost': 1})
    private_post_orders = privatePostOrders = Entry('orders', 'private', 'POST', {'cost': 1})
    private_post_account_orders = privatePostAccountOrders = Entry('account/orders', 'private', 'POST', {'cost': 1})
