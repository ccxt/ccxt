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
    dump ("Usage: python " + sys.argv[0], green ('id1'), yellow ('id2'), blue ('id3'), '...')

proxies = [
    '', # no proxy by default
    'https://crossorigin.me/',
    'https://cors-anywhere.herokuapp.com/',
];

if len (sys.argv) > 2:
    ids = list (sys.argv[1:])
    markets = {}
    dump (ids)
    dump (yellow (' '.join (ids)))
    for id in ids: # load all products from all exchange markets

        # instantiate the exchange by id
        market = getattr (ccxt, id) ()

        # save it in a dictionary under its id for future use
        markets[id] = market

        # load all products from the exchange
        products = market.load_products ()

        # basic round-robin proxy scheduler
        currentProxy = -1
        maxRetries   = len (proxies)
        
        for numRetries in range (0, maxRetries):

            # try proxies in round-robin fashion
            currentProxy = (currentProxy + 1) % len (proxies)

            try: # try to load exchange products using current proxy

                market.proxy = proxies[currentProxy]
                market.load_products ()

            except ccxt.DDoSProtectionError as e:
                dump (yellow (type (e).__name__), e.args)
            except ccxt.TimeoutError as e:
                dump (yellow (type (e).__name__), e.args)
            except ccxt.AuthenticationError as e:
                dump (yellow (type (e).__name__), e.args)
            except ccxt.MarketNotAvailableError as e:
                dump (yellow (type (e).__name__), e.args)
            except ccxt.EndpointNotAvailableError as e:
                dump (yellow (type (e).__name__), e.args)
            except Exception as e: # reraise all other exceptions
                raise 

        dump (green (id), 'products loaded')

    dump (green ('Loaded all products'))

    allSymbols = [symbol for id in ids for symbol in markets[id].symbols]

    # get all unique symbols
    uniqueSymbols = list (set (allSymbols))
   
    # filter out symbols that are not present on at least two exchanges
    arbitrableSymbols = [symbol for symbol in uniqueSymbols if allSymbols.count (symbol) > 1]

    # print a table of arbitrable symbols
    table = []
    dump (green (' symbol          | ' + ''.join ([' {:<15} | '.format (id) for id in ids])))
    dump (green (''.join (['-----------------+-' for x in range (0, len (ids) + 1)])))

    for symbol in arbitrableSymbols:
        string = ' {:<15} | '.format (symbol)
        row = { }
        for id in ids:
            # if a symbol is present on a market print that market's id in the row
            string += ' {:<15} | '.format (id if symbol in markets[id].symbols else '')
        dump (string)

else:
    
    print_usage ()