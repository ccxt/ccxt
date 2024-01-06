import os
import sys


root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

from asyncio import run, sleep, gather
import ccxt.pro

async def watch_ticker_loop(exchange):
    try:
        while True:
            ticker = await exchange.watch_ticker('BTC/USDT')
            print('ticker received')
    except Exception as e:
        print('Got exception ticker loop::' + str(e))


async def watch_order_book_for_symbols_loop(exchange):
    try:
        while True:
            trades = await exchange.watch_trades_for_symbols(['BTC/USDT', 'ETH/USDT', 'LTC/USDT'])
            print('trades received')
    except Exception as e:
        print('Got exception inside loop::' + str(e))


async def close_after(exchange, ms):
    await sleep(ms)
    await exchange.close()



async def test_close():
    exchange = ccxt.pro.binance()
    # exchange.verbose = True
    # --------------------------------------------
    print('Testing exchange.close(): No future awaiting, should close with no errors')
    await exchange.watch_ticker('BTC/USD')
    print('ticker received')
    await exchange.close()

    print('PASSED - exchange closed with no errors')
    # --------------------------------------------
    print('Testing exchange.close(): watchTicker')
    await gather(close_after(exchange, 5), watch_ticker_loop(exchange))

    # --------------------------------------------
    print('Test exchange.close(): Call watch_multiple unhandled futures are canceled')
    await gather(close_after(exchange, 5), watch_order_book_for_symbols_loop(exchange))


    exit(0)


run(test_close())