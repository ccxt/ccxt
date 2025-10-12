- [Arbitrage Pairs](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys

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
    dump("Usage: python " + sys.argv[0], green('id1'), yellow('id2'), blue('id3'), '...')


proxies = [
    '',  # no proxy by default
    'https://crossorigin.me/',
    'https://cors-anywhere.herokuapp.com/',
]

if len(sys.argv) > 2:
    ids = list(sys.argv[1:])
    exchanges = {}
    dump(ids)
    dump(yellow(' '.join(ids)))
    for id in ids:  # load all markets from all exchange exchanges

        # instantiate the exchange by id
        exchange = getattr(ccxt, id)()

        # save it in a dictionary under its id for future use
        exchanges[id] = exchange

        # load all markets from the exchange
        markets = exchange.load_markets()

        # basic round-robin proxy scheduler
        currentProxy = -1
        maxRetries = len(proxies)

        for numRetries in range(0, maxRetries):

            # try proxies in round-robin fashion
            currentProxy = (currentProxy + 1) % len(proxies)

            try:  # try to load exchange markets using current proxy

                exchange.proxy = proxies[currentProxy]
                exchange.load_markets()

            except ccxt.DDoSProtection as e:
                dump(yellow(type(e).__name__), e.args)
            except ccxt.RequestTimeout as e:
                dump(yellow(type(e).__name__), e.args)
            except ccxt.AuthenticationError as e:
                dump(yellow(type(e).__name__), e.args)
            except ccxt.ExchangeNotAvailable as e:
                dump(yellow(type(e).__name__), e.args)
            except ccxt.ExchangeError as e:
                dump(yellow(type(e).__name__), e.args)
            except ccxt.NetworkError as e:
                dump(yellow(type(e).__name__), e.args)
            except Exception as e:  # reraise all other exceptions
                raise

        dump(green(id), 'loaded', green(str(len(exchange.symbols))), 'markets')

    dump(green('Loaded all markets'))

    allSymbols = [symbol for id in ids for symbol in exchanges[id].symbols]

    # get all unique symbols
    uniqueSymbols = list(set(allSymbols))

    # filter out symbols that are not present on at least two exchanges
    arbitrableSymbols = sorted([symbol for symbol in uniqueSymbols if allSymbols.count(symbol) > 1])

    # print a table of arbitrable symbols
    table = []
    dump(green(' symbol          | ' + ''.join([' {:<15} | '.format(id) for id in ids])))
    dump(green(''.join(['-----------------+-' for x in range(0, len(ids) + 1)])))

    for symbol in arbitrableSymbols:
        string = ' {:<15} | '.format(symbol)
        row = {}
        for id in ids:
            # if a symbol is present on a exchange print that exchange's id in the row
            string += ' {:<15} | '.format(id if symbol in exchanges[id].symbols else '')
        dump(string)

else:
    print_usage()
 
```