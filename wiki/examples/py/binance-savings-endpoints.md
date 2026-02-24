- [Binance Savings Endpoints](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

markets = exchange.load_markets()

exchange.verbose = True  # uncomment for debugging purposes

response = exchange.sapi_post_lending_customizedfixed_purchase({
    # YOUR PARAMS HERE
    # https://binance-docs.github.io/apidocs/spot/en/#purchase-fixed-activity-project-user_data
})

pprint(response)

response = exchange.sapi_post_lending_daily_purchase({
    # YOUR PARAMS HERE
    # https://binance-docs.github.io/apidocs/spot/en/#purchase-flexible-product-user_data
})

pprint(response)

response = exchange.sapi_post_lending_daily_redeem({
    # YOUR PARAMS HERE
    # https://binance-docs.github.io/apidocs/spot/en/#redeem-flexible-product-user_data
})

pprint(response) 
```