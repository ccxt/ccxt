from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_deals_symbol = publicGetDealsSymbol = Entry('deals/{symbol}', 'public', 'GET', {})
    public_get_trades_sell_symbol = publicGetTradesSellSymbol = Entry('trades/sell/{symbol}', 'public', 'GET', {})
    public_get_trades_buy_symbol = publicGetTradesBuySymbol = Entry('trades/buy/{symbol}', 'public', 'GET', {})
    public_get_japan_stat_high_symbol = publicGetJapanStatHighSymbol = Entry('japan_stat/high/{symbol}', 'public', 'GET', {})
    private_post_auth = privatePostAuth = Entry('auth', 'private', 'POST', {})
    private_post_ask_symbol = privatePostAskSymbol = Entry('ask/{symbol}', 'private', 'POST', {})
    private_post_balance = privatePostBalance = Entry('balance', 'private', 'POST', {})
    private_post_bid_symbol = privatePostBidSymbol = Entry('bid/{symbol}', 'private', 'POST', {})
    private_post_buy_symbol = privatePostBuySymbol = Entry('buy/{symbol}', 'private', 'POST', {})
    private_post_my_orders_symbol = privatePostMyOrdersSymbol = Entry('my_orders/{symbol}', 'private', 'POST', {})
    private_post_order_status_id = privatePostOrderStatusId = Entry('order/status/{id}', 'private', 'POST', {})
    private_post_remove_order_id = privatePostRemoveOrderId = Entry('remove/order/{id}', 'private', 'POST', {})
    private_post_sell_symbol = privatePostSellSymbol = Entry('sell/{symbol}', 'private', 'POST', {})
