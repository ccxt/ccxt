# -*- coding: utf-8 -*-

import argparse
import asyncio
import os
import sys
import json
import time

# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root)

# ------------------------------------------------------------------------------

import ccxt.async as ccxt

# ------------------------------------------------------------------------------

from os         import _exit
from traceback  import format_tb

# ------------------------------------------------------------------------------

class Argv (object):
    pass


argv = Argv()

parser = argparse.ArgumentParser()
parser.add_argument('--verbose', action='store_true', help='enable verbose output')
parser.add_argument('--nonce', type=int, help='integer')
parser.add_argument('exchange', type=str, help='exchange id in lowercase', nargs='?')
parser.add_argument('symbol', type=str, help='symbol in uppercase', nargs='?')
parser.parse_args(namespace=argv)

exchanges = {}

# ------------------------------------------------------------------------------
# string coloring functions

def style(s, style): return str(s)  # style + str (s) + '\033[0m'
def green(s): return style(s, '\033[92m')
def blue(s): return style(s, '\033[94m')
def yellow(s): return style(s, '\033[93m')
def red(s): return style(s, '\033[91m')
def pink(s): return style(s, '\033[95m')
def bold(s): return style(s, '\033[1m')
def underline(s): return style(s, '\033[4m')

# print a colored string
def dump(*args):
    print(' '.join([str(arg) for arg in args]))

# print a n error string
def dump_error(*args):
    string = ' '.join([str(arg) for arg in args])
    print(string)
    sys.stderr.write(string + "\n")

# ------------------------------------------------------------------------------

def handle_all_unhandled_exceptions(type, value, traceback):

    dump_error(yellow(type, value, '\n\n' + '\n'.join(format_tb(traceback))))
    _exit(1) # unrecoverable crash

sys.excepthook = handle_all_unhandled_exceptions

# ------------------------------------------------------------------------------

async def test_exchange_symbol_orderbook(exchange, symbol):
    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    dump(green(exchange.id), green(symbol), 'fetching order book...')
    orderbook = await exchange.fetch_order_book(symbol)
    dump(
        green(exchange.id),
        green(symbol),
        'order book',
        orderbook['datetime'],
        'bid: ' +       str(orderbook['bids'][0][0] if len(orderbook['bids']) else 'N/A'),
        'bidVolume: ' + str(orderbook['bids'][0][1] if len(orderbook['bids']) else 'N/A'),
        'ask: ' +       str(orderbook['asks'][0][0] if len(orderbook['asks']) else 'N/A'),
        'askVolume: ' + str(orderbook['asks'][0][1] if len(orderbook['asks']) else 'N/A'))

# ------------------------------------------------------------------------------

async def test_exchange_symbol_ohlcv(exchange, symbol):
    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    if exchange.hasFetchOHLCV:
        ohlcvs = await exchange.fetch_ohlcv(symbol)
        dump(green(exchange.id), 'fetched', green(len(ohlcvs)), 'OHLCVs')
    else:
        dump(yellow(exchange.id), 'fetching OHLCV not supported')

# ------------------------------------------------------------------------------

async def test_exchange_all_tickers(exchange):
    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    dump(green(exchange.id), 'fetching all tickers at once...')
    if exchange.hasFetchTickers:
        tickers = await exchange.fetch_tickers()
        dump(green(exchange.id), 'fetched', green(len(list(tickers.keys()))), 'tickers')
    else:
        dump(yellow(exchange.id), 'fetching all tickers at once not supported')

# ------------------------------------------------------------------------------

async def test_exchange_symbol_ticker(exchange, symbol):
    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    dump(green(exchange.id), green(symbol), 'fetching ticker...')
    ticker = await exchange.fetch_ticker(symbol)
    dump(
        green(exchange.id),
        green(symbol),
        'ticker',
        ticker['datetime'],
        'high: ' +   str(ticker['high']),
        'low: ' +    str(ticker['low']),
        'bid: ' +    str(ticker['bid']),
        'ask: ' +    str(ticker['ask']),
        'volume: ' + str(ticker['quoteVolume']))

# ------------------------------------------------------------------------------

async def test_exchange_symbol_trades(exchange, symbol):

    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    dump(green(exchange.id), green(symbol), 'fetching trades...')
    try:
        trades = await exchange.fetch_trades(symbol)
        dump(green(exchange.id), green(symbol), 'fetched', green(len(list(trades))), 'trades')
    except ccxt.ExchangeError as e:
        dump_error(yellow('[' + type(e).__name__ + ']'), e.args)
    except ccxt.NotSupported as e:
        dump_error(yellow('[' + type(e).__name__ + ']'), e.args)

# ------------------------------------------------------------------------------

async def test_exchange_symbol(exchange, symbol):
    dump(green('SYMBOL: ' + symbol))
    await test_exchange_symbol_ticker(exchange, symbol)

    if exchange.id == 'coinmarketcap':
        dump(green(await exchange.fetchGlobal()))
    else:
        await test_exchange_symbol_orderbook(exchange, symbol)
        await test_exchange_symbol_trades(exchange, symbol)

    await test_exchange_all_tickers(exchange)
    await test_exchange_symbol_ohlcv(exchange, symbol)

# ------------------------------------------------------------------------------

async def load_exchange(exchange):
    await exchange.load_markets()

async def test_exchange(exchange):

    dump(green('EXCHANGE: ' + exchange.id))
    # delay = 2
    keys = list(exchange.markets.keys())

    # ..........................................................................
    # public API

    symbol = keys[0]
    symbols = [
        'BTC/USD',
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

    if symbol.find('.d') < 0:
        await test_exchange_symbol(exchange, symbol)

    # ..........................................................................
    # private API

    if (not hasattr(exchange, 'apiKey') or (len(exchange.apiKey) < 1)):
        return

    dump(green(exchange.id), 'fetching balance...')
    balance = await exchange.fetch_balance()
    dump(green(exchange.id), 'fetched balance')

    if exchange.hasFetchOrders:
        try:
            dump(green(exchange.id), 'fetching orders...')
            orders = await exchange.fetch_orders()
            dump(green(exchange.id), 'fetched', green(str(len(orders))), 'orders')
        except (ccxt.ExchangeError, ccxt.NotSupported) as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), e.args)
        # except ccxt.NotSupported as e:
        #     dump(yellow(type(e).__name__), e.args)

    # time.sleep(delay)

    # amount = 1
    # price = 0.0161

    # marketBuy = exchange.create_market_buy_order(symbol, amount)
    # print(marketBuy)
    # time.sleep(delay)

    # marketSell = exchange.create_market_sell_order(symbol, amount)
    # print(marketSell)
    # time.sleep(delay)

    # limitBuy = exchange.create_limit_buy_order(symbol, amount, price)
    # print(limitBuy)
    # time.sleep(delay)

    # limitSell = exchange.create_limit_sell_order(symbol, amount, price)
    # print(limitSell)
    # time.sleep(delay)

# ------------------------------------------------------------------------------

async def try_all_proxies(exchange, proxies):
    current_proxy = 0
    max_retries = len(proxies)
    # a special case for ccex
    if exchange.id == 'ccex':
        current_proxy = 1
    for num_retries in range(0, max_retries):
        try:
            exchange.proxy = proxies[current_proxy]
            current_proxy = (current_proxy + 1) % len(proxies)
            await load_exchange(exchange)
            await test_exchange(exchange)
            break
        except ccxt.RequestTimeout as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), str(e))
        except ccxt.NotSupported as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), e.args)
        except ccxt.DDoSProtection as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), e.args)
        except ccxt.ExchangeNotAvailable as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), e.args)
        except ccxt.AuthenticationError as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), str(e))
        except ccxt.ExchangeError as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), e.args)

# ------------------------------------------------------------------------------

proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/',
    'https://crossorigin.me/',
    # 'http://cors-proxy.htmldriven.com/?url=', # we don't want this for now
]

# load the api keys from config
with open('./keys.json') as file:
    config = json.load(file)

# instantiate all exchanges
for id in ccxt.exchanges:
    exchange = getattr(ccxt, id)
    exchanges[id] = exchange({'verbose': argv.verbose})

# set up api keys appropriately
tuples = list(ccxt.Exchange.keysort(config).items())
for (id, params) in tuples:
    if id in exchanges:
        options = list(params.items())
        for key in params:
            setattr(exchanges[id], key, params[key])

# move gdax to sandbox
exchanges['gdax'].urls['api'] = 'https://api-public.sandbox.gdax.com'

# ------------------------------------------------------------------------------

async def main():

    if argv.exchange:

        exchange = exchanges[argv.exchange]
        symbol = argv.symbol

        if symbol:
            await load_exchange(exchange)
            await test_exchange_symbol(exchange, symbol)
        else:
            await try_all_proxies(exchange, proxies)

    else:

        tuples = list(ccxt.Exchange.keysort(exchanges).items())
        for (id, params) in tuples:
            if id in exchanges:
                exchange = exchanges[id]
                await try_all_proxies(exchange, proxies)

# ------------------------------------------------------------------------------

asyncio.get_event_loop().run_until_complete(main())
