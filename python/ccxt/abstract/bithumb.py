from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict

_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_get_ticker_all_quoteid = publicGetTickerALLQuoteId = Entry[_Dict]('ticker/ALL_{quoteId}', 'public', 'GET', {'cost': 1})
    public_get_ticker_baseid_quoteid = publicGetTickerBaseIdQuoteId = Entry[_Dict]('ticker/{baseId}_{quoteId}', 'public', 'GET', {'cost': 1})
    public_get_orderbook_all_quoteid = publicGetOrderbookALLQuoteId = Entry[_Dict]('orderbook/ALL_{quoteId}', 'public', 'GET', {'cost': 1})
    public_get_orderbook_baseid_quoteid = publicGetOrderbookBaseIdQuoteId = Entry[_Dict]('orderbook/{baseId}_{quoteId}', 'public', 'GET', {'cost': 1})
    public_get_transaction_history_baseid_quoteid = publicGetTransactionHistoryBaseIdQuoteId = Entry[_Dict]('transaction_history/{baseId}_{quoteId}', 'public', 'GET', {'cost': 1})
    public_get_network_info = publicGetNetworkInfo = Entry[_Dict]('network-info', 'public', 'GET', {'cost': 1})
    public_get_assetsstatus_multichain_all = publicGetAssetsstatusMultichainALL = Entry[_Dict]('assetsstatus/multichain/ALL', 'public', 'GET', {'cost': 1})
    public_get_assetsstatus_multichain_currency = publicGetAssetsstatusMultichainCurrency = Entry[_Dict]('assetsstatus/multichain/{currency}', 'public', 'GET', {'cost': 1})
    public_get_withdraw_minimum_all = publicGetWithdrawMinimumALL = Entry[_Dict]('withdraw/minimum/ALL', 'public', 'GET', {'cost': 1})
    public_get_withdraw_minimum_currency = publicGetWithdrawMinimumCurrency = Entry[_Dict]('withdraw/minimum/{currency}', 'public', 'GET', {'cost': 1})
    public_get_assetsstatus_all = publicGetAssetsstatusALL = Entry[_Dict]('assetsstatus/ALL', 'public', 'GET', {'cost': 1})
    public_get_assetsstatus_baseid = publicGetAssetsstatusBaseId = Entry[_Dict]('assetsstatus/{baseId}', 'public', 'GET', {'cost': 1})
    public_get_candlestick_baseid_quoteid_interval = publicGetCandlestickBaseIdQuoteIdInterval = Entry[_Dict]('candlestick/{baseId}_{quoteId}/{interval}', 'public', 'GET', {'cost': 1})
    private_post_info_account = privatePostInfoAccount = Entry[_Dict]('info/account', 'private', 'POST', {'cost': 1})
    private_post_info_balance = privatePostInfoBalance = Entry[_Dict]('info/balance', 'private', 'POST', {'cost': 1})
    private_post_info_wallet_address = privatePostInfoWalletAddress = Entry[_Dict]('info/wallet_address', 'private', 'POST', {'cost': 1})
    private_post_info_ticker = privatePostInfoTicker = Entry[_Dict]('info/ticker', 'private', 'POST', {'cost': 1})
    private_post_info_orders = privatePostInfoOrders = Entry[_Dict]('info/orders', 'private', 'POST', {'cost': 1})
    private_post_info_user_transactions = privatePostInfoUserTransactions = Entry[_Dict]('info/user_transactions', 'private', 'POST', {'cost': 1})
    private_post_info_order_detail = privatePostInfoOrderDetail = Entry[_Dict]('info/order_detail', 'private', 'POST', {'cost': 1})
    private_post_trade_place = privatePostTradePlace = Entry[_Dict]('trade/place', 'private', 'POST', {'cost': 1})
    private_post_trade_cancel = privatePostTradeCancel = Entry[_Dict]('trade/cancel', 'private', 'POST', {'cost': 1})
    private_post_trade_btc_withdrawal = privatePostTradeBtcWithdrawal = Entry[_Dict]('trade/btc_withdrawal', 'private', 'POST', {'cost': 1})
    private_post_trade_krw_deposit = privatePostTradeKrwDeposit = Entry[_Dict]('trade/krw_deposit', 'private', 'POST', {'cost': 1})
    private_post_trade_krw_withdrawal = privatePostTradeKrwWithdrawal = Entry[_Dict]('trade/krw_withdrawal', 'private', 'POST', {'cost': 1})
    private_post_trade_market_buy = privatePostTradeMarketBuy = Entry[_Dict]('trade/market_buy', 'private', 'POST', {'cost': 1})
    private_post_trade_market_sell = privatePostTradeMarketSell = Entry[_Dict]('trade/market_sell', 'private', 'POST', {'cost': 1})
    private_post_trade_stop_limit = privatePostTradeStopLimit = Entry[_Dict]('trade/stop_limit', 'private', 'POST', {'cost': 1})
