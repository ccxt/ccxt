from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict

_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_get_markets = publicGetMarkets = Entry[_Dict]('markets', 'public', 'GET', {'cost': 1})
    public_get_market = publicGetMarket = Entry[_Dict]('market', 'public', 'GET', {'cost': 1})
    public_get_tickers = publicGetTickers = Entry[_Dict]('tickers', 'public', 'GET', {'cost': 1})
    public_get_ticker = publicGetTicker = Entry[_Dict]('ticker', 'public', 'GET', {'cost': 1})
    public_get_book = publicGetBook = Entry[_Dict]('book', 'public', 'GET', {'cost': 1})
    public_get_history = publicGetHistory = Entry[_Dict]('history', 'public', 'GET', {'cost': 1})
    public_get_depth_result = publicGetDepthResult = Entry[_Dict]('depth/result', 'public', 'GET', {'cost': 1})
    public_get_market_kline = publicGetMarketKline = Entry[_Dict]('market/kline', 'public', 'GET', {'cost': 1})
    private_post_account_balances = privatePostAccountBalances = Entry[_Dict]('account/balances', 'private', 'POST', {'cost': 1})
    private_post_account_balance = privatePostAccountBalance = Entry[_Dict]('account/balance', 'private', 'POST', {'cost': 1})
    private_post_order_new = privatePostOrderNew = Entry[_Dict]('order/new', 'private', 'POST', {'cost': 1})
    private_post_order_cancel = privatePostOrderCancel = Entry[_Dict]('order/cancel', 'private', 'POST', {'cost': 1})
    private_post_orders = privatePostOrders = Entry[_Dict]('orders', 'private', 'POST', {'cost': 1})
    private_post_account_market_order_history = privatePostAccountMarketOrderHistory = Entry[_Dict]('account/market_order_history', 'private', 'POST', {'cost': 1})
    private_post_account_market_deal_history = privatePostAccountMarketDealHistory = Entry[_Dict]('account/market_deal_history', 'private', 'POST', {'cost': 1})
    private_post_account_order = privatePostAccountOrder = Entry[_Dict]('account/order', 'private', 'POST', {'cost': 1})
    private_post_account_order_history = privatePostAccountOrderHistory = Entry[_Dict]('account/order_history', 'private', 'POST', {'cost': 1})
    private_post_account_executed_history = privatePostAccountExecutedHistory = Entry[_Dict]('account/executed_history', 'private', 'POST', {'cost': 1})
