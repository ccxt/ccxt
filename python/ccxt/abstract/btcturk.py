from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_Dict = Dict[str, PythonAny]
_List = List[PythonAny]

class ImplicitAPI:
    public_get_orderbook = publicGetOrderbook = Entry[_Dict]('orderbook', 'public', 'GET', {'cost': 1})
    public_get_ticker = publicGetTicker = Entry[_Dict]('ticker', 'public', 'GET', {'cost': 0.1})
    public_get_trades = publicGetTrades = Entry[_Dict]('trades', 'public', 'GET', {'cost': 1})
    public_get_ohlc = publicGetOhlc = Entry[_Dict]('ohlc', 'public', 'GET', {'cost': 1})
    public_get_server_exchangeinfo = publicGetServerExchangeinfo = Entry[_Dict]('server/exchangeinfo', 'public', 'GET', {'cost': 1})
    private_get_users_balances = privateGetUsersBalances = Entry[_Dict]('users/balances', 'private', 'GET', {'cost': 1})
    private_get_openorders = privateGetOpenOrders = Entry[_Dict]('openOrders', 'private', 'GET', {'cost': 1})
    private_get_allorders = privateGetAllOrders = Entry[_Dict]('allOrders', 'private', 'GET', {'cost': 1})
    private_get_users_transactions_trade = privateGetUsersTransactionsTrade = Entry[_Dict]('users/transactions/trade', 'private', 'GET', {'cost': 1})
    private_post_users_transactions_crypto = privatePostUsersTransactionsCrypto = Entry[_Dict]('users/transactions/crypto', 'private', 'POST', {'cost': 1})
    private_post_users_transactions_fiat = privatePostUsersTransactionsFiat = Entry[_Dict]('users/transactions/fiat', 'private', 'POST', {'cost': 1})
    private_post_order = privatePostOrder = Entry[_Dict]('order', 'private', 'POST', {'cost': 1})
    private_post_cancelorder = privatePostCancelOrder = Entry[_Dict]('cancelOrder', 'private', 'POST', {'cost': 1})
    private_delete_order = privateDeleteOrder = Entry[_Dict]('order', 'private', 'DELETE', {'cost': 1})
    graph_get_ohlcs = graphGetOhlcs = Entry[_List]('ohlcs', 'graph', 'GET', {'cost': 1})
    graph_get_klines_history = graphGetKlinesHistory = Entry[_Dict]('klines/history', 'graph', 'GET', {'cost': 1})
