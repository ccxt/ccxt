# -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.okex({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # okex requires this: https://github.com/ccxt/ccxt/wiki/Manual#authentication
        'password': 'YOUR_API_PASSWORD',
        # 'verbose': True,  # for debug output
    })
    await exchange.load_markets()
    symbol = 'BTC/USDT'  # okex requires a symbol for borrowing
    code = 'BTC'
    amount = 1
    currency = exchange.currency(code)
    market = exchange.market(symbol)
    try:
        response = await exchange.margin_post_accounts_borrow({
            # uncomment to set a user-defined order id for this borrow
            # this may be handy if you're going to repay it later by this id
            # 'client_oid': exchange.uuid(),  # can be any unique string
            'instrument_id': market['id'],
            'currency': currency['id'],
            'amount': exchange.currency_to_precision(code, amount)
        })
        pprint(response)
    except ccxt.InsufficientFunds as e:
        print('margin_post_accounts_borrow() failed – not enough funds')
        print(e)
    except Exception as e:
        print('margin_post_accounts_borrow() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
