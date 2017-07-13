# coding=utf-8

import ccxt
import time
import sys

try:

    from config import markets as markets

except ImportError:

    markets = {}

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
    test_market_symbol_orderbook (market, symbol)

def load_market (market):
    # print (dir (market))
    # print (market.id)
    products = market.load_products ()
    # print (market.id, 'products', products)
    keys = list (market.products.keys ())
    print (market.id , len (keys), 'symbols', keys)

def test_market (market):

    delay = 2
    keys = list (market.products.keys ())

    #--------------------------------------------------------------------------
    # public API

    for symbol in keys:
        if symbol.find ('.d') < 0:
            test_market_symbol (market, symbol)

    #--------------------------------------------------------------------------
    # private API

    if (not hasattr (market, 'apiKey') or (len (market.apiKey) < 1)):
        return 

    print ('balance')
    balance = market.fetch_balance ()
    print (balance)
    time.sleep (delay)

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
        'verbose': False,
        # 'proxy': 'https://crossorigin.me/',
    })

markets['_1broker'].apiKey = 'A0f79063a5e91e6d62fbcbbbbdd63258'

markets['xbtce'].uid    = '68ef0552-3c37-4896-ba56-76173d9cd573'
markets['xbtce'].apiKey = 'dK2jBXMTppAM57ZJ'
markets['xbtce'].secret = 'qGNTrzs3d956DZKSRnPPJ5nrQJCwetAnh7cR6Mkj5E4eRQyMKwKqH7ywsxcR78WT'

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
        except Exception as e:
            print (type (e).__name__, e.args)
            sys.exit ()