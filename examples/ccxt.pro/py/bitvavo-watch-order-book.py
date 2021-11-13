import ccxtpro
from asyncio import get_running_loop


print('CCXT Pro version', ccxtpro.__version__)


async def main(loop):
    exchange = ccxtpro.bitvavo({
        'enableRateLimit': True,
        'asyncio_loop': loop,
    })
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


loop = get_running_loop()
run(main(loop))