# coding=utf-8

def style     (s, style): return style + s + '\033[0m'
def green     (s): return style (s, '\033[92m')
def blue      (s): return style (s, '\033[94m')
def yellow    (s): return style (s, '\033[93m')
def red       (s): return style (s, '\033[91m')
def pink      (s): return style (s, '\033[95m')
def bold      (s): return style (s, '\033[1m')
def underline (s): return style (s, '\033[4m')

import os
import sys
import time
root = os.path.dirname (os.path.dirname (os.path.dirname (os.path.abspath (__file__))))
sys.path.append (root)

import ccxt

def dump (*args):
    print (' '.join ([str (arg) for arg in args]))

def print_supported_markets ():
    dump ('Supported markets:', ', '.join (ccxt.markets))

def print_usage ():
    dump ("Usage: python " + sys.argv[0], green ('id'), yellow ('[symbol]'))
    dump ("Symbol is optional, for example:")
    dump ("python " + sys.argv[0], green ('kraken'))
    dump ("python " + sys.argv[0], green ('gdax'), yellow ('BTC/USD'))
    print_supported_markets ()

def print_market_symbol_ticker (market, symbol):
    ticker = market.fetch_ticker (symbol)
    dump (green (market.id), yellow (symbol), 'ticker',
        ticker['datetime'],
        'high: '   + str (ticker['high']),
        'low: '    + str (ticker['low']),
        'bid: '    + str (ticker['bid']),
        'ask: '    + str (ticker['ask']),
        'volume: ' + str (ticker['quoteVolume']),
    )

try:

    id = sys.argv[1] # get exchange id from command line arguments

    # check if the exchange is supported by ccxt
    market_found = id in ccxt.markets

    if market_found:
        
        dump ('Instantiating', green (id))
        
        # instantiate the exchange by id
        market = getattr (ccxt, id) ()
        
        # load all products from the exchange
        products = market.load_products ()
        
        # a list of all product symbols
        symbols = list (products.keys ())

        # output all symbols
        # dump (green (id), 'has', len (symbols), 'symbols:', yellow (', '.join (symbols)))

        try: # if symbol is present, get that symbol only 

            symbol = sys.argv[2]
            print_market_symbol_ticker (market, symbol)

        except: # run through all symbols one by one

            for symbol in symbols:

                if symbol.find ('.d') < 0: # suffix '.d' means 'darkpool' on some markets
                    
                    # sleep to remain under the rateLimit
                    delay = int (market.rateLimit / 1000)
                    time.sleep (delay)

                    # fetch and print ticker
                    print_market_symbol_ticker (market, symbol)       
    else:

        dump ('Market ' + red (id) + ' not found')
        print_usage ()

except:

        print_usage ()
