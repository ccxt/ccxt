```python
import ccxt.pro
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run


async def main():
    exchange = ccxt.pro.binance({
        'options': {
            'defaultType': 'future',
        },
    })
    symbol = 'BTC/USDT'
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            print(orderbook['bids'][0], orderbook['asks'][0])
        except Exception as e:
            print(type(e).__name__, str(e))
    await exchange.close()


run(main())


```
