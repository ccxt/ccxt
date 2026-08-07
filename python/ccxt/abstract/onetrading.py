from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_List = List[PythonAny]
_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_get_currencies = publicGetCurrencies = Entry[_List]('currencies', 'public', 'GET', {'cost': 1})
    public_get_candlesticks_instrument_code = publicGetCandlesticksInstrumentCode = Entry[_Dict]('candlesticks/{instrument_code}', 'public', 'GET', {'cost': 1})
    public_get_fees = publicGetFees = Entry[_List]('fees', 'public', 'GET', {'cost': 1})
    public_get_instruments = publicGetInstruments = Entry[_List]('instruments', 'public', 'GET', {'cost': 1})
    public_get_order_book_instrument_code = publicGetOrderBookInstrumentCode = Entry[_Dict]('order-book/{instrument_code}', 'public', 'GET', {'cost': 1})
    public_get_market_ticker = publicGetMarketTicker = Entry[_List]('market-ticker', 'public', 'GET', {'cost': 1})
    public_get_market_ticker_instrument_code = publicGetMarketTickerInstrumentCode = Entry[_Dict]('market-ticker/{instrument_code}', 'public', 'GET', {'cost': 1})
    public_get_time = publicGetTime = Entry[_Dict]('time', 'public', 'GET', {'cost': 1})
    private_get_account_balances = privateGetAccountBalances = Entry[_Dict]('account/balances', 'private', 'GET', {'cost': 1})
    private_get_account_fees = privateGetAccountFees = Entry[_Dict]('account/fees', 'private', 'GET', {'cost': 1})
    private_get_account_orders = privateGetAccountOrders = Entry[_Dict]('account/orders', 'private', 'GET', {'cost': 1})
    private_get_account_orders_order_id = privateGetAccountOrdersOrderId = Entry[_Dict]('account/orders/{order_id}', 'private', 'GET', {'cost': 1})
    private_get_account_orders_client_client_id = privateGetAccountOrdersClientClientId = Entry[_Dict]('account/orders/client/{client_id}', 'private', 'GET', {'cost': 1})
    private_get_account_orders_order_id_trades = privateGetAccountOrdersOrderIdTrades = Entry[_Dict]('account/orders/{order_id}/trades', 'private', 'GET', {'cost': 1})
    private_get_account_trades = privateGetAccountTrades = Entry[_Dict]('account/trades', 'private', 'GET', {'cost': 1})
    private_get_account_trade_trade_id = privateGetAccountTradeTradeId = Entry[_Dict]('account/trade/{trade_id}', 'private', 'GET', {'cost': 1})
    private_post_account_orders = privatePostAccountOrders = Entry[_Dict]('account/orders', 'private', 'POST', {'cost': 1})
    private_delete_account_orders = privateDeleteAccountOrders = Entry[_List]('account/orders', 'private', 'DELETE', {'cost': 1})
    private_delete_account_orders_order_id = privateDeleteAccountOrdersOrderId = Entry[_Dict]('account/orders/{order_id}', 'private', 'DELETE', {'cost': 1})
    private_delete_account_orders_client_client_id = privateDeleteAccountOrdersClientClientId = Entry[_Dict]('account/orders/client/{client_id}', 'private', 'DELETE', {'cost': 1})
