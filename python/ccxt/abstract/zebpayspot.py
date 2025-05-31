from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_market_orderbook = publicGetMarketOrderbook = Entry('market/orderbook', 'public', 'GET', {'cost': 10})
    public_get_market_trades = publicGetMarketTrades = Entry('market/trades', 'public', 'GET', {'cost': 10})
    public_get_market_ticker = publicGetMarketTicker = Entry('market/ticker', 'public', 'GET', {'cost': 10})
    public_get_market_alltickers = publicGetMarketAllTickers = Entry('market/allTickers', 'public', 'GET', {'cost': 10})
    public_get_ex_tradepairs = publicGetExTradepairs = Entry('ex/tradepairs', 'public', 'GET', {'cost': 10})
    public_get_ex_currencies = publicGetExCurrencies = Entry('ex/currencies', 'public', 'GET', {'cost': 10})
    public_get_market_klines = publicGetMarketKlines = Entry('market/klines', 'public', 'GET', {'cost': 10})
    private_post_ex_orders = privatePostExOrders = Entry('ex/orders', 'private', 'POST', {'cost': 10})
    private_get_ex_orders = privateGetExOrders = Entry('ex/orders', 'private', 'GET', {'cost': 10})
    private_get_account_balance = privateGetAccountBalance = Entry('account/balance', 'private', 'GET', {'cost': 10})
    private_get_ex_fee_symbol = privateGetExFeeSymbol = Entry('ex/fee/{symbol}', 'private', 'GET', {'cost': 10})
    private_get_ex_orders_orderid = privateGetExOrdersOrderId = Entry('ex/orders/{orderId}', 'private', 'GET', {'cost': 10})
    private_get_ex_orders_fills_orderid = privateGetExOrdersFillsOrderId = Entry('ex/orders/fills/{orderId}', 'private', 'GET', {'cost': 10})
    private_delete_ex_orders_orderid = privateDeleteExOrdersOrderId = Entry('ex/orders/{orderId}', 'private', 'DELETE', {'cost': 10})
    private_delete_ex_orders = privateDeleteExOrders = Entry('ex/orders', 'private', 'DELETE', {'cost': 10})
    private_delete_ex_orders_cancelall = privateDeleteExOrdersCancelAll = Entry('ex/orders/cancelAll', 'private', 'DELETE', {'cost': 10})
