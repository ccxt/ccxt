- [Balance Kraken](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402

kraken = ccxt.kraken({
    'apiKey': "YOUR_API_KEY",
    'secret': "YOUR_SECRET",
    'verbose': True,  # switch it to False if you don't want the HTTP log
})

print(kraken.fetch_balance())
 
```