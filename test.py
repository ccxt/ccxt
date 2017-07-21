# coding=utf-8

def style     (s, style): return style + str (s) + '\033[0m'
def green     (s): return style (s, '\033[92m')
def blue      (s): return style (s, '\033[94m')
def yellow    (s): return style (s, '\033[93m')
def red       (s): return style (s, '\033[91m')
def pink      (s): return style (s, '\033[95m')
def bold      (s): return style (s, '\033[1m')
def underline (s): return style (s, '\033[4m')

import ccxt
import time
import sys
import json

markets = {}

# print a colored string
def dump (*args):
    print (' '.join ([str (arg) for arg in args]))

def test_market_symbol_orderbook (market, symbol):
    delay = int (market.rateLimit / 1000)
    time.sleep (delay)
    orderbook = market.fetch_order_book (symbol)
    print (market.id, symbol, 'order book',
        orderbook['datetime'],
        'bid: ' +       str (orderbook['bids'][0][0] if len (orderbook['bids']) else 'N/A'), 
        'bidVolume: ' + str (orderbook['bids'][0][1] if len (orderbook['bids']) else 'N/A'),
        'ask: '       + str (orderbook['asks'][0][0] if len (orderbook['asks']) else 'N/A'),
        'askVolume: ' + str (orderbook['asks'][0][1] if len (orderbook['asks']) else 'N/A'),
    )

def test_market_symbol_ticker (market, symbol):
    delay = int (market.rateLimit / 1000)
    time.sleep (delay)
    ticker = market.fetch_ticker (symbol)
    print (market.id, symbol, 'ticker',
        ticker['datetime'],
        'high: '    + str (ticker['high']),
        'low: '     + str (ticker['low']),
        'bid: '     + str (ticker['bid']),
        'ask: '     + str (ticker['ask']),
        'volume: '  + str (ticker['quoteVolume']),
    )

def test_market_symbol (market, symbol):
    test_market_symbol_ticker (market, symbol)
    if market.id == 'coinmarketcap':
        dump (green (market.fetchGlobal ()))
    else:
        test_market_symbol_orderbook (market, symbol)

def load_market (market):
    products = market.load_products ()
    keys = list (market.products.keys ())
    # print (market.id , len (keys), 'symbols', keys)

def test_market (market):

    dump (red (market.id))
    delay = 2
    keys = list (market.products.keys ())

    #--------------------------------------------------------------------------
    # public API

    symbol = keys[0]
    symbols = [
        'BTC/USD',
        'BTC/CNY',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
    ]

    for s in symbols:
        if s in keys:
            symbol = s
            break

    if symbol.find ('.d') < 0:
        test_market_symbol (market, symbol)

    #--------------------------------------------------------------------------
    # private API

    if (not hasattr (market, 'apiKey') or (len (market.apiKey) < 1)):
        return 

    balance = market.fetch_balance ()
    print (balance)
    # time.sleep (delay)

    amount = 1
    price = 0.0161

    # marketBuy = market.create_market_buy_order (symbol, amount)
    # print (marketBuy)
    # time.sleep (delay)

    # marketSell = market.create_market_sell_order (symbol, amount)
    # print (marketSell)
    # time.sleep (delay)

    # limitBuy = market.create_limit_buy_order (symbol, amount, price)
    # print (limitBuy)
    # time.sleep (delay)

    # limitSell = market.create_limit_sell_order (symbol, amount, price)
    # print (limitSell)
    # time.sleep (delay)

#------------------------------------------------------------------------------

for id in ccxt.markets:
    market = getattr (ccxt, id)
    markets[id] = market ({
        'verbose': True,
        # 'proxy': 'https://crossorigin.me/',
        # 'proxy': 'https://cors-anywhere.herokuapp.com/',
        # 'proxy': 'http://cors-proxy.htmldriven.com/?url=',
    })

with open ('./keys.json') as file:    
    config = json.load (file)

tuples = list (ccxt.Market.keysort (config).items ())
for (id, params) in tuples:
    options = list (params.items ())
    for key in params:
        setattr (markets[id], key, params[key])

markets['gdax'].urls['api'] = 'https://api-public.sandbox.gdax.com'
markets['anxpro'].proxy = 'https://cors-anywhere.herokuapp.com/'

id = None

try:
    id = sys.argv[1]
except:
    id = None

if id:
    
    market = markets[id]
    load_market (market)
    symbol = None
    
    try:
        symbol = sys.argv[2]
    except:
        symbol = None
    
    if symbol:
        test_market_symbol (market, symbol)
    else:
        test_market (market)

else:
    tuples = list (ccxt.Market.keysort (markets).items ())
    for (id, params) in tuples:
        try:
            market = markets[id]
            load_market (market)
            test_market (market)
        except ccxt.DDoSProtectionError as e:
            print (type (e).__name__, e.args)
        except ccxt.TimeoutError as e:
            print (type (e).__name__, str (e))
        except ccxt.MarketNotAvailableError as e:
            print (type (e).__name__, e.args)
        except ccxt.AuthenticationError as e:
            print (type (e).__name__, str (e))
        except Exception as e:
            print (type (e).__name__, e.args, str (e))