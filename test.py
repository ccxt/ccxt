# coding=utf-8

import ccxt
import time
import sys

verbose = False

try:

    from config import markets as markets

except ImportError:

    markets = {}

#------------------------------------------------------------------------------

# tuples = list (ccxt.Market.keysort (markets).items ())

# print (tuples)

for id in ccxt.markets:
    market = getattr (ccxt, id)
    markets[id] = market ({ 'verbose': verbose })

def test_market (market):

    delay = 2
    
    print ('-----------------------------------------------------------------')
    # print (dir (market))
    # print (market.id)

    products = market.load_products ()
    # print (market.id, 'products', products)

    keys = list(products.keys ())
    print (market.id , len (keys), 'symbols', keys)
    # time.sleep (delay)

    symbol = keys[0]
    for s in ['BTC/USD', 'BTC/CNY', 'BTC/ETH', 'ETH/BTC', 'BTC/JPY']:
        if s in keys:
            symbol = s
            break

    # symbol = products.keys ()[0]
    # symbol = 'BTC/IDR'
    # symbol = 'BTC/JPY'
    # symbol = 'BTC/CNY'

    #--------------------------------------------------------------------------
    # public API

    # print (market.id, symbol, 'orderbook')
    # orderbook = market.fetch_order_book (symbol)
    # print (orderbook)
    # time.sleep (delay)

    # print (market.id, symbol, 'trades')
    # trades = market.fetch_trades (symbol)
    # print (trades)
    # time.sleep (delay)

    for symbol in keys:
        if symbol.find ('.d') < 0:

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

            time.sleep (delay)

            orderbook = market.fetch_order_book (symbol)
            print (market.id, symbol, 'order book',
                orderbook['datetime'],
                'bid: ' +       str (orderbook['bids'][0][0] if len (orderbook['bids']) else 'N/A'), 
                'bidVolume: ' + str (orderbook['bids'][0][1] if len (orderbook['bids']) else 'N/A'),
                'ask: '       + str (orderbook['asks'][0][0] if len (orderbook['asks']) else 'N/A'),
                'askVolume: ' + str (orderbook['asks'][0][1] if len (orderbook['asks']) else 'N/A'),
            )

    #--------------------------------------------------------------------------
    # private API

    if (not market.apiKey) or (len (market.apiKey) < 1):
        return 

    print ('balance')
    balance = market.fetch_balance ()
    print (balance)
    time.sleep (delay)

    amount = 1
    price = 0.0161

    # print ('market buy')
    # marketBuy = market.create_market_buy_order (symbol, amount)
    # print (marketBuy)
    # time.sleep (delay)

    # print ('market sell')
    # marketSell = market.create_market_sell_order (symbol, amount)
    # print (marketSell)
    # time.sleep (delay)

    # print ('limit buy')
    # limitBuy = market.create_limit_buy_order (symbol, amount, price)
    # print (limitBuy)
    # time.sleep (delay)

    # print ('limit sell')
    # limitSell = market.create_limit_sell_order (symbol, amount, price)
    # print (limitSell)
    # time.sleep (delay)

arg = None
try:
    arg = sys.argv[1]
except:
    arg = None

if arg:
    id = arg
    market = markets[id]
    test_market (market)
else:
    for (id, params) in tuples:
        print (id)
        try:
            test_market (markets[id])
        except Exception as e:
            print (type (e).__name__, e.args)
            sys.exit ()