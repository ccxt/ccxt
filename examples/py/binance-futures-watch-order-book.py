import ccxt.pro
from asyncio import run


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

