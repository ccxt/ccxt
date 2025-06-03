from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_currencies = publicGetCurrencies = Entry('currencies', 'public', 'GET', {})
    public_get_candlesticks_instrument_code = publicGetCandlesticksInstrumentCode = Entry('candlesticks/{instrument_code}', 'public', 'GET', {})
    public_get_fees = publicGetFees = Entry('fees', 'public', 'GET', {})
    public_get_instruments = publicGetInstruments = Entry('instruments', 'public', 'GET', {})
    public_get_order_book_instrument_code = publicGetOrderBookInstrumentCode = Entry('order-book/{instrument_code}', 'public', 'GET', {})
    public_get_market_ticker = publicGetMarketTicker = Entry('market-ticker', 'public', 'GET', {})
    public_get_market_ticker_instrument_code = publicGetMarketTickerInstrumentCode = Entry('market-ticker/{instrument_code}', 'public', 'GET', {})
    public_get_time = publicGetTime = Entry('time', 'public', 'GET', {})
    private_get_account_balances = privateGetAccountBalances = Entry('account/balances', 'private', 'GET', {})
    private_get_account_fees = privateGetAccountFees = Entry('account/fees', 'private', 'GET', {})
    private_get_account_orders = privateGetAccountOrders = Entry('account/orders', 'private', 'GET', {})
    private_get_account_orders_order_id = privateGetAccountOrdersOrderId = Entry('account/orders/{order_id}', 'private', 'GET', {})
    private_get_account_orders_order_id_trades = privateGetAccountOrdersOrderIdTrades = Entry('account/orders/{order_id}/trades', 'private', 'GET', {})
    private_get_account_trades = privateGetAccountTrades = Entry('account/trades', 'private', 'GET', {})
    private_get_account_trades_trade_id = privateGetAccountTradesTradeId = Entry('account/trades/{trade_id}', 'private', 'GET', {})
    private_post_account_orders = privatePostAccountOrders = Entry('account/orders', 'private', 'POST', {})
    private_delete_account_orders = privateDeleteAccountOrders = Entry('account/orders', 'private', 'DELETE', {})
    private_delete_account_orders_order_id = privateDeleteAccountOrdersOrderId = Entry('account/orders/{order_id}', 'private', 'DELETE', {})
    private_delete_account_orders_client_client_id = privateDeleteAccountOrdersClientClientId = Entry('account/orders/client/{client_id}', 'private', 'DELETE', {})
