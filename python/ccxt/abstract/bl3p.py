from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_market_ticker = publicGetMarketTicker = Entry('{market}/ticker', 'public', 'GET', {})
    public_get_market_orderbook = publicGetMarketOrderbook = Entry('{market}/orderbook', 'public', 'GET', {})
    public_get_market_trades = publicGetMarketTrades = Entry('{market}/trades', 'public', 'GET', {})
    private_post_market_money_depth_full = privatePostMarketMoneyDepthFull = Entry('{market}/money/depth/full', 'private', 'POST', {})
    private_post_market_money_order_add = privatePostMarketMoneyOrderAdd = Entry('{market}/money/order/add', 'private', 'POST', {})
    private_post_market_money_order_cancel = privatePostMarketMoneyOrderCancel = Entry('{market}/money/order/cancel', 'private', 'POST', {})
    private_post_market_money_order_result = privatePostMarketMoneyOrderResult = Entry('{market}/money/order/result', 'private', 'POST', {})
    private_post_market_money_orders = privatePostMarketMoneyOrders = Entry('{market}/money/orders', 'private', 'POST', {})
    private_post_market_money_orders_history = privatePostMarketMoneyOrdersHistory = Entry('{market}/money/orders/history', 'private', 'POST', {})
    private_post_market_money_trades_fetch = privatePostMarketMoneyTradesFetch = Entry('{market}/money/trades/fetch', 'private', 'POST', {})
    private_post_genmkt_money_info = privatePostGENMKTMoneyInfo = Entry('GENMKT/money/info', 'private', 'POST', {})
    private_post_genmkt_money_deposit_address = privatePostGENMKTMoneyDepositAddress = Entry('GENMKT/money/deposit_address', 'private', 'POST', {})
    private_post_genmkt_money_new_deposit_address = privatePostGENMKTMoneyNewDepositAddress = Entry('GENMKT/money/new_deposit_address', 'private', 'POST', {})
    private_post_genmkt_money_wallet_history = privatePostGENMKTMoneyWalletHistory = Entry('GENMKT/money/wallet/history', 'private', 'POST', {})
    private_post_genmkt_money_withdraw = privatePostGENMKTMoneyWithdraw = Entry('GENMKT/money/withdraw', 'private', 'POST', {})
