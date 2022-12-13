import ccxt
import ccxt.pro
import asyncio

from pprint import pprint

loop = asyncio.get_event_loop()


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
        'emableRateLimit': True,
        'newUpdates': True,
    })
    # you must make a an order a transfer first to the websocket to send updates
    asyncio.ensure_future(print_balance(exchange, 'future'))
    asyncio.ensure_future(print_balance(exchange, 'delivery'))  # inverse futures settled in BTC
    asyncio.ensure_future(print_balance(exchange, 'spot'))


asyncio.run(main())
asyncio.ensure_future(main())
loop.run_forever()

