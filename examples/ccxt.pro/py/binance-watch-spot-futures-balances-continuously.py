# -*- coding: utf-8 -*-

from asyncio import run, gather
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.pro  # noqa: E402


print('CCXT Version:', ccxt.__version__)


async def print_balance_continuously(exchange):
    while True:
        try:
            print('-----------------------------------------------------------')
            await exchange.load_markets()
            balance = await exchange.watch_balance()
            print(exchange.iso8601(exchange.milliseconds()), exchange.id)
            for currency, value in balance['total'].items():
                print(value, currency)
        except Exception as e:
            print('-----------------------------------------------------------')
            print(exchange.iso8601(exchange.milliseconds()), exchange.id, type(e), e)
            await exchange.sleep(300000)  # sleep 5 minutes and retry


async def main():
    config = {
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    }
    exchange_ids = [
        'binance',
        'binanceusdm',
        'binancecoinm',
    ]
    exchanges = [getattr(ccxt.pro, exchange_id)(config) for exchange_id in exchange_ids]
    printing_loops = [print_balance_continuously(exchange) for exchange in exchanges]
    await gather(*printing_loops)
    closing_tasks = [exchange.close() for exchange in exchanges]
    await gather(*closing_tasks)


run(main())
