import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from asyncio import run, sleep, gather
from ccxt.base.errors import ExchangeClosedByUser  # noqa E402
import ccxt.pro

async def watch_ticker_loop(exchange):
    try:
        while True:
            ticker = await exchange.watch_ticker('BTC/USDT')
            print('ticker received')
    except Exception as e:
        print(f"{e}")
        raise e


async def watch_trades_for_symbols_loop(exchange):
    try:
        while True:
            trades = await exchange.watch_trades_for_symbols(['BTC/USDT', 'ETH/USDT', 'LTC/USDT'])
            print('trades received')
    except Exception as e:
        raise e


async def close_after(exchange, ms):
    await sleep(ms)
    await exchange.close()


async def test_close():
    exchange = ccxt.pro.binance()
    # exchange.verbose = True
    # --------------------------------------------
    print('---- Testing exchange.close(): No future awaiting, should close with no errors')
    await exchange.watch_ticker('BTC/USD')
    print('ticker received')
    await exchange.close()
    print('PASSED - exchange closed with no errors')
    # --------------------------------------------
    print('---- Testing exchange.close(): Open watch multiple, resolve, should close with no errors')
    await exchange.watch_trades_for_symbols(['BTC/USD', 'ETH/USD', 'LTC/USD'])
    print('ticker received')
    await exchange.close()
    print('PASSED - exchange closed with no errors')
    # --------------------------------------------
    print('---- Testing exchange.close(): Awaiting future should throw ClosedByUser')
    try:
        await gather(close_after(exchange, 4), watch_ticker_loop(exchange))
        assert False, "Expected Future rejected with ClosedByUser"
    except ExchangeClosedByUser:
        assert True
    except Exception as e:
        print(f"Unexpected exception: {e}")
        assert False
    # --------------------------------------------
    print('---- Testing exchange.close(): Call watch_multiple unhandled futures are canceled')
    try:
        await gather(close_after(exchange, 4), watch_trades_for_symbols_loop(exchange))
        assert False, "Expected ExchangeClosedByUser error"
    except ExchangeClosedByUser:
        assert True
    except Exception as e:
        print(f"Unexpected exception: {e}")
        assert False
    exit(0)


run(test_close())
