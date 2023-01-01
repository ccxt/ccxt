# -*- coding: utf-8 -*-

from asyncio import run, gather
import ccxt.pro


print('CCXT Version:', ccxt.__version__)


async def exchange_loop(exchange_id, symbols):
    exchange = getattr(ccxt.pro, exchange_id)()
    markets = await exchange.load_markets()
    await gather(*[watch_ticker_loop(exchange, symbol) for symbol in symbols])
    await exchange.close()


async def watch_ticker_loop(exchange, symbol):
    # exchange.verbose = True  # uncomment for debugging purposes if necessary
    while True:
        try:
            ticker = await exchange.watch_ticker(symbol)
            now = exchange.milliseconds()
            print(exchange.iso8601(now), exchange.id, symbol, 'bid:', ticker['bid'], 'ask:', ticker['ask'], 'last:', ticker['last'], 'on', ticker['datetime'])
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            break  # you can break just this one loop if it fails


async def main():
    exchanges = {
        'binance': [ 'BTC/USDT', 'ETH/USDT' ],
        'ftx': [ 'BTC/USD', 'ETH/USD' ],
    }
    loops = [exchange_loop(exchange_id, symbols) for exchange_id, symbols in exchanges.items()]
    await gather(*loops)


run(main())
