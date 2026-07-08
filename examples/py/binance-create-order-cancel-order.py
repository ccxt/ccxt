import ccxt.pro
from pprint import pprint
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run


print('CCXT Version:', ccxt.__version__)


async def main():
    exchange = ccxt.pro.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })

    markets = await exchange.load_markets()

    # exchange.verbose = True  # uncomment for debugging purposes if necessary

    symbol = 'ETH/BTC'
    type = 'limit'  # or 'market'
    side = 'sell'  # or 'buy'
    amount = 1.0
    price = 0.060154  # or None

    order = await exchange.create_order(symbol, type, side, amount, price)
    canceled = await exchange.cancel_order(order['id'], order['symbol'])

    pprint(canceled)

    await exchange.close()


run(main())

