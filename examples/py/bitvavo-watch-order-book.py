import ccxt.pro
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run


print('CCXT Pro version', ccxt.pro.__version__)


async def main():
    exchange = ccxt.pro.bitvavo()
    await exchange.load_markets()
    exchange.verbose = True
    symbol = 'BTC/EUR'
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            print(orderbook['nonce'], symbol, orderbook['asks'][0], orderbook['bids'][0])
        except Exception as e:
            print(type(e).__name__, str(e))
            break
    await exchange.close()


run(main())
