import ccxt.pro
from asyncio import run


print('CCXT Pro version', ccxt.pro.__version__)


async def main():
    exchange = ccxt.pro.okx({
        'options': {
            'watchOrderBook': {
                'depth': 'bbo-tbt',  # tick-by-tick best bidask
            },
        },
    })
    markets = await exchange.load_markets()
    # exchange.verbose = True  # uncomment for debugging purposes if necessary
    symbol = 'BTC/USDT'
    while True:
        try:
            # -----------------------------------------------------------------
            # use this:
            # orderbook = await exchange.watch_order_book(symbol)
            # print(orderbook['datetime'], symbol, orderbook['asks'][0], orderbook['bids'][0])
            # -----------------------------------------------------------------
            # or this:
            ticker = await exchange.watch_ticker(symbol)
            print(ticker['datetime'], symbol, [ticker['ask'], ticker['askVolume']], [ticker['bid'], ticker['bidVolume']])
            # -----------------------------------------------------------------
        except Exception as e:
            print(type(e).__name__, str(e))
            break
    await exchange.close()


run(main())
