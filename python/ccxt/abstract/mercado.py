from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_List = List[PythonAny]
_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_get_coins = publicGetCoins = Entry[_List]('coins', 'public', 'GET', {'cost': 1})
    public_get_coin_orderbook = publicGetCoinOrderbook = Entry[_Dict]('{coin}/orderbook/', 'public', 'GET', {'cost': 1})
    public_get_coin_ticker = publicGetCoinTicker = Entry[_Dict]('{coin}/ticker/', 'public', 'GET', {'cost': 1})
    public_get_coin_trades = publicGetCoinTrades = Entry[_List]('{coin}/trades/', 'public', 'GET', {'cost': 1})
    public_get_coin_trades_from = publicGetCoinTradesFrom = Entry[_List]('{coin}/trades/{from}/', 'public', 'GET', {'cost': 1})
    public_get_coin_trades_from_to = publicGetCoinTradesFromTo = Entry[_List]('{coin}/trades/{from}/{to}', 'public', 'GET', {'cost': 1})
    public_get_coin_day_summary_year_month_day = publicGetCoinDaySummaryYearMonthDay = Entry[_Dict]('{coin}/day-summary/{year}/{month}/{day}/', 'public', 'GET', {'cost': 1})
    private_post_cancel_order = privatePostCancelOrder = Entry[_Dict]('cancel_order', 'private', 'POST', {'cost': 1})
    private_post_get_account_info = privatePostGetAccountInfo = Entry[_Dict]('get_account_info', 'private', 'POST', {'cost': 1})
    private_post_get_order = privatePostGetOrder = Entry[_Dict]('get_order', 'private', 'POST', {'cost': 1})
    private_post_get_withdrawal = privatePostGetWithdrawal = Entry[_Dict]('get_withdrawal', 'private', 'POST', {'cost': 1})
    private_post_list_system_messages = privatePostListSystemMessages = Entry[_Dict]('list_system_messages', 'private', 'POST', {'cost': 1})
    private_post_list_orders = privatePostListOrders = Entry[_Dict]('list_orders', 'private', 'POST', {'cost': 1})
    private_post_list_orderbook = privatePostListOrderbook = Entry[_Dict]('list_orderbook', 'private', 'POST', {'cost': 1})
    private_post_place_buy_order = privatePostPlaceBuyOrder = Entry[_Dict]('place_buy_order', 'private', 'POST', {'cost': 1})
    private_post_place_sell_order = privatePostPlaceSellOrder = Entry[_Dict]('place_sell_order', 'private', 'POST', {'cost': 1})
    private_post_place_market_buy_order = privatePostPlaceMarketBuyOrder = Entry[_Dict]('place_market_buy_order', 'private', 'POST', {'cost': 1})
    private_post_place_market_sell_order = privatePostPlaceMarketSellOrder = Entry[_Dict]('place_market_sell_order', 'private', 'POST', {'cost': 1})
    private_post_withdraw_coin = privatePostWithdrawCoin = Entry[_Dict]('withdraw_coin', 'private', 'POST', {'cost': 1})
    v4public_get_coin_candle = v4PublicGetCoinCandle = Entry[_Dict]('{coin}/candle/', 'v4Public', 'GET', {'cost': 1})
    v4publicnet_get_candles = v4PublicNetGetCandles = Entry[_Dict]('candles', 'v4PublicNet', 'GET', {'cost': 1})
