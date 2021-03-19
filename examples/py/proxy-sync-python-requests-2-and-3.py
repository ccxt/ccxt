# -*- coding: utf-8 -*-

import os
import sys

from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.poloniex({
    #
    # ↓ The "proxy" property setting below is for CORS-proxying only!
    # Do not use it if you don't know what a CORS proxy is.
    # https://github.com/ccxt/ccxt/wiki/Install#cors-access-control-allow-origin
    # You should only use the "proxy" setting if you're having a problem with Access-Control-Allow-Origin
    # In Python you rarely need to use it, if ever at all.
    #
    # 'proxy': 'https://cors-anywhere.herokuapp.com/',
    #
    # ↓ On the other hand, the "proxies" setting is for HTTP(S)-proxying (SOCKS, etc...)
    # It is a standard method of sending your requests through your proxies
    # This gets passed to the `python-requests` implementation directly
    # You can also enable this with environment variables, as described here:
    # http://docs.python-requests.org/en/master/user/advanced/#proxies
    # The environment variables should be set before importing ccxt (!)
    # This is the setting you should be using with synchronous version of ccxt in Python 2 and 3
    #
    'proxies': {
        'http': 'http://10.10.1.10:3128',  # no auth
        'https': 'https://user:password@10.10.1.10:1080',  # with auth
    },
})

# your code goes here...

pprint(exchange.fetch_ticker('ETH/BTC'))
