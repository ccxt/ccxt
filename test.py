# coding=utf-8

import ccxt
import time
import sys
import json

markets = {}

#------------------------------------------------------------------------------
# string coloring functions

def style     (s, style): return style + str (s) + '\033[0m'
def green     (s): return style (s, '\033[92m')
def blue      (s): return style (s, '\033[94m')
def yellow    (s): return style (s, '\033[93m')
def red       (s): return style (s, '\033[91m')
def pink      (s): return style (s, '\033[95m')
def bold      (s): return style (s, '\033[1m')
def underline (s): return style (s, '\033[4m')

# print a colored string
def dump (*args):
    print (' '.join ([str (arg) for arg in args]))

#------------------------------------------------------------------------------

def test_market_symbol_orderbook (market, symbol):
    delay = int (market.rateLimit / 1000)
    time.sleep (delay)
    dump (green (market.id), green (symbol), 'fetching order book...')
    orderbook = market.fetch_order_book (symbol)
    dump (green (market.id), green (symbol), 'order book',
        orderbook['datetime'],
        'bid: ' +       str (orderbook['bids'][0][0] if len (orderbook['bids']) else 'N/A'), 
        'bidVolume: ' + str (orderbook['bids'][0][1] if len (orderbook['bids']) else 'N/A'),
        'ask: '       + str (orderbook['asks'][0][0] if len (orderbook['asks']) else 'N/A'),
        'askVolume: ' + str (orderbook['asks'][0][1] if len (orderbook['asks']) else 'N/A'),
    )

def test_market_symbol_ticker (market, symbol):
    delay = int (market.rateLimit / 1000)
    time.sleep (delay)
    dump (green (market.id), green (symbol), 'fetching ticker...')
    ticker = market.fetch_ticker (symbol)
    dump (green (market.id), green (symbol), 'ticker',
        ticker['datetime'],
        'high: '    + str (ticker['high']),
        'low: '     + str (ticker['low']),
        'bid: '     + str (ticker['bid']),
        'ask: '     + str (ticker['ask']),
        'volume: '  + str (ticker['quoteVolume']),
    )

def test_market_symbol (market, symbol):
    dump (green ('SYMBOL: ' + symbol))
    test_market_symbol_ticker (market, symbol)
    if market.id == 'coinmarketcap':
        dump (green (market.fetchGlobal ()))
    else:
        test_market_symbol_orderbook (market, symbol)

def load_market (market):
    products = market.load_products ()

def test_market (market):

    dump (green ('MARKET: ' + market.id))
    delay = 2
    keys = list (market.products.keys ())

    #..........................................................................
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
    ]

    for s in symbols:
        if s in keys:
            symbol = s
            break

    if symbol.find ('.d') < 0:
        test_market_symbol (market, symbol)

    #..........................................................................
    # private API

    if (not hasattr (market, 'apiKey') or (len (market.apiKey) < 1)):
        return 

    balance = market.fetch_balance ()
    dump (green (market.id), 'balance', balance)
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


# let tryAllProxies = async function (market, proxies) {
#     let currentProxy = 0
#     let maxRetries   = proxies.length
#     for (let numRetries = 0; numRetries < maxRetries; numRetries++) {
#         try {
#             market.proxy = proxies[currentProxy]
#             if ([ 'coinspot' ].indexOf (market.id) < 0) {
#                 await loadMarket (market)
#                 await testMarket (market)
#                 break;
#             }
#         } catch (e) {
#             currentProxy = ++currentProxy % proxies.length
#             if (e instanceof ccxt.DDoSProtectionError) {
#                 log.bright.yellow (market.id, '[DDoS Protection Error] ' + e.message)
#             } else if (e instanceof ccxt.TimeoutError) {
#                 log.bright.yellow (market.id, '[Timeout Error] ' + e.message)
#             } else if (e instanceof ccxt.AuthenticationError) {
#                 log.bright.yellow (market.id, '[Authentication Error] ' + e.message)
#             } else if (e instanceof ccxt.MarketNotAvailableError) {
#                 log.bright.yellow (market.id, '[Market Not Available Error] ' + e.message)
#             } else if (e instanceof ccxt.EndpointNotAvailableError) {
#                 log.bright.yellow (market.id, '[Endpoint Not Available Error] ' + e.message)
#             } else {
#                 throw e;
#             }
#         }
#     }
# }

#------------------------------------------------------------------------------

def try_all_proxies (market, proxies):
    current_proxy = 0
    max_retries = len (proxies)
    # a special case for ccex
    if market.id == 'ccex':
        currentProxy = 1
    for num_retries in range (0, max_retries):    
        try:
            market.proxy = proxies[current_proxy]
            current_proxy = (current_proxy + 1) % len (proxies)
            load_market (market)
            test_market (market)
            break
        except ccxt.DDoSProtectionError as e:
            dump (yellow (type (e).__name__), e.args)
        except ccxt.TimeoutError as e:
            dump (yellow (type (e).__name__), str (e))
        except ccxt.MarketNotAvailableError as e:
            dump (yellow (type (e).__name__), e.args)
        except ccxt.AuthenticationError as e:
            dump (yellow (type (e).__name__), str (e))

#------------------------------------------------------------------------------

proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/',
    'https://crossorigin.me/',
    # 'http://cors-proxy.htmldriven.com/?url=', # we don't want this for now
]

# instantiate all markets
for id in ccxt.markets:
    market = getattr (ccxt, id)
    markets[id] = market ({ 'verbose': True })

# load the api keys from config
with open ('./keys.json') as file:    
    config = json.load (file)

# set up api keys appropriately
tuples = list (ccxt.Market.keysort (config).items ())
for (id, params) in tuples:
    options = list (params.items ())
    for key in params:
        setattr (markets[id], key, params[key])

# move gdax to sandbox
markets['gdax'].urls['api'] = 'https://api-public.sandbox.gdax.com'

id = None
try:
    id = sys.argv[1]
except:
    id = None

if id:
    
    market = markets[id]
    symbol = None
    
    try:
        symbol = sys.argv[2]
    except:
        symbol = None
    
    if symbol:
        load_market (market)
        test_market_symbol (market, symbol)
    else:
        try_all_proxies (market, proxies)

else:

    tuples = list (ccxt.Market.keysort (markets).items ())
    for (id, params) in tuples:
        if id is not 'virwox':
            market = markets[id]
            try_all_proxies (market, proxies)
