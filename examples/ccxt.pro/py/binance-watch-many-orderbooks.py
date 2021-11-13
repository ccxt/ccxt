import ccxtpro
import asyncio

orderbooks = {}

def when_orderbook_changed(exchange_spot, symbol, orderbook):
    # this is a common handler function
    # it is called when any of the orderbook is updated
    # it has access to both the orderbook that was updated
    # as well as the rest of the orderbooks
    # ...................................................................
    print('-------------------------------------------------------------')
    print('Last updated:', exchange_spot.iso8601(exchange_spot.milliseconds()))
    # ...................................................................
    # print just one orderbook here
    # print(orderbook['datetime'], symbol, orderbook['asks'][0], orderbook['bids'][0])
    # ...................................................................
    # or print all orderbooks that have been already subscribed-to
    for symbol, orderbook in orderbooks.items():
        print(orderbook['datetime'], symbol, orderbook['asks'][0], orderbook['bids'][0])


async def watch_one_orderbook(exchange_spot, symbol):
    your_delay = 1000  # <-------------------------- 1000ms
    await exchange_spot.throttle(your_delay)
    while True:
        try:
            orderbook = await exchange_spot.watch_order_book(symbol)
            orderbooks[symbol] = orderbook
            when_orderbook_changed(exchange_spot, symbol, orderbook)
        except Exception as e:
            print(type(e).__name__, str(e))


async def watch_some_orderbooks(exchange_spot, symbol_list):
    loops = [watch_one_orderbook(exchange_spot, symbol) for symbol in symbol_list]
    # let them run, don't for all tasks cause they execute asynchronously
    # don't print here
    await asyncio.gather(*loops)


async def main():
    exchange_spot = ccxtpro.binance()
    await exchange_spot.load_markets()
    await watch_some_orderbooks(exchange_spot, ['ZEN/USDT', 'RUNE/USDT', 'AAVE/USDT', 'SNX/USDT'])
    await exchange_spot.close()


loop = asyncio.get_event_loop()
loop.run_until_complete(main())
