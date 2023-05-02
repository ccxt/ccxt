from ccxt.base.types import Entry


class ImplicitAPI:
    public_get_oapi_v2_list_tradeprice = publicGetOapiV2ListTradePrice = Entry('oapi/v2/list/tradePrice', 'public', 'GET', {})
    public_get_oapi_v2_list_marketpair = publicGetOapiV2ListMarketPair = Entry('oapi/v2/list/marketPair', 'public', 'GET', {})
    public_get_open_v2_public_getorderbook = publicGetOpenV2PublicGetOrderBook = Entry('open/v2/public/getOrderBook', 'public', 'GET', {})
    private_post_v2_coin_customeraccount = privatePostV2CoinCustomerAccount = Entry('v2/coin/customerAccount', 'private', 'POST', {})
    private_post_v2_kline_getkline = privatePostV2KlineGetKline = Entry('v2/kline/getKline', 'private', 'POST', {})
    private_post_v2_order_order = privatePostV2OrderOrder = Entry('v2/order/order', 'private', 'POST', {})
    private_post_v2_order_cancel = privatePostV2OrderCancel = Entry('v2/order/cancel', 'private', 'POST', {})
    private_post_v2_order_getorderlist = privatePostV2OrderGetOrderList = Entry('v2/order/getOrderList', 'private', 'POST', {})
    private_post_v2_order_showorderstatus = privatePostV2OrderShowOrderStatus = Entry('v2/order/showOrderStatus', 'private', 'POST', {})
    private_post_v2_order_showorderhistory = privatePostV2OrderShowOrderHistory = Entry('v2/order/showOrderHistory', 'private', 'POST', {})
    private_post_v2_order_gettradelist = privatePostV2OrderGetTradeList = Entry('v2/order/getTradeList', 'private', 'POST', {})
