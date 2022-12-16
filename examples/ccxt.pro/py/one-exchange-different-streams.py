import ccxt.pro
import asyncio


async def watch_order_book(exchange, symbol):
    while True:
        orderbook = await exchange.watch_order_book(symbol)
        print(orderbook['datetime'], symbol, orderbook['asks'][0], orderbook['bids'][0])


async def watch_trades(exchange, symbol):
    while True:
        trades = await exchange.watch_trades(symbol)
        last = trades[-1]
        print(last['datetime'], last['price'], last['amount'])


async def main():
    exchange = ccxt.pro.bitstamp()
    await exchange.load_markets()
    symbol = 'BTC/USD'
    while True:
        try:
            loops = [
                watch_order_book(exchange, symbol),
                watch_trades(exchange, symbol)
            ]
            await asyncio.gather(*loops)
        except Exception as e:
            print(type(e).__name__, str(e))
            break
    await exchange.close()


asyncio.run(main())
