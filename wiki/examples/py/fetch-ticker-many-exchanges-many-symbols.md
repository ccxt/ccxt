- [Fetch Ticker Many Exchanges Many Symbols](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from asyncio import gather, run


import ccxt.async_support as ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange_ids = ['binance', 'okx', 'gate', 'huobi', 'bitget']
symbols = ['BTC/USDT', 'ETH/USDT', 'LTC/USDT', 'XRP/USDT']
from asyncio import gather, run


async def fetch_price(exchange, symbol):
    try:
        ticker = await exchange.fetch_ticker(symbol)
        return [
            symbol,
            # we use last traded price for this example
            # https://github.com/ccxt/ccxt/wiki/Manual#price-tickers
            # https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure
            ticker['last'],
            'at',
            exchange.id
        ]
    except Exception as e:
        print(type(e).__name__, str(e))
        return [symbol, 'not available at', exchange.id]


async def compare_symbol(exchanges, symbol):
    coroutines = [fetch_price(exchange, symbol) for exchange in exchanges]
    results = await gather(*coroutines)
    print('')  # spacing line
    for result in results:
        print(*result)
    print('')  # spacing line


async def main():
    exchanges = [getattr(ccxt, exchange_id)() for exchange_id in exchange_ids]
    # https://github.com/ccxt/ccxt/wiki/Manual#loading-markets
    load_markets = [exchange.load_markets() for exchange in exchanges]
    print('Loading markets...')
    await gather(*load_markets)
    print('Done loading markets.')
    print('Loading tickers...')
    coroutines = [compare_symbol(exchanges, symbol) for symbol in symbols]
    await gather(*coroutines)
    close_all = [exchange.close() for exchange in exchanges]
    await gather(*close_all)



if __name__ == '__main__':
    run(main())
 
```