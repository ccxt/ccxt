# -*- coding: utf-8 -*-

import os
import sys
from asyncio import run
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402
# or
# import ccxtpro as ccxt  # if you're using ccxtpro


# WARNING!
# This example measures the round-trip time when placing orders with an exchange
# In order to measure the speed of requests it disables the rate-limiting
# Disabling the rate-limiter is required to do an accurate measurement
# If you keep running without a rate limiter for a long time the exchange will ban you
# In a live production system always use either the built-in rate limiter or make your own


async def main():

    # the exchange instance has to be reused
    # do not recreate the exchange before each call!

    exchange = ccxt.binance({

        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_API_SECRET',

        # 'uid': 'YOUR_UID',  # some exchanges require this
        # 'password': 'YOUR_API_PASSWORD',  # some exchanges require this

        # if you do not rate-limit your requests the exchange can ban you!
        'enableRateLimit': False,  # https://github.com/ccxt/ccxt/wiki/Manual#rate-limit

    })

    await exchange.load_markets()  # https://github.com/ccxt/ccxt/wiki/Manual#loading-markets

    # exchange.verbose = True  # uncomment for debugging purposes if needed

    symbol = 'BTC/USDC'
    market = exchange.market(symbol)
    ticker = await exchange.fetch_ticker(symbol)

    amount = market['limits']['amount']['min']

    # we will place limit buy order at 3/4 of the price to make sure they're not triggered

    price = ticker['last'] * 0.8
    amount = round(market['limits']['cost']['min'] / price, 4)

    results = []

    for i in range(0, 10):
        started = exchange.milliseconds()
        order = await exchange.create_order(symbol, 'limit', 'buy', amount, price)
        ended = exchange.milliseconds()
        elapsed = ended - started
        results.append(elapsed)
        await exchange.cancel_order(order['id'], order['symbol'])
        pprint(order)
        pprint(results)


    rtt = int(sum(results) / len(results))
    print('Successfully tested 10 orders, the average round-trip time per order is', rtt, 'milliseconds')

    await exchange.close()


run(main())
