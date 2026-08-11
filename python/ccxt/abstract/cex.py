from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict

_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_post_get_server_time = publicPostGetServerTime = Entry[_Dict]('get_server_time', 'public', 'POST', {'cost': 1})
    public_post_get_pairs_info = publicPostGetPairsInfo = Entry[_Dict]('get_pairs_info', 'public', 'POST', {'cost': 1})
    public_post_get_currencies_info = publicPostGetCurrenciesInfo = Entry[_Dict]('get_currencies_info', 'public', 'POST', {'cost': 1})
    public_post_get_processing_info = publicPostGetProcessingInfo = Entry[_Dict]('get_processing_info', 'public', 'POST', {'cost': 10})
    public_post_get_ticker = publicPostGetTicker = Entry[_Dict]('get_ticker', 'public', 'POST', {'cost': 1})
    public_post_get_trade_history = publicPostGetTradeHistory = Entry[_Dict]('get_trade_history', 'public', 'POST', {'cost': 1})
    public_post_get_order_book = publicPostGetOrderBook = Entry[_Dict]('get_order_book', 'public', 'POST', {'cost': 1})
    public_post_get_candles = publicPostGetCandles = Entry[_Dict]('get_candles', 'public', 'POST', {'cost': 1})
    private_post_get_my_current_fee = privatePostGetMyCurrentFee = Entry[_Dict]('get_my_current_fee', 'private', 'POST', {'cost': 5})
    private_post_get_fee_strategy = privatePostGetFeeStrategy = Entry[_Dict]('get_fee_strategy', 'private', 'POST', {'cost': 1})
    private_post_get_my_volume = privatePostGetMyVolume = Entry[_Dict]('get_my_volume', 'private', 'POST', {'cost': 5})
    private_post_do_create_account = privatePostDoCreateAccount = Entry[_Dict]('do_create_account', 'private', 'POST', {'cost': 1})
    private_post_get_my_account_status_v3 = privatePostGetMyAccountStatusV3 = Entry[_Dict]('get_my_account_status_v3', 'private', 'POST', {'cost': 5})
    private_post_get_my_wallet_balance = privatePostGetMyWalletBalance = Entry[_Dict]('get_my_wallet_balance', 'private', 'POST', {'cost': 5})
    private_post_get_my_orders = privatePostGetMyOrders = Entry[_Dict]('get_my_orders', 'private', 'POST', {'cost': 5})
    private_post_do_my_new_order = privatePostDoMyNewOrder = Entry[_Dict]('do_my_new_order', 'private', 'POST', {'cost': 1})
    private_post_do_cancel_my_order = privatePostDoCancelMyOrder = Entry[_Dict]('do_cancel_my_order', 'private', 'POST', {'cost': 1})
    private_post_do_cancel_all_orders = privatePostDoCancelAllOrders = Entry[_Dict]('do_cancel_all_orders', 'private', 'POST', {'cost': 5})
    private_post_get_order_book = privatePostGetOrderBook = Entry[_Dict]('get_order_book', 'private', 'POST', {'cost': 1})
    private_post_get_candles = privatePostGetCandles = Entry[_Dict]('get_candles', 'private', 'POST', {'cost': 1})
    private_post_get_trade_history = privatePostGetTradeHistory = Entry[_Dict]('get_trade_history', 'private', 'POST', {'cost': 1})
    private_post_get_my_transaction_history = privatePostGetMyTransactionHistory = Entry[_Dict]('get_my_transaction_history', 'private', 'POST', {'cost': 1})
    private_post_get_my_funding_history = privatePostGetMyFundingHistory = Entry[_Dict]('get_my_funding_history', 'private', 'POST', {'cost': 5})
    private_post_do_my_internal_transfer = privatePostDoMyInternalTransfer = Entry[_Dict]('do_my_internal_transfer', 'private', 'POST', {'cost': 1})
    private_post_get_processing_info = privatePostGetProcessingInfo = Entry[_Dict]('get_processing_info', 'private', 'POST', {'cost': 10})
    private_post_get_deposit_address = privatePostGetDepositAddress = Entry[_Dict]('get_deposit_address', 'private', 'POST', {'cost': 5})
    private_post_do_deposit_funds_from_wallet = privatePostDoDepositFundsFromWallet = Entry[_Dict]('do_deposit_funds_from_wallet', 'private', 'POST', {'cost': 1})
    private_post_do_withdrawal_funds_to_wallet = privatePostDoWithdrawalFundsToWallet = Entry[_Dict]('do_withdrawal_funds_to_wallet', 'private', 'POST', {'cost': 1})
