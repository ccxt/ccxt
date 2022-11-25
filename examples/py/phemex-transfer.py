# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

# -----------------------------------------------------------------------------

print('CCXT Version:', ccxt.__version__)

# -----------------------------------------------------------------------------


# Example 1: Transfer from spot main-account to future main-account
def main_account_transfer():
    exchange = ccxt.phemex({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # 'verbose': True,  # for debug output
    })
    code = 'USDT'
    amount = 10
    fromAccount = 'spot'
    toAccount = 'future'
    params = {}

    try:
        transfer = exchange.transfer(code, amount, fromAccount, toAccount, params=params)
        pprint(transfer)
    except Exception as err:
        print(err)


# Example 2: Transfer from main-account to sub-account (Requires the main and sub-account UID's found on the account/sub-accounts page on Phemex)
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
    params = {}

    try:
        transfer = exchange.transfer(code, amount, fromAccount, toAccount, params=params)
        pprint(transfer)
    except Exception as err:
        print(err)


# Example 3: Transfer from spot sub-account to future sub-account (Requires a sub-account API key and secret)
def sub_account_transfer():
    exchange = ccxt.phemex({
        'apiKey': 'YOUR_SUB_ACCOUNT_API_KEY',
        'secret': 'YOUR_SUB_ACCOUNT_SECRET',
        # 'verbose': True,  # for debug output
    })
    code = 'USDT'
    amount = 10
    fromAccount = 'spot'
    toAccount = 'future'
    params = {}

    try:
        transfer = exchange.transfer(code, amount, fromAccount, toAccount, params=params)
        pprint(transfer)
    except Exception as err:
        print(err)


main_account_transfer()
# transfer_between_main_and_sub_accounts()
# sub_account_transfer()
