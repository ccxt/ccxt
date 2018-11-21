# -*- coding: utf-8 -*-

from aiocfscrape import CloudflareScraper
import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


def print_supported_exchanges():
    print('Supported exchanges:')
    print(', '.join(ccxt.exchanges))


async def test(id):

    print('Instantiating ' + id + ' exchange')

    session = CloudflareScraper(loop=asyncio.get_event_loop())

    # instantiate the exchange by id
    exchange = getattr(ccxt, id)({
        'timeout': 20000,
        'session': session,
    })

    markets = None

    try:

        # load all markets from the exchange
        markets = await exchange.load_markets()

    except ccxt.BaseError as e:

        print(type(e).__name__, str(e))
        print('Failed.')

    await exchange.close()
    await session.close()

    return markets


if __name__ == '__main__':

    try:

        id = sys.argv[1]  # get exchange id from command line arguments

        # check if the exchange is supported by ccxt
        exchange_found = id in ccxt.exchanges

        if exchange_found:

            print(asyncio.get_event_loop().run_until_complete(test(id)))

        else:

            print('Exchange ' + id + ' not found')
            print_supported_exchanges()

    except Exception as e:
        print('[' + type(e).__name__ + ']', str(e))
        print('Usage: python ' + sys.argv[0] + ' id')
        print_supported_exchanges()
