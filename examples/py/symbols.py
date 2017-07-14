# coding=utf-8

class styles:
    pink      = '\033[95m'
    blue      = '\033[94m'
    green     = '\033[92m'
    yellow    = '\033[93m'
    red       = '\033[91m'
    end       = '\033[0m'
    bold      = '\033[1m'
    underline = '\033[4m'

def style     (s, style): return style + s + styles.end
def green     (s): return style (s, styles.green)
def blue      (s): return style (s, styles.blue)
def yellow    (s): return style (s, styles.yellow)
def red       (s): return style (s, styles.red)
def pink      (s): return style (s, styles.pink)
def bold      (s): return style (s, styles.bold)
def underline (s): return style (s, styles.bold)

import sys
sys.path.append ('../ccxt')
import ccxt

def log (*args):
    print (' '.join ([str (arg) for arg in args]))

try:

    id = sys.argv[1]

    # check if the exchange is supported by ccxt
    market_found = id in ccxt.markets

    if market_found:
        
        log ('Instantiating', green (id), 'exchange market')
        
        # instantiate the exchange by id
        market = getattr (ccxt, id) ()
        
        # load all products from the exchange
        products = market.load_products ()
        
        # output a list of all product symbols
        symbols = list (products.keys ())
        log (green (id), 'has', len (symbols), 'symbols:', yellow (', '.join (symbols)))

        # output a table of all products
        log (pink ('{:<15} {:<15} {:<15} {:<15}'.format ('id', 'symbol', 'base', 'quote')))
        for k, v in products.iteritems ():
            log ('{:<15} {:<15} {:<15} {:<15}'.format (v['id'], v['symbol'], v['base'], v['quote']))

    else:

        log ('Market ' + red (id) + ' not found')
        log ('Supported markets:', green (', '.join (ccxt.markets)))

except:
    
    log ("Usage: python " + sys.argv[0], green ('id'))
