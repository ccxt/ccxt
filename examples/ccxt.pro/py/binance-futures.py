import ccxt.async_support as ccxt
from asyncio import run

print('CCXT Version:', ccxt.__version__)

async def main():
    exchange = ccxt.binance({
        'options': {
            'defaultType': 'future',  # spot, margin, future, delivery
        },
    })
    # or
    # exchange = ccxt.binanceusdm()
    # or
    # exchange = ccxt.binancecoinm()
    symbol = 'BTC/USDT'
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            print(exchange.iso8601(exchange.milliseconds()), exchange.id, symbol, 'ask:', orderbook['asks'][0], 'bid:', orderbook['bids'][0])
        except Exception as e:
            print(type(e).__name__, str(e))
            break
    await exchange.close()


run(main())
