# -*- coding: utf-8 -*-

import os
import sys
import requests
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


# configure the source IP address
ip_address = '192.168.1.2'  # YOUR EXTERNAL IP ADDRESS HERE
session = requests.Session()
for prefix in ('http://', 'https://'):
    session.get_adapter(prefix).init_poolmanager(
        # those are default values from HTTPAdapter's constructor
        connections=requests.adapters.DEFAULT_POOLSIZE,
        maxsize=requests.adapters.DEFAULT_POOLSIZE,
        # This should be a tuple of (address, port). Port 0 means auto-selection.
        source_address=(ip_address, 0),
    )


exchange = ccxt.ftx({
    'session': session,
    # ... other config properties here if necessary ...
})


markets = exchange.load_markets()
exchange.verbose = True

ticker = exchange.fetch_ticker('BTC/USD')
pprint(ticker)
