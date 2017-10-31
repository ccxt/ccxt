# -*- coding: utf-8 -*-

import os
import sys
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


def style(s, style):
    return style + s + '\033[0m'


def green(s):
    return style(s, '\033[92m')


def blue(s):
    return style(s, '\033[94m')


def yellow(s):
    return style(s, '\033[93m')


def red(s):
    return style(s, '\033[91m')


def pink(s):
    return style(s, '\033[95m')


def bold(s):
    return style(s, '\033[1m')


def underline(s):
    return style(s, '\033[4m')


def log(*args):
    print(' '.join([str(arg) for arg in args]))


exchanges = {}

for id in ccxt.exchanges:
    exchange = getattr(ccxt, id)
    exchanges[id] = exchange()

log('The ccxt library supports', green(str(len(ccxt.exchanges))), 'exchanges:')

# output a table of all exchanges
log(pink('{:<15} {:<15} {:<15}'.format('id', 'name', 'URL')))
tuples = list(ccxt.Exchange.keysort(exchanges).items())
for (id, params) in tuples:
    exchange = exchanges[id]
    website = exchange.urls['www'][0] if type(exchange.urls['www']) is list else exchange.urls['www']
    log('{:<15} {:<15} {:<15}'.format(exchange.id, exchange.name, website))
