from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_depth = publicGetDepth = Entry('depth', 'public', 'GET', {'cost': 1})
    public_get_orders = publicGetOrders = Entry('orders', 'public', 'GET', {'cost': 1})
    public_get_ticker = publicGetTicker = Entry('ticker', 'public', 'GET', {'cost': 1})
    public_get_tickers = publicGetTickers = Entry('tickers', 'public', 'GET', {'cost': 1})
    private_post_balance = privatePostBalance = Entry('balance', 'private', 'POST', {'cost': 1})
    private_post_trade_add = privatePostTradeAdd = Entry('trade_add', 'private', 'POST', {'cost': 1})
    private_post_trade_cancel = privatePostTradeCancel = Entry('trade_cancel', 'private', 'POST', {'cost': 1})
    private_post_trade_list = privatePostTradeList = Entry('trade_list', 'private', 'POST', {'cost': 1})
    private_post_trade_view = privatePostTradeView = Entry('trade_view', 'private', 'POST', {'cost': 1})
    private_post_wallet = privatePostWallet = Entry('wallet', 'private', 'POST', {'cost': 1})
    webapi_get_ajax_coin_coininfo = webApiGetAjaxCoinCoinInfo = Entry('ajax/coin/coinInfo', 'webApi', 'GET', {'cost': 1})
