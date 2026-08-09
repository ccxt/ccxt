from ccxt.base.types import Entry
from typing import Any as PythonAny, Dict

_Dict = Dict[str, PythonAny]

class ImplicitAPI:
    public_get_v3_symbols = publicGetV3Symbols = Entry[_Dict]('v3/symbols', 'public', 'GET', {'cost': 1})
    public_get_v3_history_funding = publicGetV3HistoryFunding = Entry[_Dict]('v3/history-funding', 'public', 'GET', {'cost': 1})
    public_get_v3_ticker = publicGetV3Ticker = Entry[_Dict]('v3/ticker', 'public', 'GET', {'cost': 1})
    public_get_v3_klines = publicGetV3Klines = Entry[_Dict]('v3/klines', 'public', 'GET', {'cost': 1})
    public_get_v3_trades = publicGetV3Trades = Entry[_Dict]('v3/trades', 'public', 'GET', {'cost': 1})
    public_get_v3_depth = publicGetV3Depth = Entry[_Dict]('v3/depth', 'public', 'GET', {'cost': 1})
    public_get_v3_time = publicGetV3Time = Entry[_Dict]('v3/time', 'public', 'GET', {'cost': 1})
    public_get_v3_data_all_ticker_info = publicGetV3DataAllTickerInfo = Entry[_Dict]('v3/data/all-ticker-info', 'public', 'GET', {'cost': 1})
    private_get_v3_account = privateGetV3Account = Entry[_Dict]('v3/account', 'private', 'GET', {'cost': 1})
    private_get_v3_account_balance = privateGetV3AccountBalance = Entry[_Dict]('v3/account-balance', 'private', 'GET', {'cost': 1})
    private_get_v3_fills = privateGetV3Fills = Entry[_Dict]('v3/fills', 'private', 'GET', {'cost': 1})
    private_get_v3_order_fills = privateGetV3OrderFills = Entry[_Dict]('v3/order-fills', 'private', 'GET', {'cost': 1})
    private_get_v3_order = privateGetV3Order = Entry[_Dict]('v3/order', 'private', 'GET', {'cost': 1})
    private_get_v3_history_orders = privateGetV3HistoryOrders = Entry[_Dict]('v3/history-orders', 'private', 'GET', {'cost': 1})
    private_get_v3_order_by_client_order_id = privateGetV3OrderByClientOrderId = Entry[_Dict]('v3/order-by-client-order-id', 'private', 'GET', {'cost': 1})
    private_get_v3_funding = privateGetV3Funding = Entry[_Dict]('v3/funding', 'private', 'GET', {'cost': 1})
    private_get_v3_historical_pnl = privateGetV3HistoricalPnl = Entry[_Dict]('v3/historical-pnl', 'private', 'GET', {'cost': 1})
    private_get_v3_open_orders = privateGetV3OpenOrders = Entry[_Dict]('v3/open-orders', 'private', 'GET', {'cost': 1})
    private_get_v3_transfers = privateGetV3Transfers = Entry[_Dict]('v3/transfers', 'private', 'GET', {'cost': 1})
    private_get_v3_transfer = privateGetV3Transfer = Entry[_Dict]('v3/transfer', 'private', 'GET', {'cost': 1})
    private_post_v3_delete_open_orders = privatePostV3DeleteOpenOrders = Entry[_Dict]('v3/delete-open-orders', 'private', 'POST', {'cost': 1})
    private_post_v3_delete_client_order_id = privatePostV3DeleteClientOrderId = Entry[_Dict]('v3/delete-client-order-id', 'private', 'POST', {'cost': 1})
    private_post_v3_delete_order = privatePostV3DeleteOrder = Entry[_Dict]('v3/delete-order', 'private', 'POST', {'cost': 1})
    private_post_v3_order = privatePostV3Order = Entry[_Dict]('v3/order', 'private', 'POST', {'cost': 1})
    private_post_v3_set_initial_margin_rate = privatePostV3SetInitialMarginRate = Entry[_Dict]('v3/set-initial-margin-rate', 'private', 'POST', {'cost': 1})
    private_post_v3_transfer_out = privatePostV3TransferOut = Entry[_Dict]('v3/transfer-out', 'private', 'POST', {'cost': 1})
    private_post_v3_contract_transfer_out = privatePostV3ContractTransferOut = Entry[_Dict]('v3/contract-transfer-out', 'private', 'POST', {'cost': 1})
