```python
import ccxt
import ccxt.pro
import asyncio

from pprint import pprint


async def print_balance(exchange, market_type):
    while True:
        try:
            balance = await exchange.watch_balance({'type': market_type})
            pprint(balance)
            print('balance of ' + market_type, balance)
            print(exchange.options[market_type])
        except ccxt.BaseError as e:
            print(type(e), e)
        except Exception as e:
            print(type(e), e)


async def main():
    exchange = ccxt.pro.binance({
        "apiKey": "",
        "secret": "",
        'enableRateLimit': True,
        'newUpdates': True,
    })
    # you must make an order a transfer first to the websocket to send updates
    try:
        await asyncio.gather(
            print_balance(exchange, 'future'),
            print_balance(exchange, 'delivery'),  # inverse futures settled in BTC
            print_balance(exchange, 'spot'),
        )
    finally:
        await exchange.close()


if __name__ == '__main__':
    asyncio.run(main())

```
