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
root = os.path.dirname (os.path.dirname (os.path.dirname (os.path.abspath (__file__))))
sys.path.append (root)

import ccxt

def dump (*args):
    print (' '.join ([str (arg) for arg in args]))

def print_supported_markets ():
    dump ('Supported markets:', green (', '.join (ccxt.markets)))

try:

    id = sys.argv[1] # get exchange id from command line arguments

    # check if the exchange is supported by ccxt
    market_found = id in ccxt.markets

    if market_found:
        
        dump ('Instantiating', green (id), 'exchange market')
        
        # instantiate the exchange by id
        market = getattr (ccxt, id) ()
        
        # load all products from the exchange
        products = market.load_products ()
        
        # output a list of all product symbols
        dump (green (id), 'has', len (market.symbols), 'symbols:', yellow (', '.join (market.symbols)))

        # output a table of all products
        dump (pink ('{:<15} {:<15} {:<15} {:<15}'.format ('id', 'symbol', 'base', 'quote')))
        tuples = list (ccxt.Market.keysort (products).items ())
        for (k, v) in tuples:
            dump ('{:<15} {:<15} {:<15} {:<15}'.format (v['id'], v['symbol'], v['base'], v['quote']))

    else:

        dump ('Market ' + red (id) + ' not found')
        print_supported_markets ()

except:
    
    dump ("Usage: python " + sys.argv[0], green ('id'))
    print_supported_markets ()
