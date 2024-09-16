from ccxt.base.types import Entry

class ImplicitAPI:
    # Define private endpoints related to user actions
    private_post_v2_order_order = Entry('v2/order/order', 'private', 'POST', {})
    private_post_v2_order_cancel = Entry('v2/order/cancel', 'private', 'POST', {})
    private_post_v2_order_getorderlist = Entry('v2/order/getOrderList', 'private', 'POST', {})
    private_post_v2_order_showorderstatus = Entry('v2/order/showOrderStatus', 'private', 'POST', {})
    private_post_v2_order_showorderhistory = Entry('v2/order/showOrderHistory', 'private', 'POST', {})
    private_post_v2_order_gettradelist = Entry('v2/order/getTradeList', 'private', 'POST', {})
    private_post_v2_coin_customeraccount = Entry('v2/coin/customerAccount', 'private', 'POST', {})
    private_post_v2_kline_getkline = Entry('v2/kline/getKline', 'private', 'POST', {})

def cube_api_definitions():
    return {
        'id': 'cube',
        'name': 'Cube Exchange',
        'countries': ['US'],
        'rateLimit': 1000,
        'has': {
            'fetchMarkets': True,
            'fetchTicker': True,
            'fetchOrderBook': True,
            'fetchBalance': True,
            'createOrder': True,
            'cancelOrder': True,
        },
        'urls': {
            'api': {
                'public': 'https://api.cube.exchange/md/v0',
                'private': 'https://api.cube.exchange/v0',
            },
            'www': 'https://www.cube.exchange',
            'doc': 'https://docs.cube.exchange',
        },
        'api': {
            'public': {
                'get': [
                    'tickers/snapshot',
                    'parsed/tickers',
                    'parsed/book/{market_symbol}/snapshot',
                    'parsed/book/{market_symbol}/recent-trades',
                ],
            },
            'private': {
                'get': [
                    'users/check',
                    'users/subaccounts',
                    'users/subaccount/{subaccount_id}',
                    'users/subaccount/{subaccount_id}/positions',
                    'users/subaccount/{subaccount_id}/orders',
                ],
                'post': [
                    'users/apikeys',
                    'users/subaccounts',
                    'users/withdraw',
                ],
                'delete': [
                    'users/apikeys/{api_key}',
                ],
            },
        },
    }
