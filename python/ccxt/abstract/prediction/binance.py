from ccxt.base.types import Entry


class ImplicitAPI:
    sapi_private_get_category_list = sapiPrivateGetCategoryList = Entry('category/list', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_market_list = sapiPrivateGetMarketList = Entry('market/list', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_market_search = sapiPrivateGetMarketSearch = Entry('market/search', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_market_detail = sapiPrivateGetMarketDetail = Entry('market/detail', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_order_book = sapiPrivateGetOrderBook = Entry('order-book', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_order_book_last_trade_price = sapiPrivateGetOrderBookLastTradePrice = Entry('order-book/last-trade-price', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_wallet_list = sapiPrivateGetWalletList = Entry('wallet/list', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_balance_payment_options = sapiPrivateGetBalancePaymentOptions = Entry('balance/payment-options', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_quota_limit_status = sapiPrivateGetQuotaLimitStatus = Entry('quota/limit/status', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_pnl_portfolio = sapiPrivateGetPnlPortfolio = Entry('pnl/portfolio', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_pnl_query = sapiPrivateGetPnlQuery = Entry('pnl/query', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_position_list = sapiPrivateGetPositionList = Entry('position/list', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_position_filter = sapiPrivateGetPositionFilter = Entry('position/filter', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_position_token = sapiPrivateGetPositionToken = Entry('position/token', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_position_settled_history = sapiPrivateGetPositionSettledHistory = Entry('position/settled-history', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_order_list = sapiPrivateGetOrderList = Entry('order/list', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_get_order_history = sapiPrivateGetOrderHistory = Entry('order/history', ['sapi', 'private'], 'GET', {'cost': 200})
    sapi_private_post_trade_get_quote = sapiPrivatePostTradeGetQuote = Entry('trade/get-quote', ['sapi', 'private'], 'POST', {'cost': 200})
    sapi_private_post_trade_place_order_bundle = sapiPrivatePostTradePlaceOrderBundle = Entry('trade/place-order-bundle', ['sapi', 'private'], 'POST', {'cost': 200})
    sapi_private_post_trade_batch_cancel = sapiPrivatePostTradeBatchCancel = Entry('trade/batch-cancel', ['sapi', 'private'], 'POST', {'cost': 200})
