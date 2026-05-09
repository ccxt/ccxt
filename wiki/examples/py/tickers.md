- [Tickers](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
import time

import ccxt  # noqa: E402


def style(s, style):
    return style + s + '\033[0m'


def green(s):
    return style(s, '\033[92m')


def blue(s):
    return style(s, '\033[94m')


def yellow(s):
    return style(s, '\033[93m')


def red(s):
    return style(s, '\033[91m')


def pink(s):
    return style(s, '\033[95m')


def bold(s):
    return style(s, '\033[1m')


def underline(s):
    return style(s, '\033[4m')


def dump(*args):
    print(' '.join([str(arg) for arg in args]))


def print_exchanges():
    dump('Supported exchanges:', ', '.join(ccxt.exchanges))


def print_usage():
    dump("Usage: python " + sys.argv[0], green('id'), yellow('[symbol]'))
    dump("Symbol is optional, for example:")
    dump("python " + sys.argv[0], green('kraken'))
    dump("python " + sys.argv[0], green('coinbasepro'), yellow('BTC/USD'))
    print_exchanges()


def print_ticker(exchange, symbol):
    ticker = exchange.fetch_ticker(symbol.upper())
    print(ticker)
    dump(
        green(exchange.id),
        yellow(symbol),
        'ticker',
        ticker['datetime'],
        'high: ' + str(ticker['high']),
        'low: ' + str(ticker['low']),
        'bid: ' + str(ticker['bid']),
        'ask: ' + str(ticker['ask']),
        'volume: ' + str(ticker['quoteVolume']))


try:

    id = sys.argv[1]  # get exchange id from command line arguments

    # check if the exchange is supported by ccxt
    exchange_found = id in ccxt.exchanges

    if exchange_found:
        dump('Instantiating', green(id))

        # instantiate the exchange by id
        exchange = getattr(ccxt, id)()

        # load all markets from the exchange
        markets = exchange.load_markets()

        # output all symbols
        dump(green(id), 'has', len(exchange.symbols), 'symbols:', yellow(', '.join(exchange.symbols)))

        try:
            if len(sys.argv) > 2:  # if symbol is present, get that symbol only

                symbol = sys.argv[2]
                print_ticker(exchange, symbol)

            else:  # run through all symbols one by one

                delay = int(exchange.rateLimit / 1000)  # delay in between requests

                for symbol in exchange.symbols:

                    # suffix '.d' means 'darkpool' on some exchanges
                    if symbol.find('.d') < 0:

                        # sleep to remain under the rateLimit
                        time.sleep(delay)

                        # fetch and print ticker
                        print_ticker(exchange, symbol)

        except ccxt.DDoSProtection as e:
            print(type(e).__name__, e.args, 'DDoS Protection (ignoring)')
        except ccxt.RequestTimeout as e:
            print(type(e).__name__, e.args, 'Request Timeout (ignoring)')
        except ccxt.ExchangeNotAvailable as e:
            print(type(e).__name__, e.args, 'Exchange Not Available due to downtime or maintenance (ignoring)')
        except ccxt.AuthenticationError as e:
            print(type(e).__name__, e.args, 'Authentication Error (missing API keys, ignoring)')
    else:
        dump('Exchange ' + red(id) + ' not found')
        print_usage()

except Exception as e:

    print(type(e).__name__, e.args, str(e))
    print_usage()
 
```