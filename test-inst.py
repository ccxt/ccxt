# -*- coding: utf-8 -*-

import ccxt  # noqa: E402

exchanges = {}
symbol = 'BTC/USD'

for id in ccxt.exchanges:
    print('---------------------------------------------------------------')
    print(id)
    try:
        exchange = getattr(ccxt, id)()
        exchange.load_markets()
        if symbol in exchange.symbols:
            print(exchange.fetch_ticker(symbol))
        else:
            print(id, 'does not offer', symbol, 'pair')
    except Exception as e:
        print(type(e).__name__, e.args)
