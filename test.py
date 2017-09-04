# -*- coding: utf-8 -*-

import ccxt
import time
import json

import argparse


class Argv (object):
    pass


argv = Argv()

parser = argparse.ArgumentParser()
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

# ------------------------------------------------------------------------------

def test_exchange_symbol_orderbook(exchange, symbol):
    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    dump(green(exchange.id), green(symbol), 'fetching order book...')
    orderbook = exchange.fetch_order_book(symbol)
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

def test_exchange_symbol_ohlcv(exchange, symbol):
    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    if exchange.hasFetchOHLCV:
        ohlcvs = exchange.fetch_ohlcv(symbol)
        dump(green(exchange.id), 'fetched', green(len(ohlcvs)), 'OHLCVs')
    else:
        dump(yellow(exchange.id), 'fetching OHLCV not supported')

# ------------------------------------------------------------------------------

def test_exchange_all_tickers(exchange):
    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    dump(green(exchange.id), 'fetching all tickers at once...')
    if exchange.hasFetchTickers:
        tickers = exchange.fetch_tickers()
        dump(green(exchange.id), 'fetched', green(len(list(tickers.keys()))), 'tickers')
    else:
        dump(yellow(exchange.id), 'fetching all tickers at once not supported')

# ------------------------------------------------------------------------------

def test_exchange_symbol_ticker(exchange, symbol):
    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    dump(green(exchange.id), green(symbol), 'fetching ticker...')
    ticker = exchange.fetch_ticker(symbol)
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

def test_exchange_symbol_trades(exchange, symbol):

    delay = int(exchange.rateLimit / 1000)
    time.sleep(delay)
    dump(green(exchange.id), green(symbol), 'fetching trades...')
    try:
        trades = exchange.fetch_trades(symbol)
        dump(green(exchange.id), green(symbol), 'fetched', green(len(list(trades))), 'trades')
    except ccxt.ExchangeError as e:
        dump(yellow(type(e).__name__), e.args)
    except ccxt.NotSupported as e:
        dump(yellow(type(e).__name__), e.args)

# ------------------------------------------------------------------------------

def test_exchange_symbol(exchange, symbol):
    dump(green('SYMBOL: ' + symbol))
    test_exchange_symbol_ticker(exchange, symbol)

    if exchange.id == 'coinmarketcap':
        dump(green(exchange.fetchGlobal()))
    else:
        test_exchange_symbol_orderbook(exchange, symbol)
        test_exchange_symbol_trades(exchange, symbol)

    test_exchange_all_tickers(exchange)
    test_exchange_symbol_ohlcv(exchange, symbol)

# ------------------------------------------------------------------------------

def load_exchange(exchange):
    exchange.load_markets()

def test_exchange(exchange):

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
        test_exchange_symbol(exchange, symbol)

    # ..........................................................................
    # private API

    if (not hasattr(exchange, 'apiKey') or (len(exchange.apiKey) < 1)):
        return

    dump(green(exchange.id), 'fetching balance...')
    balance = exchange.fetch_balance()
    dump(green(exchange.id), 'balance', balance)
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

def try_all_proxies(exchange, proxies):
    current_proxy = 0
    max_retries = len(proxies)
    # a special case for ccex
    if exchange.id == 'ccex':
        current_proxy = 1
    for num_retries in range(0, max_retries):
        try:
            exchange.proxy = proxies[current_proxy]
            current_proxy = (current_proxy + 1) % len(proxies)
            load_exchange(exchange)
            test_exchange(exchange)
            break
        except ccxt.RequestTimeout as e:
            dump(yellow(type(e).__name__), str(e))
        except ccxt.NotSupported as e:
            dump(yellow(type(e).__name__), e.args)
        except ccxt.DDoSProtection as e:
            dump(yellow(type(e).__name__), e.args)
        except ccxt.ExchangeNotAvailable as e:
            dump(yellow(type(e).__name__), e.args)
        except ccxt.AuthenticationError as e:
            dump(yellow(type(e).__name__), str(e))
        except ccxt.ExchangeError as e:
            dump(yellow(type(e).__name__), e.args)

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
    exchanges[id] = exchange({'verbose': False})

# set up api keys appropriately
tuples = list(ccxt.Exchange.keysort(config).items())
for (id, params) in tuples:
    options = list(params.items())
    for key in params:
        setattr(exchanges[id], key, params[key])

# move gdax to sandbox
exchanges['gdax'].urls['api'] = 'https://api-public.sandbox.gdax.com'

# ------------------------------------------------------------------------------

if argv.exchange:

    exchange = exchanges[argv.exchange]
    symbol = argv.symbol

    if symbol:
        load_exchange(exchange)
        test_exchange_symbol(exchange, symbol)
    else:
        try_all_proxies(exchange, proxies)

else:

    tuples = list(ccxt.Exchange.keysort(exchanges).items())
    for (id, params) in tuples:
        exchange = exchanges[id]
        try_all_proxies(exchange, proxies)
