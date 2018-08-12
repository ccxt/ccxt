# -*- coding: utf-8 -*-

import argparse
import asyncio
import json
# import logging
import os
import sys
import time  # noqa: F401
from os import _exit
from traceback import format_tb

# ------------------------------------------------------------------------------
# logging.basicConfig(level=logging.INFO)
# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root)

# ------------------------------------------------------------------------------

import ccxt.async_support as ccxt  # noqa: E402

# ------------------------------------------------------------------------------


class Argv(object):
    token_bucket = False
    verbose = False
    nonce = None
    exchange = None
    symbol = None
    pass


argv = Argv()

parser = argparse.ArgumentParser()
parser.add_argument('--token_bucket', action='store_true', help='enable token bucket experimental test')
parser.add_argument('--verbose', action='store_true', help='enable verbose output')
parser.add_argument('--nonce', type=int, help='integer')
parser.add_argument('exchange', type=str, help='exchange id in lowercase', nargs='?')
parser.add_argument('symbol', type=str, help='symbol in uppercase', nargs='?')

parser.parse_args(namespace=argv)

exchanges = {}

# ------------------------------------------------------------------------------

path = os.path.dirname(ccxt.__file__)
if 'site-packages' in os.path.dirname(ccxt.__file__):
    raise Exception('\n\nYou are running test_async.py/test.py against a globally-installed version of the library!\nIt was previously installed into your site-packages folder by pip or pip3.\n\nTo ensure testing against the local folder uninstall it first by running the following commands:\npip uninstall ccxt\npip3 uninstall ccxt\n\n')

# ------------------------------------------------------------------------------
# string coloring functions


def style(s, style):
    return str(s)  # style + str (s) + '\033[0m'


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


# print a colored string
def dump(*args):
    print(' '.join([str(arg) for arg in args]))


# print an error string
def dump_error(*args):
    string = ' '.join([str(arg) for arg in args])
    print(string)
    sys.stderr.write(string + "\n")


# ------------------------------------------------------------------------------


def handle_all_unhandled_exceptions(type, value, traceback):
    dump_error(yellow(type), yellow(value), '\n\n' + yellow('\n'.join(format_tb(traceback))))
    _exit(1)  # unrecoverable crash


sys.excepthook = handle_all_unhandled_exceptions

# ------------------------------------------------------------------------------


async def test_order_book(exchange, symbol):
    if exchange.has['fetchOrderBook']:
        delay = int(exchange.rateLimit / 1000)
        await asyncio.sleep(delay)
        # dump(green(exchange.id), green(symbol), 'fetching order book...')
        orderbook = await exchange.fetch_order_book(symbol)
        dump(
            green(exchange.id),
            green(symbol),
            'order book',
            orderbook['datetime'],
            'bid: ' + str(orderbook['bids'][0][0] if len(orderbook['bids']) else 'N/A'),
            'bidVolume: ' + str(orderbook['bids'][0][1] if len(orderbook['bids']) else 'N/A'),
            'ask: ' + str(orderbook['asks'][0][0] if len(orderbook['asks']) else 'N/A'),
            'askVolume: ' + str(orderbook['asks'][0][1] if len(orderbook['asks']) else 'N/A'))
    else:
        dump(yellow(exchange.id), 'fetch_order_book() supported')

# ------------------------------------------------------------------------------


async def test_ohlcv(exchange, symbol):
    if exchange.has['fetchOHLCV']:
        delay = int(exchange.rateLimit / 1000)
        await asyncio.sleep(delay)
        ohlcvs = await exchange.fetch_ohlcv(symbol)
        dump(green(exchange.id), 'fetched', green(len(ohlcvs)), 'OHLCVs')
    else:
        dump(yellow(exchange.id), 'fetching OHLCV not supported')

# ------------------------------------------------------------------------------


async def test_tickers(exchange, symbol):
    if exchange.has['fetchTickers']:
        delay = int(exchange.rateLimit / 1000)
        await asyncio.sleep(delay)
        tickers = None
        try:
            # dump(green(exchange.id), 'fetching all tickers at once...')
            tickers = await exchange.fetch_tickers()
            dump(green(exchange.id), 'fetched all', green(len(list(tickers.keys()))), 'tickers')
        except Exception as e:
            dump(green(exchange.id), 'failed to fetch all tickers, fetching multiple tickers at once...')
            tickers = await exchange.fetch_tickers([symbol])
            dump(green(exchange.id), 'fetched', green(len(list(tickers.keys()))), 'tickers')
    elif argv.token_bucket:
        await test_tickers_async(exchange)
    if argv.token_bucket:
        await test_l2_order_books_async(exchange)


# ------------------------------------------------------------------------------

def get_active_symbols(exchange):
    return [symbol for symbol in exchange.symbols if is_active_symbol(exchange, symbol)]


def is_active_symbol(exchange, symbol):
    return ('.' not in symbol) and (('active' not in exchange.markets[symbol]) or (exchange.markets[symbol]['active']))


async def test_tickers_async(exchange):
    print('Activated here')
    dump(green(exchange.id), 'fetching all tickers by simultaneous multiple concurrent requests')
    symbols_to_load = get_active_symbols(exchange)
    input_coroutines = [exchange.fetchTicker(symbol) for symbol in symbols_to_load]
    tickers = await asyncio.gather(*input_coroutines, return_exceptions=True)
    for ticker, symbol in zip(tickers, symbols_to_load):
        if not isinstance(ticker, dict):
            dump_error(red('[Error with symbol loading ticker]'),
                       ' Symbol failed to load: {0}, ERROR: {1}'.format(symbol, ticker))
    dump(green(exchange.id), 'fetched', green(len(list(tickers))), 'tickers')


async def test_l2_order_books_async(exchange):
    dump(green(exchange.id), 'fetching all order books by simultaneous multiple concurrent requests')
    symbols_to_load = get_active_symbols(exchange)
    input_coroutines = [exchange.fetch_l2_order_book(symbol) for symbol in symbols_to_load]
    orderbooks = await asyncio.gather(*input_coroutines, return_exceptions=True)
    for orderbook, symbol in zip(orderbooks, symbols_to_load):
        if not isinstance(orderbook, dict):
            dump_error(red('[Error with symbol loading l2 order book]'),
                       ' Symbol failed to load: {0}, ERROR: {1}'.format(symbol, orderbook))
    dump(green(exchange.id), 'fetched', green(len(list(orderbooks))), 'order books')

# ------------------------------------------------------------------------------


async def test_ticker(exchange, symbol):
    if exchange.has['fetchTicker']:
        delay = int(exchange.rateLimit / 1000)
        await asyncio.sleep(delay)
        ticker = await exchange.fetch_ticker(symbol)
        dump(
            green(exchange.id),
            green(symbol),
            'ticker',
            ticker['datetime'],
            'high: ' + str(ticker['high']),
            'low: ' + str(ticker['low']),
            'bid: ' + str(ticker['bid']),
            'ask: ' + str(ticker['ask']),
            'volume: ' + str(ticker['quoteVolume']))
    else:
        dump(green(exchange.id), green(symbol), 'fetch_ticker() not supported')

# ------------------------------------------------------------------------------


async def test_trades(exchange, symbol):
    if exchange.has['fetchTrades']:
        delay = int(exchange.rateLimit / 1000)
        await asyncio.sleep(delay)
        # dump(green(exchange.id), green(symbol), 'fetching trades...')
        trades = await exchange.fetch_trades(symbol)
        dump(green(exchange.id), green(symbol), 'fetched', green(len(list(trades))), 'trades')
    else:
        dump(green(exchange.id), green(symbol), 'fetch_trades() not supported')

# ------------------------------------------------------------------------------


async def test_symbol(exchange, symbol):
    dump(green('SYMBOL: ' + symbol))
    await test_ticker(exchange, symbol)

    if exchange.id == 'coinmarketcap':
        response = await exchange.fetchGlobal()
        dump(green(response))
    else:
        await test_order_book(exchange, symbol)
        await test_trades(exchange, symbol)

    await test_tickers(exchange, symbol)
    await test_ohlcv(exchange, symbol)

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
        await test_symbol(exchange, symbol)

    # ..........................................................................
    # private API

    if (not hasattr(exchange, 'apiKey') or (len(exchange.apiKey) < 1)):
        return

    # move to testnet/sandbox if possible before accessing the balance if possible
    if 'test' in exchange.urls:
        exchange.urls['api'] = exchange.urls['test']

    await exchange.fetch_balance()
    dump(green(exchange.id), 'fetched balance')

    await asyncio.sleep(exchange.rateLimit / 1000)

    if exchange.has['fetchOrders']:
        try:
            orders = await exchange.fetch_orders(symbol)
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


async def try_all_proxies(exchange, proxies=['']):
    current_proxy = 0
    max_retries = len(proxies)
    # a special case for ccex
    if exchange.id == 'ccex' and max_retries > 1:
        current_proxy = 1
    for num_retries in range(0, max_retries):
        try:
            exchange.proxy = proxies[current_proxy]
            dump(green(exchange.id), 'using proxy', '`' + exchange.proxy + '`')
            current_proxy = (current_proxy + 1) % len(proxies)
            await load_exchange(exchange)
            await test_exchange(exchange)
        except ccxt.RequestTimeout as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), str(e)[0:200])
        except ccxt.NotSupported as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), str(e.args)[0:200])
        except ccxt.DDoSProtection as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), str(e.args)[0:200])
        except ccxt.ExchangeNotAvailable as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), str(e.args)[0:200])
        except ccxt.AuthenticationError as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), str(e)[0:200])
        except ccxt.ExchangeError as e:
            dump_error(yellow('[' + type(e).__name__ + ']'), str(e.args)[0:200])
        else:
            # no exception
            return True
    # exception
    return False


# ------------------------------------------------------------------------------

proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/',
    # 'https://crossorigin.me/',
]

# prefer local testing keys to global keys
keys_folder = os.path.dirname(root)
keys_global = os.path.join(keys_folder, 'keys.json')
keys_local = os.path.join(keys_folder, 'keys.local.json')
keys_file = keys_local if os.path.exists(keys_local) else keys_global

# load the api keys from config
with open(keys_file) as file:
    config = json.load(file)

# instantiate all exchanges
for id in ccxt.exchanges:
    exchange = getattr(ccxt, id)
    exchange_config = {'verbose': argv.verbose}
    if sys.version_info[0] < 3:
        exchange_config.update({'enableRateLimit': True})
    if id in config:
        exchange_config.update(config[id])
    exchanges[id] = exchange(exchange_config)

# ------------------------------------------------------------------------------


async def main():

    if argv.exchange:

        exchange = exchanges[argv.exchange]
        symbol = argv.symbol

        if hasattr(exchange, 'skip') and exchange.skip:
            dump(green(exchange.id), 'skipped')
        else:
            if symbol:
                await load_exchange(exchange)
                await test_symbol(exchange, symbol)
            else:
                await try_all_proxies(exchange, proxies)

    else:
        for exchange in sorted(exchanges.values(), key=lambda x: x.id):
            if hasattr(exchange, 'skip') and exchange.skip:
                dump(green(exchange.id), 'skipped')
            else:
                await try_all_proxies(exchange, proxies)

# ------------------------------------------------------------------------------


if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
