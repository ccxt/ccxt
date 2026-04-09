# -*- coding: utf-8 -*-

import os
import sys
from asyncio import run

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')


async def test():
    import ccxt.async_support as ccxt

    print('CCXT Version', ccxt.__version__)

    # local sandbox keys
    exchange = ccxt.hollaex({
        'apiKey': "YOUR_SANDBOX_API_KEY",
        'secret': "YOUR_SANDBOX_SECRET",
    })

    exchange.set_sandbox_mode(True)

    markets = await exchange.load_markets()

    exchange.verbose = True

    balance = await exchange.fetch_balance()
    print(f"balance: {balance}")

    await exchange.close()


run(test())