from json import dumps

import ccxt

proxies = [
    'http://127.0.0.1:1087/',
]

def main():

    exchange_id = 'coinbenespot'
    exchange_class = getattr(ccxt, exchange_id)
    exchange = exchange_class({
        'apiKey': '',
        'secret': '',
        'timeout': 30000,
        'enableRateLimit': True,
    })

    # result = exchange.fetch_market_list()
    # print(result)

    # result = exchange.fetch_market("BTC/USDT2")
    # print(dumps(result))

    # result = exchange.fetch_order_book("BTC/USDT", "5")
    # print(dumps(result))

    # result = exchange.fetch_ticker_list()
    # print(dumps(result))

    # result = exchange.fetch_ticker("BTC/USDT")
    # print(dumps(result))

    # result = exchange.fetch_trade_list('BTC/USDT')
    # print(dumps(result))

    # result = exchange.fetch_candles('BTC/USDT')
    # print(dumps(result))

    # result = exchange.fetch_rate_list()
    # print(dumps(result))

    # result = exchange.fetch_balance_list()
    # print(dumps(result))

    # result = exchange.fetch_balance('USDT')
    # print(dumps(result))

    # result = exchange.create_order('CFT/USDT', '2', '0.03', '1', '1')
    # print(dumps(result))

    # result = exchange.fetch_order('1991929671876759552')
    # print(dumps(result))

    # result = exchange.cancel_order("1991937591582564353")
    # print(dumps(result))

    # result = exchange.fetch_open_orders('CFT/USDT')
    # print(dumps(result))

    # result = exchange.fetch_order_fills('')
    # print(dumps(result))

    # params = {
    #     'symbol': 'CFT/USDT',
    #     'latestOrderId': '1991938314995232768',
    # }
    #
    # result = exchange.fetch_closed_orders(params=params)
    # print(dumps(result))


if __name__ == '__main__':
    main()