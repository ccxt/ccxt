import ccxt.pro
from asyncio import run, gather


print('CCXT Pro version', ccxt.pro.__version__)


async def watch_order_book(exchange, symbol):
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            datetime = exchange.iso8601(exchange.milliseconds())
            print(datetime, orderbook['nonce'], symbol, orderbook['asks'][0], orderbook['bids'][0])
        except Exception as e:
            print(type(e).__name__, str(e))
            break


async def reload_markets(exchange, delay):
    while True:
        try:
            await exchange.sleep(delay)
            markets = await exchange.load_markets(True)
            datetime = exchange.iso8601(exchange.milliseconds())
            print(datetime, 'Markets reloaded')
        except Exception as e:
            print(type(e).__name__, str(e))
            break


async def main():
    exchange = ccxt.pro.binance()
    await exchange.load_markets()
    # exchange.verbose = True
    symbol = 'BTC/USDT'
    delay = 60000  # every minute = 60 seconds = 60000 milliseconds
    loops = [watch_order_book(exchange, symbol), reload_markets(exchange, delay)]
    await gather(*loops)
    await exchange.close()


run(main())
