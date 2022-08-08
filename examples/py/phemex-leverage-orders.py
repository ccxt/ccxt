# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.phemex({
    'apiKey': 'YOUR_API_KEY',  # testnet keys if using the testnet sandbox
    'secret': 'YOUR_SECRET',  # testnet keys if using the testnet sandbox
    'options': {
        'defaultType': 'swap',
    },
})

# exchange.set_sandbox_mode(True)  # uncomment to use the testnet sandbox

markets = exchange.load_markets()

amount = 5
symbol = 'BTC/USD:USD'

# Change leverage to the desired value
leverageResponse = exchange.set_leverage(5, symbol)

# Opening a pending contract (limit) order
order = exchange.create_order(symbol, 'market', 'buy', amount)
print(order)

# Canceling pending contract
closingOrder = exchange.create_order(symbol, 'market', 'sell', amount)
pprint(closingOrder)

# Reset leverage to 1
leverageResponse = exchange.set_leverage(1, symbol)
print(leverageResponse)