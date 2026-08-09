from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict

_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_get_pair_ticker = publicGetPairTicker = Entry[_Dict]('{pair}/ticker', 'public', 'GET', {'cost': 1})
    public_get_tickers = publicGetTickers = Entry[_Dict]('tickers', 'public', 'GET', {'cost': 1})
    public_get_tickers_jpy = publicGetTickersJpy = Entry[_Dict]('tickers_jpy', 'public', 'GET', {'cost': 1})
    public_get_pair_depth = publicGetPairDepth = Entry[_Dict]('{pair}/depth', 'public', 'GET', {'cost': 1})
    public_get_pair_transactions = publicGetPairTransactions = Entry[_Dict]('{pair}/transactions', 'public', 'GET', {'cost': 1})
    public_get_pair_transactions_yyyymmdd = publicGetPairTransactionsYyyymmdd = Entry[_Dict]('{pair}/transactions/{yyyymmdd}', 'public', 'GET', {'cost': 1})
    public_get_pair_candlestick_candletype_yyyymmdd = publicGetPairCandlestickCandletypeYyyymmdd = Entry[_Dict]('{pair}/candlestick/{candletype}/{yyyymmdd}', 'public', 'GET', {'cost': 1})
    public_get_pair_circuit_break_info = publicGetPairCircuitBreakInfo = Entry[_Dict]('{pair}/circuit_break_info', 'public', 'GET', {'cost': 1})
    private_get_user_assets = privateGetUserAssets = Entry[_Dict]('user/assets', 'private', 'GET', {'cost': 1})
    private_get_user_spot_order = privateGetUserSpotOrder = Entry[_Dict]('user/spot/order', 'private', 'GET', {'cost': 1})
    private_get_user_spot_active_orders = privateGetUserSpotActiveOrders = Entry[_Dict]('user/spot/active_orders', 'private', 'GET', {'cost': 1})
    private_get_user_margin_positions = privateGetUserMarginPositions = Entry[_Dict]('user/margin/positions', 'private', 'GET', {'cost': 1})
    private_get_user_spot_trade_history = privateGetUserSpotTradeHistory = Entry[_Dict]('user/spot/trade_history', 'private', 'GET', {'cost': 1})
    private_get_user_deposit_history = privateGetUserDepositHistory = Entry[_Dict]('user/deposit_history', 'private', 'GET', {'cost': 1})
    private_get_user_unconfirmed_deposits = privateGetUserUnconfirmedDeposits = Entry[_Dict]('user/unconfirmed_deposits', 'private', 'GET', {'cost': 1})
    private_get_user_deposit_originators = privateGetUserDepositOriginators = Entry[_Dict]('user/deposit_originators', 'private', 'GET', {'cost': 1})
    private_get_user_withdrawal_account = privateGetUserWithdrawalAccount = Entry[_Dict]('user/withdrawal_account', 'private', 'GET', {'cost': 1})
    private_get_user_withdrawal_history = privateGetUserWithdrawalHistory = Entry[_Dict]('user/withdrawal_history', 'private', 'GET', {'cost': 1})
    private_get_spot_status = privateGetSpotStatus = Entry[_Dict]('spot/status', 'private', 'GET', {'cost': 1})
    private_get_spot_pairs = privateGetSpotPairs = Entry[_Dict]('spot/pairs', 'private', 'GET', {'cost': 1})
    private_post_user_spot_order = privatePostUserSpotOrder = Entry[_Dict]('user/spot/order', 'private', 'POST', {'cost': 1.66})
    private_post_user_spot_cancel_order = privatePostUserSpotCancelOrder = Entry[_Dict]('user/spot/cancel_order', 'private', 'POST', {'cost': 1.66})
    private_post_user_spot_cancel_orders = privatePostUserSpotCancelOrders = Entry[_Dict]('user/spot/cancel_orders', 'private', 'POST', {'cost': 1.66})
    private_post_user_spot_orders_info = privatePostUserSpotOrdersInfo = Entry[_Dict]('user/spot/orders_info', 'private', 'POST', {'cost': 1.66})
    private_post_user_confirm_deposits = privatePostUserConfirmDeposits = Entry[_Dict]('user/confirm_deposits', 'private', 'POST', {'cost': 1.66})
    private_post_user_confirm_deposits_all = privatePostUserConfirmDepositsAll = Entry[_Dict]('user/confirm_deposits_all', 'private', 'POST', {'cost': 1.66})
    private_post_user_request_withdrawal = privatePostUserRequestWithdrawal = Entry[_Dict]('user/request_withdrawal', 'private', 'POST', {'cost': 1.66})
    markets_get_spot_pairs = marketsGetSpotPairs = Entry[_Dict]('spot/pairs', 'markets', 'GET', {'cost': 1})
