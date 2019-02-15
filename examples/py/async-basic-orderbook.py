# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test():

    exchange = ccxt.okex({

        # 'proxy': 'https://cors-anywhere.herokuapp.com/',
        # 'origin': 'foobar',  # when using CORS proxies, set this to some random string

        'enableRateLimit': True,  # required accoding to the Manual
    })

    try:
        orderbook = await exchange.fetch_order_book('BTC/USDT')
        await exchange.close()
        return orderbook
    except ccxt.BaseError as e:
        print(type(e).__name__, str(e), str(e.args))
        raise e


if __name__ == '__main__':
    print(asyncio.get_event_loop().run_until_complete(test()))
