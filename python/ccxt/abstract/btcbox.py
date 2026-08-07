from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_Dict = Dict[str, PythonAny]
_List = List[PythonAny]

class ImplicitAPI:
    public_get_depth = publicGetDepth = Entry[_Dict]('depth', 'public', 'GET', {'cost': 1})
    public_get_orders = publicGetOrders = Entry[_List]('orders', 'public', 'GET', {'cost': 1})
    public_get_ticker = publicGetTicker = Entry[_Dict]('ticker', 'public', 'GET', {'cost': 1})
    public_get_tickers = publicGetTickers = Entry[_Dict]('tickers', 'public', 'GET', {'cost': 1})
    private_post_balance = privatePostBalance = Entry[_Dict]('balance', 'private', 'POST', {'cost': 1})
    private_post_trade_add = privatePostTradeAdd = Entry[_Dict]('trade_add', 'private', 'POST', {'cost': 1})
    private_post_trade_cancel = privatePostTradeCancel = Entry[_Dict]('trade_cancel', 'private', 'POST', {'cost': 1})
    private_post_trade_list = privatePostTradeList = Entry[_List]('trade_list', 'private', 'POST', {'cost': 1})
    private_post_trade_view = privatePostTradeView = Entry[_Dict]('trade_view', 'private', 'POST', {'cost': 1})
    private_post_wallet = privatePostWallet = Entry[_Dict]('wallet', 'private', 'POST', {'cost': 1})
    webapi_get_ajax_coin_coininfo = webApiGetAjaxCoinCoinInfo = Entry[_Dict]('ajax/coin/coinInfo', 'webApi', 'GET', {'cost': 1})
