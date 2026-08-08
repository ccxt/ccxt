from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict, List

_List = List[PythonAny]
_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_get_tickers = publicGetTickers = Entry[_List]('tickers', 'public', 'GET', {'cost': 1})
    public_get_tickers_symbol = publicGetTickersSymbol = Entry[_Dict]('tickers/{symbol}', 'public', 'GET', {'cost': 1})
    public_get_symbols = publicGetSymbols = Entry[_Dict]('symbols', 'public', 'GET', {'cost': 1})
    public_get_symbols_symbol = publicGetSymbolsSymbol = Entry[_Dict]('symbols/{symbol}', 'public', 'GET', {'cost': 1})
    public_get_l2_symbol = publicGetL2Symbol = Entry[_Dict]('l2/{symbol}', 'public', 'GET', {'cost': 1})
    public_get_l3_symbol = publicGetL3Symbol = Entry[_Dict]('l3/{symbol}', 'public', 'GET', {'cost': 1})
    private_get_fees = privateGetFees = Entry[_Dict]('fees', 'private', 'GET', {'cost': 1})
    private_get_orders = privateGetOrders = Entry[_List]('orders', 'private', 'GET', {'cost': 1})
    private_get_orders_orderid = privateGetOrdersOrderId = Entry[_Dict]('orders/{orderId}', 'private', 'GET', {'cost': 1})
    private_get_trades = privateGetTrades = Entry[_List]('trades', 'private', 'GET', {'cost': 1})
    private_get_fills = privateGetFills = Entry[_List]('fills', 'private', 'GET', {'cost': 1})
    private_get_deposits = privateGetDeposits = Entry[_List]('deposits', 'private', 'GET', {'cost': 1})
    private_get_deposits_depositid = privateGetDepositsDepositId = Entry[_Dict]('deposits/{depositId}', 'private', 'GET', {'cost': 1})
    private_get_accounts = privateGetAccounts = Entry[_Dict]('accounts', 'private', 'GET', {'cost': 1})
    private_get_accounts_account_currency = privateGetAccountsAccountCurrency = Entry[_Dict]('accounts/{account}/{currency}', 'private', 'GET', {'cost': 1})
    private_get_whitelist = privateGetWhitelist = Entry[_List]('whitelist', 'private', 'GET', {'cost': 1})
    private_get_whitelist_currency = privateGetWhitelistCurrency = Entry[_List]('whitelist/{currency}', 'private', 'GET', {'cost': 1})
    private_get_withdrawals = privateGetWithdrawals = Entry[_List]('withdrawals', 'private', 'GET', {'cost': 1})
    private_get_withdrawals_withdrawalid = privateGetWithdrawalsWithdrawalId = Entry[_Dict]('withdrawals/{withdrawalId}', 'private', 'GET', {'cost': 1})
    private_post_orders = privatePostOrders = Entry[_Dict]('orders', 'private', 'POST', {'cost': 1})
    private_post_deposits_currency = privatePostDepositsCurrency = Entry[_Dict]('deposits/{currency}', 'private', 'POST', {'cost': 1})
    private_post_withdrawals = privatePostWithdrawals = Entry[_Dict]('withdrawals', 'private', 'POST', {'cost': 1})
    private_delete_orders = privateDeleteOrders = Entry[_Dict]('orders', 'private', 'DELETE', {'cost': 1})
    private_delete_orders_orderid = privateDeleteOrdersOrderId = Entry[_Dict]('orders/{orderId}', 'private', 'DELETE', {'cost': 1})
