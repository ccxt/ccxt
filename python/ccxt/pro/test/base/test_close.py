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
    await exchange.watch_ticker('BTC/USDT')
    print('ticker received')
    await exchange.close()
    print('PASSED - exchange closed with no errors')
    # --------------------------------------------
    print('---- Testing exchange.close(): Open watch multiple, resolve, should close with no errors')
    await exchange.watch_trades_for_symbols(['BTC/USDT', 'ETH/USDT', 'LTC/USDT'])
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
    await exchange.close()  # Added to ensure close finishes correctly
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
    # --------------------------------------------
    await test_unwatch_tickers_after_cancellation(exchange)
    # --------------------------------------------
    await test_no_memory_leak()

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

async def test_unwatch_tickers_after_cancellation(exchange):
    """
    Tests the specific case where un_watch_tickers() is called after cancelling tasks,
    which was causing InvalidStateError. This reproduces the user's reported issue, but for tickers.
    """
    print('---- Testing un_watch_tickers() after task cancellation does not raise InvalidStateError')

    async def watch_tickers_task(symbols):
        try:
            while True:
                tickers = await exchange.watch_tickers(symbols)
                print(f"[TICKERS] {symbols} received: {list(tickers.keys()) if hasattr(tickers, 'keys') else tickers}")
        except asyncio.CancelledError:
            print(f"[CANCELLED] {symbols} tickers task cancelled")
        except Exception as e:
            assert False, (f"[ERROR] {symbols} tickers: {e}")

    # Start both tasks for different symbols
    print("Starting BTC/USDT tickers watch...")
    task_btc = asyncio.create_task(watch_tickers_task(['BTC/USDT']))
    print("Starting ETH/USDT tickers watch...")
    task_eth = asyncio.create_task(watch_tickers_task(['ETH/USDT']))

    # Let both run for a bit
    print("Letting tasks run for 5 seconds...")
    await asyncio.sleep(5)

    # Cancel ETH/USDT task
    print("Cancelling ETH/USDT task...")
    task_eth.cancel()
    try:
        await task_eth
    except asyncio.CancelledError:
        print("ETH/USDT task cancelled and awaited")

    # Let BTC/USDT keep running
    print("Letting BTC/USDT task continue for 5 seconds...")
    await asyncio.sleep(5)

    # This is the critical part - calling un_watch_tickers() after cancellation
    print("Calling un_watch_tickers() after task cancellation...")
    try:
        await exchange.un_watch_tickers()
        print("un_watch_tickers() completed successfully")
    except asyncio.InvalidStateError as e:
        assert False, f"InvalidStateError occurred: {e}"
    except Exception as e:
        print(f"Unexpected exception during un_watch_tickers(): {e}")

    # Let it run a bit more to see if any errors occur
    print("Letting it run for 5 more seconds...")
    await asyncio.sleep(5)

    # Cleanup
    task_btc.cancel()
    await exchange.close()
    print("PASSED - un_watch_tickers() after cancellation test completed successfully")

async def test_no_memory_leak():
    """
    Test that Future.race() does not cause memory leaks when watching multiple symbols.

    This test verifies the fix for the memory leak where the old implementation
    created unbounded asyncio tasks (601,706 tasks/hour) that were never cleaned up.

    The new implementation should maintain a stable task count.
    """
    print('---- Testing no memory leak in watch operations')

    exchange = ccxt.pro.binance()

    # Get baseline task count
    initial_tasks = len(asyncio.all_tasks())
    print(f"Initial asyncio tasks: {initial_tasks}")

    # Run multiple concurrent watch operations to better simulate production load
    # where many symbols are watched simultaneously
    duration_seconds = 30
    symbols = ['BTC/USDT', 'ETH/USDT', 'LTC/USDT', 'XRP/USDT', 'ADA/USDT',
               'DOGE/USDT', 'SOL/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT']

    print(f"Running concurrent watch operations for {duration_seconds} seconds across {len(symbols)} symbols...")

    start_time = asyncio.get_event_loop().time()
    max_tasks_seen = initial_tasks
    iterations = 0

    async def watch_continuously(symbol):
        """Continuously watch a symbol to create sustained load"""
        nonlocal iterations
        while asyncio.get_event_loop().time() - start_time < duration_seconds:
            try:
                await exchange.watch_ticker(symbol)
                iterations += 1
            except Exception as e:
                # Connection errors are ok, we're testing memory leak not connectivity
                if 'NetworkError' not in str(type(e).__name__):
                    pass  # Ignore errors during test

    # Create concurrent watch tasks for all symbols (simulates production)
    watch_tasks = [asyncio.create_task(watch_continuously(symbol)) for symbol in symbols]

    # Monitor task count while running
    async def monitor_tasks():
        nonlocal max_tasks_seen
        while asyncio.get_event_loop().time() - start_time < duration_seconds:
            await asyncio.sleep(5)
            current_tasks = len(asyncio.all_tasks())
            max_tasks_seen = max(max_tasks_seen, current_tasks)
            elapsed = asyncio.get_event_loop().time() - start_time
            task_growth = current_tasks - initial_tasks
            print(f"  [{elapsed:.1f}s] Tasks: {current_tasks} (growth: {task_growth}), Iterations: {iterations}")

    monitor_task = asyncio.create_task(monitor_tasks())

    # Wait for test to complete
    await asyncio.sleep(duration_seconds)

    # Cancel all watch tasks
    for task in watch_tasks:
        task.cancel()
    monitor_task.cancel()

    # Wait for cancellation
    await asyncio.gather(*watch_tasks, monitor_task, return_exceptions=True)

    # Give event loop time to clean up
    await asyncio.sleep(0.5)

    # Check task count after operations
    final_tasks = len(asyncio.all_tasks())
    task_growth = final_tasks - initial_tasks
    max_growth = max_tasks_seen - initial_tasks

    print(f"Final asyncio tasks: {final_tasks}")
    print(f"Task growth: {task_growth}")
    print(f"Max tasks seen during test: {max_tasks_seen} (growth: {max_growth})")
    print(f"Total iterations: {iterations}")

    # Clean up
    await exchange.close()

    # The old implementation would accumulate tasks equal to the number of concurrent operations
    # With 10 symbols being watched continuously, we'd expect significant growth
    max_acceptable_growth = 40

    if max_growth > max_acceptable_growth:
        raise AssertionError(
            f"Memory leak detected! Max task growth was {max_growth} "
            f"(expected < {max_acceptable_growth}). "
            f"The old implementation creates tasks that accumulate under concurrent load."
        )

    print(f"PASSED - No memory leak detected (max growth: {max_growth} < {max_acceptable_growth})")

asyncio.run(test_ws_close())
