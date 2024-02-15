import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from asyncio import run, sleep, gather
from ccxt.base.errors import ExchangeClosedByUser  # noqa E402
import ccxt.pro

async def watch_ticker_loop(exchange):
    while True:
        ticker = await exchange.watch_ticker('BTC/USDT')
        print('ticker received')


async def watch_order_book_for_symbols_loop(exchange):
    while True:
        trades = await exchange.watch_trades_for_symbols(['BTC/USDT', 'ETH/USDT', 'LTC/USDT'])
        print('trades received')


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
    print('Testing exchange.close(): Open watch multiple, resolve, should close with no errors')
    await exchange.watch_trades_for_symbols(['BTC/USD', 'ETH/USD', 'LTC/USD'])
    print('ticker received')
    await exchange.close()
    print('PASSED - exchange closed with no errors')
    # --------------------------------------------
    print('Testing exchange.close(): Awaiting future should throw ClosedByUser')
    try:
        await gather(close_after(exchange, 5), watch_ticker_loop(exchange))
    except Exception as e:
        if isinstance(e, ExchangeClosedByUser):
            print('PASSED - future rejected with ClosedByUser')
        else:
            raise e
    # --------------------------------------------
    print('Test exchange.close(): Call watch_multiple unhandled futures are canceled')
    try:
        await gather(close_after(exchange, 5), watch_order_book_for_symbols_loop(exchange))
    except Exception as e:
        if isinstance(e, ExchangeClosedByUser):
            print('PASSED - future rejected with ClosedByUser')
        else:
            raise e
    exit(0)


run(test_close())
