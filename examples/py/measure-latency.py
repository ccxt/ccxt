# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


def print_supported_exchanges():
    print('Supported exchanges:')
    print(ccxt.exchanges)


def print_usage():
    print('Usage: python ', sys.argv[0], 'id', 'num_orders', 'symbol', 'side', 'amount', 'price')
    print_supported_exchanges()

def main():
    try:
        id = sys.argv[1]  # get exchange id from command line arguments
        # check if the exchange is supported by ccxt
        if id in ccxt.exchanges:
            print('Instantiating', id)
            # instantiate the exchange by id
            exchange = getattr(ccxt, id)({
                'apiKey': 'YOUR_API_KEY',
                'secret': 'YOUR_SECRET',
                # you have to disable the rate limiter to measure the real latency
                'enableRateLimit': False,
            })
            print('Loading', id, 'markets')
            # load all markets from the exchange
            markets = exchange.load_markets()
            print('Loaded', id, 'markets')
            num_orders = int(sys.argv[2])
            symbol = sys.argv[3]
            side = sys.argv[4]
            amount = float(sys.argv[5])
            price = float(sys.argv[6])
            if symbol in markets:
                print('Testing', symbol)
                results = []
                for i in range(0, num_orders):
                    timestamp = exchange.milliseconds()
                    order = exchange.create_order(symbol, 'limit', side, amount, price)
                    elapsed = exchange.milliseconds() - timestamp
                    canceled = exchange.cancel_order(order['id'], symbol)
                    results.append(elapsed)
                    print(elapsed, 'ms')
                sum = exchange.sum(*results)
                average = int(sum / len(results))
                print('Average:', average, 'ms')
        else:
            print('Exchange', id, ' not found')
            print_usage()
    except Exception as e:
        print(type(e).__name__, str(e))
        print_usage()

print('CCXT Version:', ccxt.__version__)
main()

