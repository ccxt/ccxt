# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def fetch_balance_n_times(code, account, n):
    exchange_class = getattr(ccxt, account['exchange_id'])
    exchange = exchange_class(account['params'])
    for i in range(0, n):
        balance = await exchange.fetch_balance()
        print(exchange.id, code, 'balance:', balance[code])
    await exchange.close()


async def test():
    n = 10  # fetch 10 times
    code = 'BTC'
    accounts = [
        {'exchange_id': 'binance', 'params': {'id': 'Binance1', 'apiKey': 'YOUR_API_KEY_1', 'secret': 'YOUR_API_SECRET_1'}},
        {'exchange_id': 'binance', 'params': {'id': 'Binance2', 'apiKey': 'YOUR_API_KEY_2', 'secret': 'YOUR_API_SECRET_2'}},
    ]
    coroutines = [fetch_balance_n_times(code, account, n) for account in accounts]
    await asyncio.gather(*coroutines)

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(test())
