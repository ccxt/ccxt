from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict

_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_get_order_book_pair = publicGetOrderBookPair = Entry[_Dict]('order-book/{pair}', 'public', 'GET', {'cost': 1})
    public_get_tickers = publicGetTickers = Entry[_Dict]('tickers', 'public', 'GET', {'cost': 1})
    public_get_tickers_pair = publicGetTickersPair = Entry[_Dict]('tickers/{pair}', 'public', 'GET', {'cost': 1})
    public_get_trades_pair = publicGetTradesPair = Entry[_Dict]('trades/{pair}', 'public', 'GET', {'cost': 1})
    public_get_provisioning_currencies = publicGetProvisioningCurrencies = Entry[_Dict]('provisioning/currencies', 'public', 'GET', {'cost': 1})
    public_get_provisioning_trading_pairs = publicGetProvisioningTradingPairs = Entry[_Dict]('provisioning/trading-pairs', 'public', 'GET', {'cost': 1})
    public_get_provisioning_limitations_and_fees = publicGetProvisioningLimitationsAndFees = Entry[_Dict]('provisioning/limitations-and-fees', 'public', 'GET', {'cost': 1})
    public_get_trading_history_pair = publicGetTradingHistoryPair = Entry[_Dict]('trading-history/{pair}', 'public', 'GET', {'cost': 1})
    public_get_price_otc_currency = publicGetPriceOtcCurrency = Entry[_Dict]('price/otc/{currency}', 'public', 'GET', {'cost': 1})
    private_get_accounts_balance = privateGetAccountsBalance = Entry[_Dict]('accounts/balance', 'private', 'GET', {'cost': 1})
    private_get_orders_history = privateGetOrdersHistory = Entry[_Dict]('orders/history', 'private', 'GET', {'cost': 1})
    private_get_orders_all_pair = privateGetOrdersAllPair = Entry[_Dict]('orders/all/{pair}', 'private', 'GET', {'cost': 1})
    private_get_orders_trades_pair = privateGetOrdersTradesPair = Entry[_Dict]('orders/trades/{pair}', 'private', 'GET', {'cost': 1})
    private_get_orders_pair_orderid = privateGetOrdersPairOrderId = Entry[_Dict]('orders/{pair}/{orderId}', 'private', 'GET', {'cost': 1})
    private_get_wallet_withdraw_currency_serial = privateGetWalletWithdrawCurrencySerial = Entry[_Dict]('wallet/withdraw/{currency}/{serial}', 'private', 'GET', {'cost': 1})
    private_get_wallet_withdraw_currency_id_id = privateGetWalletWithdrawCurrencyIdId = Entry[_Dict]('wallet/withdraw/{currency}/id/{id}', 'private', 'GET', {'cost': 1})
    private_get_wallet_deposithistory_currency = privateGetWalletDepositHistoryCurrency = Entry[_Dict]('wallet/depositHistory/{currency}', 'private', 'GET', {'cost': 1})
    private_get_wallet_withdrawhistory_currency = privateGetWalletWithdrawHistoryCurrency = Entry[_Dict]('wallet/withdrawHistory/{currency}', 'private', 'GET', {'cost': 1})
    private_get_orders_open = privateGetOrdersOpen = Entry[_Dict]('orders/open', 'private', 'GET', {'cost': 1})
    private_post_orders_pair = privatePostOrdersPair = Entry[_Dict]('orders/{pair}', 'private', 'POST', {'cost': 0.5})
    private_post_orders_batch = privatePostOrdersBatch = Entry[_Dict]('orders/batch', 'private', 'POST', {'cost': 6.666666666666667})
    private_post_wallet_withdraw_currency = privatePostWalletWithdrawCurrency = Entry[_Dict]('wallet/withdraw/{currency}', 'private', 'POST', {'cost': 10})
    private_put_orders = privatePutOrders = Entry[_Dict]('orders', 'private', 'PUT', {'cost': 5})
    private_delete_orders_pair_id = privateDeleteOrdersPairId = Entry[_Dict]('orders/{pair}/{id}', 'private', 'DELETE', {'cost': 0.6666666666666666})
    private_delete_orders_all = privateDeleteOrdersAll = Entry[_Dict]('orders/all', 'private', 'DELETE', {'cost': 5})
    private_delete_orders_pair = privateDeleteOrdersPair = Entry[_Dict]('orders/{pair}', 'private', 'DELETE', {'cost': 5})
