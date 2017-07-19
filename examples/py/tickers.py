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

def print_markets ():
    dump ('Supported markets:', ', '.join (ccxt.markets))

def print_usage ():
    dump ("Usage: python " + sys.argv[0], green ('id'), yellow ('[symbol]'))
    dump ("Symbol is optional, for example:")
    dump ("python " + sys.argv[0], green ('kraken'))
    dump ("python " + sys.argv[0], green ('gdax'), yellow ('BTC/USD'))
    print_markets ()

def print_ticker (market, symbol):
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
        
        # output all symbols
        dump (green (id), 'has', len (market.symbols), 'symbols:', yellow (', '.join (market.symbols)))

        try:

            if len (sys.argv) > 2: # if symbol is present, get that symbol only 

                symbol = sys.argv[2]
                print_ticker (market, symbol)

            else: # run through all symbols one by one

                delay = int (market.rateLimit / 1000) # delay in between requests

                for symbol in market.symbols:

                    # suffix '.d' means 'darkpool' on some markets
                    if symbol.find ('.d') < 0: 
                        
                        # sleep to remain under the rateLimit
                        time.sleep (delay)

                        # fetch and print ticker
                        print_ticker (market, symbol)

        except ccxt.DDoSProtectionError as e:
            print (type (e).__name__, e.args, 'DDoS Protection Error (ignoring)')
        except ccxt.TimeoutError as e:
            print (type (e).__name__, e.args, 'Timeout Error, request timed out (ignoring)')
        except ccxt.MarketNotAvailaibleError as e:
            print (type (e).__name__, e.args, 'Market Not Available Error due to downtime or maintenance (ignoring)')
        except ccxt.AuthenticationError as e:
            print (type (e).__name__, e.args, 'Authentication Error (missing API keys, ignoring)')
            
    else:

        dump ('Market ' + red (id) + ' not found')
        print_usage ()

except Exception as e:

    print (type (e).__name__, e.args, str (e))
    print_usage ()
