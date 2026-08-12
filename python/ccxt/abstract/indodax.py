from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_Dict = Dict[str, PythonAny]
_List = List[PythonAny]

class ImplicitAPI:
    public_get_api_server_time = publicGetApiServerTime = Entry[_Dict]('api/server_time', 'public', 'GET', {'cost': 5})
    public_get_api_pairs = publicGetApiPairs = Entry[_List]('api/pairs', 'public', 'GET', {'cost': 5})
    public_get_api_price_increments = publicGetApiPriceIncrements = Entry[_Dict]('api/price_increments', 'public', 'GET', {'cost': 5})
    public_get_api_summaries = publicGetApiSummaries = Entry[_Dict]('api/summaries', 'public', 'GET', {'cost': 5})
    public_get_api_ticker_pair = publicGetApiTickerPair = Entry[_Dict]('api/ticker/{pair}', 'public', 'GET', {'cost': 5})
    public_get_api_ticker_all = publicGetApiTickerAll = Entry[_Dict]('api/ticker_all', 'public', 'GET', {'cost': 5})
    public_get_api_trades_pair = publicGetApiTradesPair = Entry[_List]('api/trades/{pair}', 'public', 'GET', {'cost': 5})
    public_get_api_depth_pair = publicGetApiDepthPair = Entry[_Dict]('api/depth/{pair}', 'public', 'GET', {'cost': 5})
    public_get_tradingview_history_v2 = publicGetTradingviewHistoryV2 = Entry[_List]('tradingview/history_v2', 'public', 'GET', {'cost': 5})
    private_post_getinfo = privatePostGetInfo = Entry[_Dict]('getInfo', 'private', 'POST', {'cost': 4})
    private_post_transhistory = privatePostTransHistory = Entry[_Dict]('transHistory', 'private', 'POST', {'cost': 4})
    private_post_trade = privatePostTrade = Entry[_Dict]('trade', 'private', 'POST', {'cost': 1})
    private_post_tradehistory = privatePostTradeHistory = Entry[_Dict]('tradeHistory', 'private', 'POST', {'cost': 4})
    private_post_openorders = privatePostOpenOrders = Entry[_Dict]('openOrders', 'private', 'POST', {'cost': 4})
    private_post_orderhistory = privatePostOrderHistory = Entry[_Dict]('orderHistory', 'private', 'POST', {'cost': 4})
    private_post_getorder = privatePostGetOrder = Entry[_Dict]('getOrder', 'private', 'POST', {'cost': 4})
    private_post_cancelorder = privatePostCancelOrder = Entry[_Dict]('cancelOrder', 'private', 'POST', {'cost': 4})
    private_post_withdrawfee = privatePostWithdrawFee = Entry[_Dict]('withdrawFee', 'private', 'POST', {'cost': 4})
    private_post_withdrawcoin = privatePostWithdrawCoin = Entry[_Dict]('withdrawCoin', 'private', 'POST', {'cost': 4})
    private_post_listdownline = privatePostListDownline = Entry[_Dict]('listDownline', 'private', 'POST', {'cost': 4})
    private_post_checkdownline = privatePostCheckDownline = Entry[_Dict]('checkDownline', 'private', 'POST', {'cost': 4})
    private_post_createvoucher = privatePostCreateVoucher = Entry[_Dict]('createVoucher', 'private', 'POST', {'cost': 4})
