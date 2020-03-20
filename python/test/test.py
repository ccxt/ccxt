# -*- coding: utf-8 -*-

# import aiohttp
import argparse
import asyncio
import json
import os
import sys
# import time
from os import _exit
from traceback import format_tb
# from ccxt import NetworkError, RequestTimeout
from exchange.test_watch_order_book import test_watch_order_book
from exchange.test_watch_ticker import test_watch_ticker
from exchange.test_watch_trades import test_watch_trades
from exchange.test_watch_ohlcv import test_watch_ohlcv

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root)

import ccxtpro  # noqa: F401
from ccxtpro.base.exchange import Exchange  # noqa: F401
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
    _exit(1)
else:
    print('Testing', {'exchange': argv.exchange_id, 'symbol': None})


# ------------------------------------------------------------------------------

path = os.path.dirname(ccxtpro.__file__)
if 'site-packages' in os.path.dirname(ccxtpro.__file__):
    raise Exception('\n\nYou are running test.py against a globally-installed version of the library!\nIt was previously installed into your site-packages folder by pip or pip3.\n\nTo ensure testing against the local folder uninstall it first by running the following commands:\npip uninstall ccxtpro\npip3 uninstall ccxtpro\n\n')


# ------------------------------------------------------------------------------

def handle_all_unhandled_exceptions(type, value, traceback):
    sys.stderr.write('handle_all_unhandled_exceptions ' + type.__name__ + ' ' + str(value) + '\n\n' + '\n'.join(format_tb(traceback)) + "\n")
    sys.stderr.flush()
    _exit(1)  # unrecoverable crash


sys.excepthook = handle_all_unhandled_exceptions

# -----------------------------------------------------------------------------

config = {}

# prefer local testing keys to global keys
keys_folder = os.path.dirname(root)
keys_global = os.path.join(keys_folder, 'keys.json')
keys_local = os.path.join(keys_folder, 'keys.local.json')
keys_file = keys_local if os.path.exists(keys_local) else keys_global

# load the api keys from config
if os.path.exists(keys_local):
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

async def test_exchange(exchange):
    print(exchange.id)
    # delay = 2
    keys = list(exchange.markets.keys())
    symbol = keys[0]
    symbols = [
        'BTC/KRW',
        'BTC/USD',
        'BTC/USDT',
        'BTC/CNY',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
        'USD/SLL',
    ]
    for s in symbols:
        if s in keys:
            symbol = s
            break
    code = 'ETH'
    if symbol.find('.d') < 0:
        await test_public(exchange, symbol)
        await test_private(exchange, symbol, code)


# -----------------------------------------------------------------------------

async def test():
    apiKeys = config.get(argv.exchange_id, {})
    exchange = getattr(ccxtpro, argv.exchange_id)(Exchange.deep_extend({
        'enableRateLimit': True,
    }, apiKeys))

    if hasattr(exchange, 'skip') and exchange.skip:
        sys.stdout.write(exchange.id + ' [Skipped]\n')
        sys.stdout.flush()
    else:
        print(exchange.id, argv.verbose)
        await exchange.load_markets()
        exchange.verbose = argv.verbose
        await test_exchange(exchange)
    await exchange.close()


# -----------------------------------------------------------------------------

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(test())
    print('Done.')


# ------------------------------------------------------------------------------
# async def test_ticker(exchange, symbol):
#     ignored_exchanges = [
#         'digifinex',  # requires apiKey to call v2 tickers
#     ]
#     if exchange.id in ignored_exchanges:
#         return
#     if exchange.has['fetchTicker']:
#         delay = int(exchange.rateLimit / 1000)
#         await asyncio.sleep(delay)
#         ticker = await exchange.fetch_ticker(symbol)
#         print(
#             green(exchange.id),
#             green(symbol),
#             'ticker',
#             ticker['datetime'],
#             'high: ' + str(ticker['high']),
#             'low: ' + str(ticker['low']),
#             'bid: ' + str(ticker['bid']),
#             'ask: ' + str(ticker['ask']),
#             'volume: ' + str(ticker['quoteVolume']))
#     else:
#         print(green(exchange.id), green(symbol), 'fetch_ticker() not supported')
# ------------------------------------------------------------------------------
# async def test_trades(exchange, symbol):
#     if exchange.has['fetchTrades']:
#         delay = int(exchange.rateLimit / 1000)
#         await asyncio.sleep(delay)
#         # print(green(exchange.id), green(symbol), 'fetching trades...')
#         trades = await exchange.fetch_trades(symbol)
#         print(green(exchange.id), green(symbol), 'fetched', green(len(list(trades))), 'trades')
#     else:
#         print(green(exchange.id), green(symbol), 'fetch_trades() not supported')
# ------------------------------------------------------------------------------
# async def try_all_proxies(exchange, proxies=['']):
#     current_proxy = 0
#     max_retries = len(proxies)
#     # a special case for ccex
#     if exchange.id == 'ccex' and max_retries > 1:
#         current_proxy = 1
#     if exchange.proxy in proxies:
#         current_proxy = proxies.index(exchange.proxy)
#     for num_retries in range(0, max_retries):
#         try:
#             exchange.proxy = proxies[current_proxy]
#             print(green(exchange.id), 'using proxy', '`' + exchange.proxy + '`')
#             current_proxy = (current_proxy + 1) % len(proxies)
#             await load_exchange(exchange)
#             await test_exchange(exchange)
#         except (ccxt.RequestTimeout, ccxt.AuthenticationError, ccxt.NotSupported, ccxt.DDoSProtection, ccxt.ExchangeNotAvailable, ccxt.ExchangeError) as e:
#             print({'type': type(e).__name__, 'num_retries': num_retries, 'max_retries': max_retries}, str(e)[0:200])
#             if (num_retries + 1) == max_retries:
#                 dump_error(yellow('[' + type(e).__name__ + ']'), str(e)[0:200])
#         else:
#             # no exception
#             return True
#     # exception
#     return False
# ------------------------------------------------------------------------------
# # prefer local testing keys to global keys
# keys_folder = os.path.dirname(root)
# keys_global = os.path.join(keys_folder, 'keys.json')
# keys_local = os.path.join(keys_folder, 'keys.local.json')
# keys_file = keys_local if os.path.exists(keys_local) else keys_global
# # load the api keys from config
# with open(keys_file) as file:
#     config = json.load(file)
# # instantiate all exchanges
# for id in ccxt.exchanges:
#     if id == 'theocean' or id == 'theocean1':
#         continue
#     exchange = getattr(ccxt, id)
#     exchange_config = {'verbose': argv.verbose}
#     if sys.version_info[0] < 3:
#         exchange_config.update({'enableRateLimit': True})
#     if id in config:
#         exchange_config = ccxt.Exchange.deep_extend(exchange_config, config[id])
#     exchanges[id] = exchange(exchange_config)
# ------------------------------------------------------------------------------
# async def main():
#     if argv.exchange:
#         if argv.exchange != 'theocean' and argv.exchange != 'theocean1':
#             exchange = exchanges[argv.exchange]
#             symbol = argv.symbol
#             if hasattr(exchange, 'skip') and exchange.skip:
#                 print(green(exchange.id), 'skipped')
#             else:
#                 if symbol:
#                     await load_exchange(exchange)
#                     await test_symbol(exchange, symbol)
#                 else:
#                     await try_all_proxies(exchange, proxies)
#     else:
#         for exchange in sorted(exchanges.values(), key=lambda x: x.id):
#             if hasattr(exchange, 'skip') and exchange.skip:
#                 print(green(exchange.id), 'skipped')
#             else:
#                 await try_all_proxies(exchange, proxies)
# ------------------------------------------------------------------------------
# print('The private test is a work in progress, come back later.')
# sys.exit()

# while True:
#     try:
#         # this is a dirty wip
#         # -----------------------------------------------------------------
#         # balance
#         response = await exchange.watch_balance()
#         pprint(response)
#         sys.exit()
#         # -----------------------------------------------------------------
#         # orderbook
#         response = await exchange.watch_order_book(symbol)
#         print(Exchange.iso8601(Exchange.milliseconds()), len(response['asks']), 'asks', response['asks'][0], len(response['bids']), 'bids', response['bids'][0])
#     except Exception as e:
#         print('Error', e)
#         await asyncio.sleep(1)
#         raise e
