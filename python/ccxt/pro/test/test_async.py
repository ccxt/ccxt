# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# import aiohttp
import argparse
import asyncio
import json
# import time
from traceback import format_tb
# from ccxt import NetworkError, RequestTimeout
from exchange.test_watch_order_book import test_watch_order_book
from exchange.test_watch_ticker import test_watch_ticker
from exchange.test_watch_trades import test_watch_trades
from exchange.test_watch_ohlcv import test_watch_ohlcv


import ccxt.pro  # noqa: F401
from ccxt.pro.base.exchange import Exchange  # noqa: F401
# from ccxtpro.base.future import Future  # noqa: F401


# ------------------------------------------------------------------------------

class Argv(object):
    verbose = False
    exchange_id = None
    pass


argv = Argv()

parser = argparse.ArgumentParser()
parser.add_argument('--verbose', action='store_true', help='enable verbose output')
parser.add_argument('exchange_id', type=str, help='exchange id in lowercase', nargs='?')

parser.parse_args(namespace=argv)

if not argv.exchange_id:
    print('Exchange id not specified')
    exit(1)
else:
    print('Testing', {'exchange': argv.exchange_id, 'symbol': None})


# ------------------------------------------------------------------------------

path = os.path.dirname(ccxt.__file__)
if 'site-packages' in os.path.dirname(ccxt.__file__):
    raise Exception('\n\nYou are running test.py against a globally-installed version of the library!\nIt was previously installed into your site-packages folder by pip or pip3.\n\nTo ensure testing against the local folder uninstall it first by running the following commands:\npip uninstall ccxtpro\npip3 uninstall ccxtpro\n\n')


# ------------------------------------------------------------------------------

verbose_log_filename = 'py.' + argv.exchange_id + '.log'
verbose_log_file = open(verbose_log_filename, 'w')


# ------------------------------------------------------------------------------

def handle_all_unhandled_exceptions(type, value, traceback):
    if verbose_log_file:
        verbose_log_file.close()
    sys.stderr.write('handle_all_unhandled_exceptions ' + type.__name__ + ' ' + str(value) + '\n\n' + '\n'.join(format_tb(traceback)) + "\n")
    sys.stderr.flush()
    exit(1)  # unrecoverable crash


sys.excepthook = handle_all_unhandled_exceptions

# -----------------------------------------------------------------------------

config = {}

# prefer local testing keys to global keys
keys_folder = os.path.dirname(root)
keys_global = os.path.join(keys_folder, 'keys.json')
keys_local = os.path.join(keys_folder, 'keys.local.json')
keys_file = keys_local if os.path.exists(keys_local) else keys_global


# load the api keys from config
if os.path.exists(keys_file):
    with open(keys_file) as file:
        config = json.load(file)


# -----------------------------------------------------------------------------

async def test_public(exchange, symbol):
    print(exchange.id, symbol, 'test_public')
    await test_watch_order_book(exchange, symbol)
    await test_watch_ticker(exchange, symbol)
    await test_watch_trades(exchange, symbol)
    await test_watch_ohlcv(exchange, symbol)
    # await test_watch_tickers(exchange, symbol)


async def test_private(exchange, symbol, code):
    print(exchange.id, symbol, 'test_private')
    # if (not hasattr(exchange, 'apiKey') or (len(exchange.apiKey) < 1)):
    #     return
    # # move to testnet/sandbox if possible before accessing the balance if possible
    # # if 'test' in exchange.urls:
    # #     exchange.urls['api'] = exchange.urls['test']
    # await exchange.fetch_balance()
    # print(green(exchange.id), 'fetched balance')
    # await asyncio.sleep(exchange.rateLimit / 1000)
    # if exchange.has['fetchOrders']:
    #     try:
    #         orders = await exchange.fetch_orders(symbol)
    #         print(green(exchange.id), 'fetched', green(str(len(orders))), 'orders')
    #     except (ccxt.ExchangeError, ccxt.NotSupported) as e:
    #         dump_error(yellow('[' + type(e).__name__ + ']'), e.args)
    #     # except ccxt.NotSupported as e:
    #     #     print(yellow(type(e).__name__), e.args)


# -----------------------------------------------------------------------------

def get_test_symbol(exchange, symbols):
    symbol = None
    for s in symbols:
        market = exchange.safe_value(exchange.markets, s)
        if market is not None:
            active = exchange.safe_value(market, 'active')
            if active or (active is None):
                symbol = s
                break
    return symbol


async def test_exchange(exchange):
    print(exchange.id)
    # delay = 2

    codes = [
        'BTC',
        'ETH',
        'XRP',
        'LTC',
        'BCH',
        'EOS',
        'BNB',
        'BSV',
        'USDT',
        'ATOM',
        'BAT',
        'BTG',
        'DASH',
        'DOGE',
        'ETC',
        'IOTA',
        'LSK',
        'MKR',
        'NEO',
        'PAX',
        'QTUM',
        'TRX',
        'TUSD',
        'USD',
        'USDC',
        'WAVES',
        'XEM',
        'XMR',
        'ZEC',
        'ZRX',
    ]

    code = codes[0]
    for i in range(0, len(codes)):
        if codes[i] in exchange.currencies:
            code = codes[i]

    symbol = get_test_symbol(exchange, [
        'BTC/USD',
        'BTC/USDT',
        'BTC/CNY',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'ETH/USDT',
        'BTC/JPY',
        'LTC/BTC',
        'USD/SLL',
    ])

    if symbol is None:
        for code in codes:
            markets = list(exchange.markets.values())
            activeMarkets = [market for market in markets if market['base'] == code]
            if len(activeMarkets):
                activeSymbols = [market['symbol'] for market in activeMarkets]
                symbol = get_test_symbol(exchange, activeSymbols)
                break

    if symbol is None:
        markets = list(exchange.markets.values())
        activeMarkets = [market for market in markets if market['base'] in codes]
        activeSymbols = [market['symbol'] for market in activeMarkets]
        symbol = get_test_symbol(exchange, activeSymbols)

    if symbol is None:
        markets = list(exchange.markets.values())
        activeMarkets = [market for market in markets if not exchange.safe_value(market, 'active', False)]
        activeSymbols = [market['symbol'] for market in activeMarkets]
        symbol = get_test_symbol(exchange, activeSymbols)

    if symbol is None:
        symbol = get_test_symbol(exchange, exchange.symbols)

    if symbol is None:
        symbol = exchange.symbols[0]

    if symbol.find('.d') < 0:
        await test_public(exchange, symbol)
        await test_private(exchange, symbol, code)


def print_to_file(self, *args):
    print(*args, file=verbose_log_file)


# -----------------------------------------------------------------------------

async def test():

    apiKeys = config.get(argv.exchange_id, {})
    exchange = getattr(ccxt.pro, argv.exchange_id)(Exchange.deep_extend({
        'enableRateLimit': True,
    }, apiKeys))

    if (hasattr(exchange, 'skip') and exchange.skip) or (hasattr(exchange, 'skipWs') and exchange.skipWs):
        sys.stdout.write(exchange.id + ' [Skipped]\n')
        sys.stdout.flush()
    elif (hasattr(exchange, 'alias') and exchange.alias):
        sys.stdout.write(exchange.id + ' [Skipped alias]\n')
        sys.stdout.flush()
    else:

        # add http proxy if any
        if hasattr(exchange, 'httpProxy'):
            exchange.aiohttp_proxy = exchange.httpProxy

        print(exchange.id, argv.verbose)
        await exchange.load_markets()
        exchange.verbose = argv.verbose
        # exchange.print = print_to_file
        await test_exchange(exchange)
    await exchange.close()


# -----------------------------------------------------------------------------

if __name__ == '__main__':
    asyncio.run(test())
    print('Done.')
