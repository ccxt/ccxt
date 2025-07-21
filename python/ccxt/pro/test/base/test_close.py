import os
import sys
import asyncio

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from asyncio import sleep, gather
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


async def test_ws_close():
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
    except asyncio.CancelledError:
        assert True
    except Exception as e:
        print(f"Unexpected exception: {e}")
        assert False
    await exchange.close() # Added to ensure close finishes correctly
    # --------------------------------------------
    print('---- Testing exchange.close(): Call watch_multiple unhandled futures are canceled')
    try:
        await gather(close_after(exchange, 4), watch_trades_for_symbols_loop(exchange))
        assert False, "Expected ExchangeClosedByUser error"
    except asyncio.CancelledError:
        assert True
    except Exception as e:
        print(f"Unexpected exception: {e}")
        assert False
    await exchange.close()
    # --------------------------------------------
    await test_cancelled_task_no_invalid_state(exchange)

async def test_cancelled_task_no_invalid_state(exchange):
    """
    Connects to a real exchange, starts two watch_ticker tasks, cancels one,
    and ensures no InvalidStateError or unhandled exception occurs when messages are received after cancellation.
    """
    print('---- Testing cancelled task does not raise InvalidStateError')
    symbols = ['BTC/USDT', 'ETH/USDT']
    received = {s: 0 for s in symbols}
    errors = []

    async def watch_ticker_task(symbol):
        try:
            while True:
                ticker = await exchange.watch_ticker(symbol)
                received[symbol] += 1
                print(f"[TICKER] {symbol} received: {ticker['datetime'] if 'datetime' in ticker else ticker}")
        except asyncio.CancelledError:
            print(f"[CANCELLED] {symbol} task cancelled")
        except Exception as e:
            print(f"[ERROR] {symbol}: {e}")
            errors.append(e)

    # Start both tasks
    task_btc = asyncio.create_task(watch_ticker_task(symbols[0]))
    task_eth = asyncio.create_task(watch_ticker_task(symbols[1]))

    # Let both run for a bit
    await asyncio.sleep(5)

    # Cancel ETH/USDT task
    print("Cancelling ETH/USDT task...")
    task_eth.cancel()
    try:
        await task_eth
    except asyncio.CancelledError:
        print("ETH/USDT task cancelled and awaited")

    # Let BTC/USDT keep running, and see if any errors occur for ETH/USDT
    await asyncio.sleep(5)

    # Check for InvalidStateError or any unhandled exception
    for err in errors:
        assert not isinstance(err, asyncio.InvalidStateError), f"InvalidStateError occurred: {err}"
    print("No InvalidStateError occurred after cancelling ETH/USDT task.")

    # Cleanup
    task_btc.cancel()
    await exchange.close()

asyncio.run(test_ws_close())
