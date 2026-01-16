- [Async Tickers](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


def get_active_symbols(exchange):
    return [symbol for symbol in exchange.symbols if is_active_symbol(exchange, symbol)]


def is_active_symbol(exchange, symbol):
    return ('.' not in symbol) and (('active' not in exchange.markets[symbol]) or (exchange.markets[symbol]['active']))


async def fetch_ticker(exchange, symbol):
    ticker = await exchange.fetchTicker(symbol)
    print(exchange.id, symbol, ticker)
    return ticker


async def fetch_tickers(exchange):
    await exchange.load_markets()
    print(exchange.id, 'fetching all tickers by simultaneous multiple concurrent requests')
    symbols_to_load = get_active_symbols(exchange)
    input_coroutines = [fetch_ticker(exchange, symbol) for symbol in symbols_to_load]
    tickers = await asyncio.gather(*input_coroutines, return_exceptions=True)
    for ticker, symbol in zip(tickers, symbols_to_load):
        if not isinstance(ticker, dict):
            print(exchange.id, symbol, 'error')
        else:
            print(exchange.id, symbol, 'ok')
    print(exchange.id, 'fetched', len(list(tickers)), 'tickers')


asyncio.run(fetch_tickers(ccxt.bitfinex()))
 
```