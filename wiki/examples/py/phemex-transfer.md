- [Phemex Transfer](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402
print('CCXT Version:', ccxt.__version__)

# Example 1: Transfer between the spot main-account and swap main-account
def main_account_transfer():
    exchange = ccxt.phemex({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # 'verbose': True,  # for debug output
    })
    code = 'USDT'
    amount = 10
    fromAccount = 'spot'
    toAccount = 'swap'
    params = {}

    try:
        transfer = exchange.transfer(code, amount, fromAccount, toAccount, params=params)
        pprint(transfer)
    except Exception as err:
        print(err)


# Example 2: Transfer between main-account and sub-account (Requires the main and sub-account UID's found on the account/sub-accounts page on Phemex)
def transfer_between_main_and_sub_accounts():
    exchange = ccxt.phemex({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # 'verbose': True,  # for debug output
    })
    code = 'USDT'
    amount = 10
    fromAccount = '4148428'
    toAccount = '4663243'
    # set the bizType to 'SPOT' or 'PERPETUAL', default is 'SPOT'
    bizType = 'PERPETUAL'
    params = {
        'bizType': bizType
    }

    try:
        transfer = exchange.transfer(code, amount, fromAccount, toAccount, params=params)
        pprint(transfer)
    except Exception as err:
        print(err)


# Example 3: Transfer between the spot sub-account and swap sub-account (Requires a sub-account API key and secret)
def sub_account_transfer():
    exchange = ccxt.phemex({
        'apiKey': 'YOUR_SUB_ACCOUNT_API_KEY',
        'secret': 'YOUR_SUB_ACCOUNT_SECRET',
        # 'verbose': True,  # for debug output
    })
    code = 'USDT'
    amount = 10
    fromAccount = 'spot'
    toAccount = 'swap'
    params = {}

    try:
        transfer = exchange.transfer(code, amount, fromAccount, toAccount, params=params)
        pprint(transfer)
    except Exception as err:
        print(err)


# Example 4: Use the Implicit API to transfer from swap sub-account to swap main-account
def sub_swap_to_main_swap():
    exchange = ccxt.phemex({
        'apiKey': 'YOUR_SUB_ACCOUNT_API_KEY',
        'secret': 'YOUR_SUB_ACCOUNT_SECRET',
        # 'verbose': True,  # for debug output
    })
    code = 'USDT'
    amount = 10
    convertedAmount = exchange.toEv(amount)

    try:
        response = exchange.privatePostAssetsFuturesSubAccountsTransfer({
            'amountEv': convertedAmount,
            'currency': code,
        })
        pprint(response)
    except Exception as e:
        print('privatePostAssetsFuturesSubAccountsTransfer() failed')
        print(e)


main_account_transfer()
# transfer_between_main_and_sub_accounts()
# sub_account_transfer()
# sub_swap_to_main_swap()
 
```