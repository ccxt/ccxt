# -*- coding: utf-8 -*-

from asyncio import gather, run
import ccxt.pro
from pprint import pprint


async def watch_ticker_continuously(exchange, symbol):
    filename = exchange.id + '-' + symbol.replace('/', '-') + '.csv'
    print('Watching', exchange.id, symbol, filename)
    keys = ['index', 'exchange', 'symbol', 'timestamp', 'open', 'high', 'low', 'close', 'baseVolume']
    with open(filename, 'w') as file:
        file.write(','.join(keys) + "\n")
    index = 0
    while True:
        try:
            ticker = await exchange.watch_ticker(symbol)
            values = [str(index), exchange.id] + [str(ticker[key]) for key in keys[2:]]
            print(*values)
            with open(filename, 'a') as file:
                file.write(','.join(values) + "\n")
            index += 1
        except Exception as e:
            print(e)


async def watch_tickers_continuously(exchange_id, overrides, symbols):
    exchange_class = getattr(ccxt.pro, exchange_id)
    exchange = exchange_class(overrides)
    coroutines = [watch_ticker_continuously(exchange, symbol) for symbol in symbols]
    await gather(*coroutines)
    await exchange.close()


async def main():
    exchanges = {
        'binance': {'options': {'defaultType': 'future'}},
        'huobipro': {}
    }
    symbols = ['BTC/USDT', 'ETH/USDT', 'LTC/USDT', 'XRP/USDT', 'BCH/USDT']
    coroutines = [watch_tickers_continuously(exchange_id, exchanges[exchange_id], symbols) for exchange_id in exchanges.keys()]
    return await gather(*coroutines)


run(main())
