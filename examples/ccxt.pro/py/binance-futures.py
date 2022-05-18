import ccxtpro
from asyncio import run

print('CCXT Pro Version:', ccxtpro.__version__)

async def main():
    exchange = ccxtpro.binance({
        'options': {
            'defaultType': 'future',  # spot, margin, future, delivery
        },
    })
    # or
    # exchange = ccxtpro.binanceusdm()
    # or
    # exchange = ccxtpro.binancecoinm()
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
