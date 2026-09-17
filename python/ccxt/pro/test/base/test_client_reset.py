import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from ccxt import ExchangeError, InvalidNonce, NetworkError  # noqa: F402
from ccxt.async_support.base.ws.client import Client  # noqa: F402

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled, this file is NOT generated).
#
# Client.reset(error) exists in the js/php/c#/go/java ws clients and is called
# by transpiled error paths in python/ccxt/pro/*.py (binance, htx, cryptocom,
# apex, bingx, ...). The python client historically lacked it, so those paths
# raised AttributeError("'Client' object has no attribute 'reset'") inside the
# receive-loop callback and silently killed the connection instead of
# surfacing the original error (reported in the wild in issue #27245).
#
# The base ws test suite is transpiled from ts/src/pro/test/base/, which has
# no client test — the js client is exercised end-to-end instead. This gap is
# python-only (a missing method on a hand-written file), so it gets a
# hand-written python-only pin: every case below fails on the pre-fix
# client.py with AttributeError and passes with reset() present.
# ----------------------------------------------------------------------------


def noop(*args):
    return None


def make_client():
    return Client('ws://example.invalid', noop, noop, noop, noop, {})


async def test_reset_rejects_all_pending_futures():
    # the whole point of reset(error): every pending watcher gets the error
    # instead of hanging forever on a future nobody will ever resolve
    client = make_client()
    error = InvalidNonce('sequence gap')
    future1 = client.future('orderbook:BTC/USDT')
    future2 = client.future('trades:BTC/USDT')
    client.reset(error)
    for future in (future1, future2):
        try:
            await asyncio.wait_for(future, 1)
            assert False, "reset should have rejected the pending future"
        except InvalidNonce as e:
            assert str(e) == 'sequence gap', f"expected 'sequence gap', got '{str(e)}'"
    assert len(client.futures) == 0, "reset must clear the futures registry"


async def test_reset_cancels_keepalive():
    # mirrors js clearPingInterval(): the ping task must not outlive the reset,
    # an orphaned keepalive writes into a dying transport and leaks raw
    # aiohttp errors to the consumer
    client = make_client()
    client.ping_looper = asyncio.ensure_future(asyncio.sleep(3600))
    client.reset(ExchangeError('teardown'))
    await asyncio.sleep(0)
    assert client.ping_looper.cancelled(), "reset must cancel the keepalive task"


async def test_reset_without_ping_looper():
    # reset gets called from error paths that can run before connect() ever
    # started the keepalive — ping_looper is still None there
    client = make_client()
    assert client.ping_looper is None
    client.reset(ExchangeError('early teardown'))  # must not raise


async def test_reset_is_idempotent():
    # nested teardown paths (error callback inside a close sequence) may call
    # reset twice — the second call must be a no-op, not a crash
    client = make_client()
    client.ping_looper = asyncio.ensure_future(asyncio.sleep(3600))
    error = ExchangeError('first teardown')
    future = client.future('ticker:BTC/USDT')
    client.reset(error)
    client.reset(ExchangeError('second teardown'))  # must not raise
    try:
        await asyncio.wait_for(future, 1)
        assert False, "reset should have rejected the pending future"
    except ExchangeError as e:
        assert str(e) == 'first teardown', f"expected 'first teardown', got '{str(e)}'"


async def test_reset_does_not_poison_new_futures():
    # reject() stashes errors in self.rejections only for hashes with no live
    # future; reset() rejects live futures directly, so a future created for
    # the same hash after the reset must start clean and stay pending
    client = make_client()
    stale = client.future('orderbook:BTC/USDT')
    client.reset(ExchangeError('teardown'))
    try:
        await asyncio.wait_for(stale, 1)
        assert False, "reset should have rejected the pending future"
    except ExchangeError:
        pass
    fresh = client.future('orderbook:BTC/USDT')
    assert 'orderbook:BTC/USDT' not in client.rejections, "reset must not leave a stale rejection behind"
    done, pending = await asyncio.wait([fresh], timeout=0.05)
    assert fresh in pending, "a post-reset future must not be pre-rejected"
    fresh.cancel()


async def test_reset_with_a_non_exception_payload():
    # binance resets with the raw 5xx wire payload, not an exception:
    # python/ccxt/pro/binance.py:5175 `client.reset(message)` (transpiled from
    # ts/src/pro/binance.ts handleWsError). js can reject a promise with any
    # value, python's Future.set_exception raises TypeError('invalid exception
    # object') on a dict - which would abort the broadcast on the FIRST pending
    # future and leave every remaining watcher hanging forever, the precise
    # failure reset() is supposed to prevent. wrap non-exceptions instead.
    client = make_client()
    first = client.future('orderbook:BTC/USDT')
    second = client.future('trades:BTC/USDT')
    message = {'id': 1, 'status': 503, 'error': {'code': '-1001', 'msg': 'Internal error'}}
    client.reset(message)  # must not raise TypeError
    assert len(client.futures) == 0, "reset must drain the futures registry even for a dict payload"
    for future in (first, second):
        try:
            await asyncio.wait_for(future, 1)
            assert False, "reset should have rejected the pending future"
        except NetworkError as e:
            assert 'Internal error' in str(e), f"payload must survive into the error message, got '{str(e)}'"


async def test_reset_with_a_string_payload():
    # a bare string is the other non-exception shape a transpiled caller can pass
    client = make_client()
    future = client.future('ticker:BTC/USDT')
    client.reset('connection reset by peer')  # must not raise TypeError
    try:
        await asyncio.wait_for(future, 1)
        assert False, "reset should have rejected the pending future"
    except NetworkError as e:
        assert str(e) == 'connection reset by peer', f"expected the payload text, got '{str(e)}'"


async def test_reset_preserves_the_original_exception_type():
    # the wrapping must not downgrade a real ccxt exception: watchers catch on
    # type (InvalidNonce drives orderbook resync), so an exception argument has
    # to arrive unchanged
    client = make_client()
    future = client.future('orderbook:BTC/USDT')
    error = InvalidNonce('sequence gap')
    client.reset(error)
    try:
        await asyncio.wait_for(future, 1)
        assert False, "reset should have rejected the pending future"
    except InvalidNonce as e:
        assert e is error, "reset must reject with the exact exception instance it was given"


async def test_reset_with_an_unserializable_payload():
    # reset() is a teardown path: formatting the payload must never throw, or
    # the futures it was called to drain are stranded. a set is not JSON
    # serializable, so Exchange.json() raises on it and the fallback must run.
    client = make_client()
    future = client.future('orderbook:BTC/USDT')
    client.reset({'codes': {500, 503}})  # must not raise TypeError
    assert len(client.futures) == 0, "reset must drain the futures registry for an unserializable payload"
    try:
        await asyncio.wait_for(future, 1)
        assert False, "reset should have rejected the pending future"
    except NetworkError:
        pass


async def test_ws_client_reset():
    await test_reset_rejects_all_pending_futures()
    await test_reset_cancels_keepalive()
    await test_reset_without_ping_looper()
    await test_reset_is_idempotent()
    await test_reset_does_not_poison_new_futures()
    await test_reset_with_a_non_exception_payload()
    await test_reset_with_a_string_payload()
    await test_reset_preserves_the_original_exception_type()
    await test_reset_with_an_unserializable_payload()


if __name__ == '__main__':
    asyncio.run(test_ws_client_reset())
    print('test_client_reset passed')
