import ccxtpro
from asyncio import get_event_loop

print('CCXT Pro Version:', ccxtpro.__version__)

async def main(loop):
    exchange = ccxtpro.binance({
        'asyncio_loop': loop,
        'enableRateLimit': True,
        'options': {
            'defaultType': 'future',  # spot, margin, future, delivery
        },
    })
    symbol = 'BTC/USDT'
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            print(exchange.iso8601(exchange.milliseconds()), exchange.id, symbol, 'ask:', orderbook['asks'][0], 'bid:', orderbook['bids'][0])
        except Exception as e:
            print(type(e).__name__, str(e))
            break
    await exchange.close()

loop = get_event_loop()
loop.run_until_complete(main(loop))