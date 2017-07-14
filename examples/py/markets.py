# coding=utf-8

def style     (s, style): return style + str (s) + '\033[0m'
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

markets = {}

for id in ccxt.markets:
    market = getattr (ccxt, id)
    markets[id] = market ()

def log (*args):
    print (' '.join ([str (arg) for arg in args]))

log ('The ccxt library supports', green (len (ccxt.markets)), 'markets:')

# output a table of all markets
log (pink ('{:<15} {:<15} {:<15}'.format ('id', 'name', 'URL')))
tuples = list (ccxt.Market.keysort (markets).items ())
for (id, params) in tuples:
    market = markets[id]
    website = market.urls['www'][0] if type (market.urls['www']) is list else market.urls['www']
    log ('{:<15} {:<15} {:<15}'.format (market.id, market.name, website))
    
