from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_depth_pair = publicGetDepthPair = Entry('depth/{pair}', 'public', 'GET', {'cost': 1})
    public_get_info = publicGetInfo = Entry('info', 'public', 'GET', {'cost': 1})
    public_get_ticker_pair = publicGetTickerPair = Entry('ticker/{pair}', 'public', 'GET', {'cost': 1})
    public_get_trades_pair = publicGetTradesPair = Entry('trades/{pair}', 'public', 'GET', {'cost': 1})
    private_post_activeorders = privatePostActiveOrders = Entry('ActiveOrders', 'private', 'POST', {'cost': 1})
    private_post_cancelorder = privatePostCancelOrder = Entry('CancelOrder', 'private', 'POST', {'cost': 1})
    private_post_getdepositaddress = privatePostGetDepositAddress = Entry('GetDepositAddress', 'private', 'POST', {'cost': 1})
    private_post_getinfo = privatePostGetInfo = Entry('getInfo', 'private', 'POST', {'cost': 1})
    private_post_orderinfo = privatePostOrderInfo = Entry('OrderInfo', 'private', 'POST', {'cost': 1})
    private_post_trade = privatePostTrade = Entry('Trade', 'private', 'POST', {'cost': 1})
    private_post_tradehistory = privatePostTradeHistory = Entry('TradeHistory', 'private', 'POST', {'cost': 1})
    private_post_withdrawcoinstoaddress = privatePostWithdrawCoinsToAddress = Entry('WithdrawCoinsToAddress', 'private', 'POST', {'cost': 1})
