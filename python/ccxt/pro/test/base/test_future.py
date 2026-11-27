import asyncio
import os
import sys

# Assuming the structure of test_shared_methods based on common unittest methods

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from ccxt import ExchangeClosedByUser
from ccxt.async_support import Exchange
from ccxt.async_support.base.ws.future import Future
from ccxt.async_support.base.ws.client import Client

# Helper functions
async def resolve_later(future, result, delay):
    await asyncio.sleep(delay)
    future.resolve(result)

async def cancel_later(future, delay):
    await asyncio.sleep(delay)
    future.cancel()

async def reject_later(future, err, delay):
    await asyncio.sleep(delay)
    future.reject(err)

async def test_resolve_before():
    print("test_resolve")
    future = Future()
    expected_result = "test"
    future.resolve(expected_result)
    assert future.done(), "Future is not marked as done"
    assert future.result() == expected_result, f"Expected result '{expected_result}', got '{future.result()}'"

async def test_reject():
    print("test_reject")
    future = Future()
    test_exception = Exception("test error")
    future.reject(test_exception)
    assert future.done(), "Future is not marked as done"
    try:
        future.result()
        assert False, "Expected an exception but none was raised"
    except Exception as e:
        assert str(e) == "test error", f"Expected 'test error', got '{str(e)}'"

async def test_race_success_before():
    print("test_race_success")
    future1 = Future()
    future2 = Future()
    race_future = Future.race([future1, future2])
    future1.resolve("first")
    result = await race_future
    future2.cancel()
    assert result == "first", f"Expected 'first', got '{result}'"

async def test_race_success_after():
    print("test_race_success")
    future1 = Future()
    future2 = Future()
    race_future = Future.race([future1, future2])
    asyncio.create_task(resolve_later(future1, "first", 0.01))
    result = await race_future
    future2.cancel()
    assert result == "first", f"Expected 'first', got '{result}'"

async def test_race_return_first_exception():
    print("test_race_return_first_exception")
    future1 = Future()
    race_future = Future.race([future1])
    future1.reject(Exception("Error in future1"))
    try:
        await race_future
        assert False, "Expected an exception but none was raised"
    except Exception as e:
        assert str(e) == "Error in future1", f"Expected 'Error in future1', got '{str(e)}'"

async def test_await_canceled_future():
    print("test_await_canceled_future")
    future = Future()
    try:
        future.cancel()
        await future
        assert False, "Expected an exception but none was raised"
    except asyncio.CancelledError as e:
        assert isinstance(e, asyncio.CancelledError), "Expected asyncio.CancelledError"

async def test_cancel():
    print("test_cancel")
    future = Future()
    asyncio.create_task(cancel_later(future, 0.1))
    try:
        await future
        assert False, "Expected an exception but none was raised"
    except asyncio.CancelledError as e:
        assert isinstance(e, asyncio.CancelledError), "Expected asyncio.CancelledError"

async def test_race_cancel():
    print("test_race_cancel")
    try:
        future1 = Future()
        future2 = Future()
        race_future = Future.race([future1, future2])
        race_future.cancel()
        future1.resolve("success")
        await race_future
        assert False, "Expected a cancelledError"
    except asyncio.CancelledError:
        assert True

async def test_race_mixed_outcomes():
    print("test_race_mixed_outcome")
    future1 = Future()
    future2 = Future()
    race_future = Future.race([future1, future2])
    future1.resolve("first")
    task = asyncio.create_task(reject_later(future2, Exception("Error in future2"), 0.1))
    result = await race_future
    assert result == "first", f"Expected 'first', got '{result}'"
    task.cancel()
    future2.cancel()

async def test_race_with_wait_for_timeout():
    print("test_race_with_wait_for_timeout")
    future1 = Future()

    task = asyncio.create_task(resolve_later(future1, "completed first", 2))

    # Attempt to race the futures with a timeout shorter than their resolution time
    try:
        race_future = Future.race([future1])
        await asyncio.wait_for(race_future, timeout=1)  # Timeout is set deliberately short
        assert False, "Expected a timeout but race_future completed"
    except asyncio.TimeoutError:
        # Expected outcome, the race_future should not complete within the timeout
        assert True
    await task

async def test_race_with_wait_for_completion():
    print("test_race_with_wait_for_completion")
    future1 = Future()
    future2 = Future()

    task = asyncio.create_task(resolve_later(future1, "completed first", 0.1))

    # Race the futures with a timeout longer than necessary
    try:
        race_future = Future.race([future1, future2])
        result = await asyncio.wait_for(race_future, timeout=1)
        assert result == "completed first", f"Unexpected race result: {result}"
    except asyncio.TimeoutError:
        assert False, "Did not expect a timeout"
    await task

async def test_race_with_precompleted_future():
    print("test_race_with_precompleted_future")
    future1 = Future()
    future2 = Future()
    future1.resolve("immediate success")
    # Immediately resolved future before race call
    race_future = Future.race([future1, future2])
    result = await race_future
    assert result == "immediate success", "Race did not correctly prioritize already completed future."

async def test_closed_by_user():
    print("test_closed_by_user")
    future1 = Future()
    future2 = Future()
    race_future = Future.race([future1, future2])
    task1 = asyncio.create_task(reject_later(future1, ExchangeClosedByUser(), 0.1))
    task2 = asyncio.create_task(reject_later(future2, ExchangeClosedByUser(), 0.1))
    try:
        await race_future
        assert False, "Expected an ExchangeClosedByUser"
    except ExchangeClosedByUser:
        assert True
        assert task1.done()
        assert task2.done()
    except Exception as e:
        assert False, f"Received Exception {e}"

async def test_race_broadcast_reject_no_unretrieved():
    # a failed handshake broadcast-rejects every raced future in one sweep,
    # the race must swallow the already-done losers or asyncio dumps
    # "Future exception was never retrieved" walls at gc,
    # see https://github.com/ccxt/ccxt/pull/29723
    print("test_race_broadcast_reject_no_unretrieved")
    import gc
    loop = asyncio.get_event_loop()
    complaints = []
    previous_handler = loop.get_exception_handler()
    loop.set_exception_handler(lambda l, context: complaints.append(context.get('message', '')))
    try:
        futures = [Future() for i in range(5)]
        raced = Future.race(futures)
        error = ExchangeClosedByUser('broadcast reject')
        for future in futures:
            future.reject(error)
        try:
            await asyncio.wait_for(raced, 1)
            assert False, "race should have rejected"
        except ExchangeClosedByUser:
            pass
        del raced
        del futures
        for i in range(3):
            gc.collect()
            await asyncio.sleep(0.05)
        unretrieved = [message for message in complaints if 'never retrieved' in message]
        assert len(unretrieved) == 0, f"broadcast reject leaked {len(unretrieved)} unretrieved exceptions"
    finally:
        loop.set_exception_handler(previous_handler)


async def test_race_precompleted_cancels_quiet_waiters():
    print("test_race_precompleted_cancels_quiet_waiters")
    for outcome in ('resolve', 'reject', 'cancel'):
        client = Client('wss://localhost', None, None, None, None)
        if outcome == 'reject':
            client.reject(ExchangeClosedByUser('replayed rejection'), 'active')
        for i in range(100):
            winner = client.future('active')
            quiet = client.future('quiet')
            shared_quiet = client.futures['quiet']
            if outcome == 'resolve':
                winner.resolve('result')
            elif outcome == 'cancel':
                winner.cancel()
            raced = Future.race([winner, quiet] if i % 2 == 0 else [quiet, winner])
            assert quiet.cancelled(), 'precompleted race left a quiet waiter pending'
            assert not shared_quiet.done(), 'private waiter cancellation affected shared subscription'
            try:
                result = await raced
                assert outcome == 'resolve' and result == 'result'
            except ExchangeClosedByUser:
                assert outcome == 'reject'
            except asyncio.CancelledError:
                assert outcome == 'cancel'
            await asyncio.sleep(0)
            assert not shared_quiet._waiters, 'quiet subscription accumulated race waiters'
        remaining = client.future('quiet')
        client.resolve('still subscribed', 'quiet')
        assert await remaining == 'still subscribed'


async def test_client_future_caller_cancellation_and_replay():
    print("test_client_future_caller_cancellation_and_replay")
    client = Client('wss://localhost', None, None, None, None)
    loop = asyncio.get_running_loop()
    complaints = []
    previous_handler = loop.get_exception_handler()
    loop.set_exception_handler(lambda l, context: complaints.append(context))

    async def receive():
        return await client.future('ticker')

    first = asyncio.create_task(receive())
    second = asyncio.create_task(receive())
    try:
        await asyncio.sleep(0)
        first.cancel()
        try:
            await first
            assert False, 'cancelled receiver returned a result'
        except asyncio.CancelledError:
            pass
        assert not client.futures['ticker'].done(), 'caller cancelled the shared future'
        client.resolve('tick', 'ticker')
        assert await asyncio.wait_for(second, 1) == 'tick'
        error = ExchangeClosedByUser('parked rejection')
        client.reject(error, 'rejected')
        try:
            await client.future('rejected')
            assert False, 'parked rejection did not reach the caller'
        except ExchangeClosedByUser as caught:
            assert caught is error
        await asyncio.sleep(0)
        assert not complaints, 'rejection replay logged a callback error'
        for i in range(100):
            raced = Future.race([client.future('active'), client.future('quiet')])
            client.resolve(i, 'active')
            assert await asyncio.wait_for(raced, 1) == i
            await asyncio.sleep(0)
            assert not client.futures['quiet']._waiters, 'race left a quiet waiter behind'
        raced = Future.race([client.future('active'), client.future('quiet')])
        raced.cancel()
        await asyncio.sleep(0)
        await asyncio.sleep(0)
        for message_hash in ('active', 'quiet'):
            assert not client.futures[message_hash].done()
            assert not client.futures[message_hash]._waiters
    finally:
        first.cancel()
        second.cancel()
        await asyncio.gather(first, second, return_exceptions=True)
        loop.set_exception_handler(previous_handler)


async def test_load_markets_caller_cancellation():
    print("test_load_markets_caller_cancellation")
    exchange = Exchange({'timeout_on_exit': 0})
    started = asyncio.Event()
    release = asyncio.Event()
    calls = []
    markets = {'BTC/USDT': {'symbol': 'BTC/USDT'}}

    async def load_markets_helper(reload, params):
        calls.append(reload)
        started.set()
        await release.wait()
        exchange.markets = markets
        return markets

    exchange.load_markets_helper = load_markets_helper
    first = asyncio.create_task(exchange.load_markets())
    second = asyncio.create_task(exchange.load_markets())
    try:
        await asyncio.wait_for(started.wait(), 1)
        loading = exchange.markets_loading
        first.cancel()
        try:
            await first
            assert False, 'cancelled caller returned markets'
        except asyncio.CancelledError:
            pass
        assert not loading.cancelled(), 'caller cancelled the shared loader'
        release.set()
        assert await asyncio.wait_for(second, 1) is markets
        assert await exchange.load_markets() is markets
        assert calls == [False], 'cached load started another helper'
        assert await exchange.load_markets(True) is markets
        assert calls == [False, True]
    finally:
        release.set()
        first.cancel()
        second.cancel()
        await asyncio.gather(first, second, return_exceptions=True)
        await exchange.close()


async def test_watch_caller_cancellation():
    print("test_watch_caller_cancellation")
    exchange = Exchange({'timeout_on_exit': 0})
    url = 'wss://localhost'
    client = exchange.client(url)
    existing = client.future('ticker')

    async def watch():
        return await exchange.watch(url, 'ticker')

    first = asyncio.create_task(watch())
    second = asyncio.create_task(watch())
    try:
        await asyncio.sleep(0)
        first.cancel()
        try:
            await first
            assert False, 'cancelled watcher returned a result'
        except asyncio.CancelledError:
            pass
        await asyncio.sleep(0)
        assert not second.done(), 'one watcher cancelled another caller'
        assert not client.futures['ticker'].done(), 'watch cancelled the shared subscription'
        client.resolve({'last': 1}, 'ticker')
        assert await asyncio.wait_for(second, 1) == {'last': 1}
        assert await existing == {'last': 1}
    finally:
        first.cancel()
        second.cancel()
        existing.cancel()
        await asyncio.gather(first, second, return_exceptions=True)
        await exchange.close()


async def test_race_pending_loser_callbacks_bounded():
    # a cached pending future raced repeatedly must not accumulate done-callbacks
    print("test_race_pending_loser_callbacks_bounded")
    stuck = Future()
    for i in range(50):
        winner = Future()
        raced = Future.race([winner, stuck])
        winner.resolve(i)
        assert await raced == i
    assert len(stuck._callbacks) == 1, f"pending loser kept {len(stuck._callbacks)} callbacks"
    stuck.reject(ExchangeClosedByUser('closed'))
    await asyncio.sleep(0)


async def test_ws_future():
    await test_resolve_before()
    await test_reject()
    await test_race_success_before()
    await test_race_return_first_exception()
    await test_cancel()
    await test_await_canceled_future()
    await test_race_cancel()
    await test_race_mixed_outcomes()
    await test_race_with_wait_for_timeout()
    await test_race_with_wait_for_completion()
    await test_race_with_precompleted_future()
    await test_closed_by_user()
    await test_race_broadcast_reject_no_unretrieved()
    await test_race_precompleted_cancels_quiet_waiters()
    await test_client_future_caller_cancellation_and_replay()
    await test_load_markets_caller_cancellation()
    await test_watch_caller_cancellation()
    await test_race_pending_loser_callbacks_bounded()

