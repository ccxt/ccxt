from ccxt.base.types import Entry
_Dict = dict[str, object]
_List = list[object]


class ImplicitAPI:
    public_get_2_0_public_order_book_symbol = publicGet20PublicOrderBookSymbol = Entry[_Dict | _List]('2.0/public/order-book/{symbol}', 'public', 'GET', {'cost': 1})
    public_get_1_0_public_tickers = publicGet10PublicTickers = Entry[_Dict | _List]('1.0/public/tickers', 'public', 'GET', {'cost': 1})
    public_get_1_0_public_candles_symbol = publicGet10PublicCandlesSymbol = Entry[_Dict | _List]('1.0/public/candles/{symbol}', 'public', 'GET', {'cost': 1})
    public_get_1_0_public_trades_all = publicGet10PublicTradesAll = Entry[_Dict | _List]('1.0/public/trades/all', 'public', 'GET', {'cost': 1})
    public_get_1_0_public_configuration_currencies = publicGet10PublicConfigurationCurrencies = Entry[_Dict | _List]('1.0/public/configuration/currencies', 'public', 'GET', {'cost': 1})
    public_get_1_0_public_configuration_pairs = publicGet10PublicConfigurationPairs = Entry[_Dict | _List]('1.0/public/configuration/pairs', 'public', 'GET', {'cost': 1})
    private_get_1_0_balances = privateGet10Balances = Entry[_Dict | _List]('1.0/balances', 'private', 'GET', {'cost': 1})
    private_get_1_0_orders_active = privateGet10OrdersActive = Entry[_Dict | _List]('1.0/orders/active', 'private', 'GET', {'cost': 1})
    private_get_1_0_orders_historical = privateGet10OrdersHistorical = Entry[_Dict | _List]('1.0/orders/historical', 'private', 'GET', {'cost': 1})
    private_get_1_0_orders_venue_order_id = privateGet10OrdersVenueOrderId = Entry[_Dict | _List]('1.0/orders/{venue_order_id}', 'private', 'GET', {'cost': 1})
    private_get_1_0_orders_fills_venue_order_id = privateGet10OrdersFillsVenueOrderId = Entry[_Dict | _List]('1.0/orders/fills/{venue_order_id}', 'private', 'GET', {'cost': 1})
    private_get_1_0_trades_private_symbol = privateGet10TradesPrivateSymbol = Entry[_Dict | _List]('1.0/trades/private/{symbol}', 'private', 'GET', {'cost': 1})
    private_post_1_0_orders = privatePost10Orders = Entry[_Dict | _List]('1.0/orders', 'private', 'POST', {'cost': 1})
    private_put_1_0_orders_venue_order_id = privatePut10OrdersVenueOrderId = Entry[_Dict | _List]('1.0/orders/{venue_order_id}', 'private', 'PUT', {'cost': 1})
    private_delete_1_0_orders = privateDelete10Orders = Entry[_Dict | _List]('1.0/orders', 'private', 'DELETE', {'cost': 1})
    private_delete_1_0_orders_venue_order_id = privateDelete10OrdersVenueOrderId = Entry[_Dict | _List]('1.0/orders/{venue_order_id}', 'private', 'DELETE', {'cost': 1})
