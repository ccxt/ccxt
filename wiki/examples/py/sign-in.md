- [Sign In](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402


exchange = ccxt.bitmart({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'uid': 'YOUR_UID',
})

while True:
    try:
        print('---------------------------------------------------------------')
        datetime = exchange.iso8601 (exchange.milliseconds ())
        print(datetime)
        balance = exchange.fetch_balance()  # this will trigger a sign_in when needed
        pprint(balance)
        # handle the response how you want or do other calls...
    except ccxt.AuthenticationError as e:
        error_message = str(e)
        if 'accessToken' in error_message:
            exchange.sign_in()
        else:
            print(str(e))
            sys.exit()
 
```