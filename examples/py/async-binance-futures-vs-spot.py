# -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def load(exchange, symbol, type='spot'):
    exchange.options['defaultType'] = type
    await exchange.load_markets(True)
    try:
        return {
            'balance': await exchange.fetch_balance(),
            # you actually want pagination here
            # https://github.com/ccxt/ccxt/wiki/Manual#pagination
            # but this will do as an example, tweak it for your needs
            'orders': await exchange.fetch_orders(symbol),
            'open orders': await exchange.fetch_open_orders(symbol),
            'closed orders': await exchange.fetch_closed_orders(symbol),
            'my trades': await exchange.fetch_my_trades(symbol),
        }
    except Exception as e:
        print('\n\nError in load() with type =', type, '-', e)
        raise e


async def run():
    exchange = ccxt.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'enableRateLimit': True
    })
    symbol = 'BTC/USDT'
    everything = {
        'spot': await load(exchange, symbol, 'spot'),
        'future': await load(exchange, symbol, 'future'),
    }
    await exchange.close()
    return everything


if __name__ == '__main__':
    pprint(asyncio.get_event_loop().run_until_complete(run()))
