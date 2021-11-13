# -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def main(asyncio_loop):
    exchange = ccxt.okex({
        'asyncio_loop': asyncio_loop,
        'enableRateLimit': True,
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
        response = await exchange.margin_post_accounts_repayment({
            # https://github.com/ccxt/ccxt/blob/master/examples/py/async-okex-margin-borrow.py
            # uncomment to repay a particular borrow by id
            # 'borrow_id': 'YOUR_BORROW_ID_RECEIVED_FROM_BORROWING',
            # uncomment to set a user-defined order id for this repayment
            # 'client_oid': 'YOUR_CLIENT_ORDER_ID_FROM_BORROWING',
            # one of borrow_id or client_oid is required!
            'instrument_id': market['id'],
            'currency': currency['id'],
            'amount': exchange.currency_to_precision(code, amount)
        })
        pprint(response)
    except ccxt.InsufficientFunds as e:
        print('margin_post_accounts_repayment() failed – not enough funds')
        print(e)
    except Exception as e:
        print('margin_post_accounts_repayment() failed')
        print(e)
    await exchange.close()

if __name__ == '__main__':
    asyncio_loop = asyncio.get_event_loop()
    asyncio_loop.run_until_complete(main(asyncio_loop))
