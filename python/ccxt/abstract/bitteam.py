from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_Dict = Dict[str, PythonAny]
_List = List[PythonAny]

class ImplicitAPI:
    history_get_api_tw_history_pairname_resolution = historyGetApiTwHistoryPairNameResolution = Entry[_Dict]('api/tw/history/{pairName}/{resolution}', 'history', 'GET', {'cost': 1})
    public_get_trade_api_asset = publicGetTradeApiAsset = Entry[_Dict]('trade/api/asset', 'public', 'GET', {'cost': 1})
    public_get_trade_api_currencies = publicGetTradeApiCurrencies = Entry[_Dict]('trade/api/currencies', 'public', 'GET', {'cost': 1})
    public_get_trade_api_orderbooks_symbol = publicGetTradeApiOrderbooksSymbol = Entry[_Dict]('trade/api/orderbooks/{symbol}', 'public', 'GET', {'cost': 1})
    public_get_trade_api_orders = publicGetTradeApiOrders = Entry[_Dict]('trade/api/orders', 'public', 'GET', {'cost': 1})
    public_get_trade_api_pair_name = publicGetTradeApiPairName = Entry[_Dict]('trade/api/pair/{name}', 'public', 'GET', {'cost': 1})
    public_get_trade_api_pairs = publicGetTradeApiPairs = Entry[_Dict]('trade/api/pairs', 'public', 'GET', {'cost': 1})
    public_get_trade_api_pairs_precisions = publicGetTradeApiPairsPrecisions = Entry[_Dict]('trade/api/pairs/precisions', 'public', 'GET', {'cost': 1})
    public_get_trade_api_rates = publicGetTradeApiRates = Entry[_Dict]('trade/api/rates', 'public', 'GET', {'cost': 1})
    public_get_trade_api_trade_id = publicGetTradeApiTradeId = Entry[_Dict]('trade/api/trade/{id}', 'public', 'GET', {'cost': 1})
    public_get_trade_api_trades = publicGetTradeApiTrades = Entry[_Dict]('trade/api/trades', 'public', 'GET', {'cost': 1})
    public_get_trade_api_ccxt_pairs = publicGetTradeApiCcxtPairs = Entry[_Dict]('trade/api/ccxt/pairs', 'public', 'GET', {'cost': 1})
    public_get_trade_api_cmc_assets = publicGetTradeApiCmcAssets = Entry[_Dict]('trade/api/cmc/assets', 'public', 'GET', {'cost': 1})
    public_get_trade_api_cmc_orderbook_pair = publicGetTradeApiCmcOrderbookPair = Entry[_Dict]('trade/api/cmc/orderbook/{pair}', 'public', 'GET', {'cost': 1})
    public_get_trade_api_cmc_summary = publicGetTradeApiCmcSummary = Entry[_List]('trade/api/cmc/summary', 'public', 'GET', {'cost': 1})
    public_get_trade_api_cmc_ticker = publicGetTradeApiCmcTicker = Entry[_Dict]('trade/api/cmc/ticker', 'public', 'GET', {'cost': 1})
    public_get_trade_api_cmc_trades_pair = publicGetTradeApiCmcTradesPair = Entry[_List]('trade/api/cmc/trades/{pair}', 'public', 'GET', {'cost': 1})
    private_get_trade_api_ccxt_balance = privateGetTradeApiCcxtBalance = Entry[_Dict]('trade/api/ccxt/balance', 'private', 'GET', {'cost': 1})
    private_get_trade_api_ccxt_order_id = privateGetTradeApiCcxtOrderId = Entry[_Dict]('trade/api/ccxt/order/{id}', 'private', 'GET', {'cost': 1})
    private_get_trade_api_ccxt_ordersofuser = privateGetTradeApiCcxtOrdersOfUser = Entry[_Dict]('trade/api/ccxt/ordersOfUser', 'private', 'GET', {'cost': 1})
    private_get_trade_api_ccxt_tradesofuser = privateGetTradeApiCcxtTradesOfUser = Entry[_Dict]('trade/api/ccxt/tradesOfUser', 'private', 'GET', {'cost': 1})
    private_get_trade_api_transactionsofuser = privateGetTradeApiTransactionsOfUser = Entry[_Dict]('trade/api/transactionsOfUser', 'private', 'GET', {'cost': 1})
    private_post_trade_api_ccxt_cancel_all_order = privatePostTradeApiCcxtCancelAllOrder = Entry[_Dict]('trade/api/ccxt/cancel-all-order', 'private', 'POST', {'cost': 1})
    private_post_trade_api_ccxt_cancelorder = privatePostTradeApiCcxtCancelorder = Entry[_Dict]('trade/api/ccxt/cancelorder', 'private', 'POST', {'cost': 1})
    private_post_trade_api_ccxt_ordercreate = privatePostTradeApiCcxtOrdercreate = Entry[_Dict]('trade/api/ccxt/ordercreate', 'private', 'POST', {'cost': 1})
