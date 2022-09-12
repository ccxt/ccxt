# -*- coding: utf-8 -*-

import argparse
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

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root)

# ------------------------------------------------------------------------------

import ccxt  # noqa: E402
from test_trade import test_trade  # noqa: E402
from test_order import test_order  # noqa: E402
from test_ohlcv import test_ohlcv  # noqa: E402
from test_position import test_position  # noqa: E402
from test_transaction import test_transaction  # noqa: E402

# ------------------------------------------------------------------------------


class Argv(object):

    verbose = False
    nonce = None
    exchange = None
    symbol = None
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

path = os.path.dirname(ccxt.__file__)
if 'site-packages' in os.path.dirname(ccxt.__file__):
    raise Exception("You are running test_async.py/test.py against a globally-installed version of the library! It was previously installed into your site-packages folder by pip or pip3. To ensure testing against the local folder uninstall it first with pip uninstall ccxt or pip3 uninstall ccxt")

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
    sys.stderr.flush()


# ------------------------------------------------------------------------------


def handle_all_unhandled_exceptions(type, value, traceback):
    dump_error(yellow(type), yellow(value), '\n\n' + yellow('\n'.join(format_tb(traceback))))
    _exit(1)  # unrecoverable crash


sys.excepthook = handle_all_unhandled_exceptions

# ------------------------------------------------------------------------------


def test_order_book(exchange, symbol):
    method = 'fetchOrderBook'
    if exchange.has[method]:
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)
        # dump(green(exchange.id), green(symbol), 'fetching order book...')
        orderbook = getattr(exchange, method)(symbol)
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
        dump(yellow(exchange.id), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_ohlcvs(exchange, symbol):
    method = 'fetchOHLCV'
    ignored_exchanges = [
        'cex',  # CEX can return historical candles for a certain date only
        'okex',  # okex fetchOHLCV counts "limit" candles from current time backwards
        'okcoinusd',  # okex base class
    ]
    if exchange.id in ignored_exchanges:
        return
    if exchange.has[method]:
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)
        timeframes = exchange.timeframes if exchange.timeframes else {'1d': '1d'}
        timeframe = list(timeframes.keys())[0]
        limit = 10
        duration = exchange.parse_timeframe(timeframe)
        since = exchange.milliseconds() - duration * limit * 1000 - 1000
        ohlcvs = getattr(exchange, method)(symbol, timeframe, since, limit)
        for ohlcv in ohlcvs:
            test_ohlcv(exchange, ohlcv, symbol, int(time.time() * 1000))
        dump(green(exchange.id), 'fetched', green(len(ohlcvs)), 'OHLCVs')
    else:
        dump(yellow(exchange.id), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_tickers(exchange, symbol):
    method = 'fetchTickers'
    ignored_exchanges = [
        'digifinex',  # requires apiKey to call v2 tickers
    ]
    if exchange.id in ignored_exchanges:
        return
    if exchange.has[method]:
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)
        tickers = None
        try:
            # dump(green(exchange.id), 'fetching all tickers at once...')
            tickers = getattr(exchange, method)()
            dump(green(exchange.id), 'fetched all', green(len(list(tickers.keys()))), 'tickers')
        except Exception as e:
            dump(green(exchange.id), 'failed to fetch all tickers, fetching multiple tickers at once...')
            tickers = exchange.fetch_tickers([symbol])
            dump(green(exchange.id), 'fetched', green(len(list(tickers.keys()))), 'tickers')


# ------------------------------------------------------------------------------

def get_active_symbols(exchange):
    return [symbol for symbol in exchange.symbols if is_active_symbol(exchange, symbol)]


def is_active_symbol(exchange, symbol):
    return ('.' not in symbol) and (('active' not in exchange.markets[symbol]) or (exchange.markets[symbol]['active']))


# ------------------------------------------------------------------------------


def test_ticker(exchange, symbol):
    method = 'fetchTicker'
    ignored_exchanges = [
        'digifinex',  # requires apiKey to call v2 tickers
    ]
    if exchange.id in ignored_exchanges:
        return
    if exchange.has[method]:
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)
        ticker = getattr(exchange, method)(symbol)
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
        dump(green(exchange.id), green(symbol), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_trades(exchange, symbol):
    method = 'fetchTrades'
    if exchange.has[method]:
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)
        # dump(green(exchange.id), green(symbol), 'fetching trades...')
        trades = getattr(exchange, method)(symbol)
        if trades:
            test_trade(exchange, trades[0], symbol, int(time.time() * 1000))
        dump(green(exchange.id), green(symbol), 'fetched', green(len(trades)), 'trades')
    else:
        dump(green(exchange.id), green(symbol), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_orders(exchange, symbol):
    method = 'fetchOrders'
    if exchange.has[method]:
        skipped_exchanges = [
            'bitmart',
            'rightbtc',
        ]
        if exchange.id in skipped_exchanges:
            dump(green(exchange.id), green(symbol), method + '() skipped')
            return
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)
        # dump(green(exchange.id), green(symbol), 'fetching orders...')
        orders = exchange.fetch_orders(symbol)
        for order in orders:
            test_order(exchange, order, symbol, int(time.time() * 1000))
        dump(green(exchange.id), green(symbol), 'fetched', green(len(orders)), 'orders')
    else:
        dump(green(exchange.id), green(symbol), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_positions(exchange, symbol):
    method = 'fetchPositions'
    if exchange.has[method]:
        skipped_exchanges = [
        ]
        if exchange.id in skipped_exchanges:
            dump(green(exchange.id), green(symbol), method + '() skipped')
            return
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)
        # without symbol
        dump(green(exchange.id), 'fetching positions...')
        positions = getattr(exchange, method)()
        for position in positions:
            test_position(exchange, position, None, int(time.time() * 1000))
        dump(green(exchange.id), 'fetched', green(len(positions)), 'positions')

        # with symbol
        dump(green(exchange.id), green(symbol), 'fetching positions...')
        positions = getattr(exchange, method)([symbol])
        for position in positions:
            test_position(exchange, position, symbol, int(time.time() * 1000))
        dump(green(exchange.id), green(symbol), 'fetched', green(len(positions)), 'positions')
    else:
        dump(green(exchange.id), green(symbol), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_closed_orders(exchange, symbol):
    method = 'fetchClosedOrders'
    if exchange.has[method]:
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)
        # dump(green(exchange.id), green(symbol), 'fetching orders...')
        orders = getattr(exchange, method)(symbol)
        for order in orders:
            test_order(exchange, order, symbol, int(time.time() * 1000))
            assert order['status'] == 'closed' or order['status'] == 'canceled'
        dump(green(exchange.id), green(symbol), 'fetched', green(len(orders)), 'closed orders')
    else:
        dump(green(exchange.id), green(symbol), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_open_orders(exchange, symbol):
    method = 'fetchOpenOrders'
    if exchange.has[method]:
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)
        # dump(green(exchange.id), green(symbol), 'fetching orders...')
        orders = getattr(exchange, method)(symbol)
        for order in orders:
            test_order(exchange, order, symbol, int(time.time() * 1000))
            assert order['status'] == 'open'
        dump(green(exchange.id), green(symbol), 'fetched', green(len(orders)), 'open orders')
    else:
        dump(green(exchange.id), green(symbol), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_transactions(exchange, code):
    method = 'fetchTransactions'
    if exchange.has[method]:
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)

        transactions = getattr(exchange, method)(code)
        for transaction in transactions:
            test_transaction(exchange, transaction, code, int(time.time() * 1000))
        dump(green(exchange.id), green(code), 'fetched', green(len(transactions)), 'transactions')
    else:
        dump(green(exchange.id), green(code), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_balance(exchange):
    method = 'fetchBalance'
    if exchange.has[method]:
        delay = int(exchange.rateLimit / 1000)
        time.sleep(delay)

        getattr(exchange, method)()
        dump(green(exchange.id), 'fetched balance')
    else:
        dump(green(exchange.id), method + '() is not supported')

# ------------------------------------------------------------------------------


def test_symbol(exchange, symbol, code):
    dump(green('SYMBOL: ' + symbol))
    dump(green('CODE: ' + code))
    dump('Testing fetch_ticker:' + symbol)
    test_ticker(exchange, symbol)
    dump('Testing fetch_tickers:' + symbol)
    test_tickers(exchange, symbol)
    dump('Testing fetch_ohlcv:' + symbol)
    test_ohlcvs(exchange, symbol)

    if exchange.id == 'coinmarketcap':
        response = exchange.fetchGlobal()
        dump(green(response))
    else:
        dump('Testing fetch_order_book:' + symbol)
        test_order_book(exchange, symbol)
        dump('Testing fetch_trades:' + symbol)
        test_trades(exchange, symbol)
        if (not hasattr(exchange, 'apiKey') or (len(exchange.apiKey) < 1)):
            return
        method = 'signIn'
        if exchange.has[method]:
            dump('Testing ' + method + '()')
            getattr(exchange, method)()
        dump('Testing fetch_orders:' + symbol)
        test_orders(exchange, symbol)
        dump('Testing fetch_open_orders:' + symbol)
        test_open_orders(exchange, symbol)
        dump('Testing fetch_closed_orders:' + symbol)
        test_closed_orders(exchange, symbol)
        dump('Testing fetch_transactions:' + code)
        test_transactions(exchange, code)
        dump('Testing fetch_balance')
        test_balance(exchange)
        dump('Testing fetch_positions:' + symbol)
        test_positions(exchange, symbol)

# ------------------------------------------------------------------------------


def load_exchange(exchange):
    exchange.load_markets()


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


def test_exchange(exchange, symbol=None):

    dump(green('EXCHANGE: ' + exchange.id))
    # delay = 2

    # ..........................................................................
    # public API

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

    if not symbol:
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
            'EUR/USD',
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
        test_symbol(exchange, symbol, code)

    # ..........................................................................
    # private API

    # move to testnet/sandbox if possible before accessing the balance if possible
    # if 'test' in exchange.urls:
    #     exchange.urls['api'] = exchange.urls['test']

    # time.sleep(exchange.rateLimit / 1000)

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


def try_all_proxies(exchange, proxies=['']):
    current_proxy = 0
    max_retries = len(proxies)
    if exchange.proxy in proxies:
        current_proxy = proxies.index(exchange.proxy)
    for num_retries in range(0, max_retries):
        try:
            exchange.proxy = proxies[current_proxy]
            dump(green(exchange.id), 'using proxy', '`' + exchange.proxy + '`')
            current_proxy = (current_proxy + 1) % len(proxies)
            load_exchange(exchange)
            test_exchange(exchange)
        except (ccxt.RequestTimeout, ccxt.AuthenticationError, ccxt.NotSupported, ccxt.DDoSProtection, ccxt.ExchangeNotAvailable, ccxt.ExchangeError) as e:
            print({'type': type(e).__name__, 'num_retries': num_retries, 'max_retries': max_retries}, str(e)[0:200])
            if (num_retries + 1) == max_retries:
                dump_error(yellow('[' + type(e).__name__ + ']'), str(e)[0:200])
        else:
            # no exception
            return True
    # exception
    return False


# ------------------------------------------------------------------------------

proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/',
]

# prefer local testing keys to global keys
keys_folder = os.path.dirname(root)
keys_global = os.path.join(keys_folder, 'keys.json')
keys_local = os.path.join(keys_folder, 'keys.local.json')
keys_file = keys_local if os.path.exists(keys_local) else keys_global

# load the api keys from config
with open(keys_file, encoding='utf8') as file:
    config = json.load(file)

# instantiate all exchanges
for id in ccxt.exchanges:
    if id == 'theocean':
        continue
    exchange = getattr(ccxt, id)
    exchange_config = {'verbose': argv.verbose}
    if sys.version_info[0] < 3:
        exchange_config.update()
    if id in config:
        exchange_config = ccxt.Exchange.deep_extend(exchange_config, config[id])
    exchanges[id] = exchange(exchange_config)

# ------------------------------------------------------------------------------


def main():

    if argv.exchange:

        if argv.exchange != 'theocean':

            exchange = exchanges[argv.exchange]
            symbol = argv.symbol

            if hasattr(exchange, 'skip') and exchange.skip:
                dump(green(exchange.id), 'skipped')
            else:
                if symbol:
                    load_exchange(exchange)
                    test_symbol(exchange, symbol)
                else:
                    try_all_proxies(exchange, proxies)

    else:
        for exchange in sorted(exchanges.values(), key=lambda x: x.id):
            if hasattr(exchange, 'skip') and exchange.skip:
                dump(green(exchange.id), 'skipped')
            else:
                try_all_proxies(exchange, proxies)

# ------------------------------------------------------------------------------


if __name__ == '__main__':
    main()
