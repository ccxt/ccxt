import asyncio
import os
import sys

from aiohttp import WSMessage, WSMsgType

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
    for retirement in ('error', 'close', 'exchange_close'):
        for suppress_cancellation in (False, True):
            for watch_multiple in (False, True):
                await test_pending_handshake_retirement(retirement, suppress_cancellation, watch_multiple)
    await test_pending_handshake_retirement('close', True, False, cancel_close=True)
    await test_close_prevents_a_later_connect()
    await test_retired_client_preserves_replacement()
    for watch_multiple in (False, True):
        await test_close_during_ws_throttle(watch_multiple)


async def test_pending_handshake_retirement(retirement, suppress_cancellation, watch_multiple, cancel_close=False):
    from ccxt.async_support.base.exchange import Exchange

    entered = asyncio.Event()
    release = asyncio.Event()
    close_entered = asyncio.Event()
    finish_close = asyncio.Event()
    messages = asyncio.Queue()
    callbacks = []

    class Connection:
        closed = False

        async def receive(self):
            return await messages.get()

        async def send_str(self, message):
            callbacks.append('send')

        async def close(self):
            if cancel_close:
                close_entered.set()
                await finish_close.wait()
            self.closed = True
            messages.put_nowait(WSMessage(WSMsgType.CLOSED, None, None))

    connection = Connection()

    class GatedClient(Client):
        @property
        def buffer(self):
            return None

        async def create_connection(self, session):
            entered.set()
            try:
                await release.wait()
            except asyncio.CancelledError:
                if not suppress_cancellation:
                    raise
                await release.wait()
            return connection

    owner = Exchange()
    owner.enableRateLimit = False
    client = GatedClient('ws://example.invalid', noop, owner.on_error, owner.on_close,
                         lambda unused: callbacks.append('connected'),
                         {'asyncio_loop': asyncio.get_running_loop(), 'keepAlive': 0})
    owner.clients[client.url] = client
    if watch_multiple:
        watcher = owner.watch_multiple(client.url, ['ticker'], {'op': 'subscribe'}, ['ticker'])
    else:
        watcher = owner.watch(client.url, 'ticker', {'op': 'subscribe'}, 'ticker')
    await asyncio.wait_for(entered.wait(), 1)
    try:
        if retirement == 'error':
            client.on_error(NetworkError('handshake retired'))
        close_task = asyncio.create_task(owner.close_ws_clients() if retirement == 'exchange_close' else client.close())
        asyncio.get_running_loop().call_soon(release.set)
        if cancel_close:
            await asyncio.wait_for(close_entered.wait(), 1)
            close_task.cancel()
            asyncio.get_running_loop().call_soon(finish_close.set)
            try:
                await asyncio.wait_for(close_task, 1)
                raise AssertionError('close cancellation is swallowed')
            except asyncio.CancelledError:
                pass
        else:
            await asyncio.wait_for(close_task, 1)
        try:
            await asyncio.wait_for(asyncio.shield(client.connected), 1)
            raise AssertionError('retired handshake resolves connected')
        except NetworkError:
            pass
        assert not callbacks, 'retired handshake starts connected callbacks'
        assert client.connection is None or client.connection.closed
        if suppress_cancellation:
            assert connection.closed, 'late connection remains open'
    finally:
        release.set()
        finish_close.set()
        for unused in range(3):
            barrier = asyncio.get_running_loop().create_future()
            asyncio.get_running_loop().call_soon(barrier.set_result, None)
            await barrier
        await client.close()
        await asyncio.gather(watcher, return_exceptions=True)
        if not client.connected.done():
            client.connected.cancel()
        else:
            client.connected.exception()
        await owner.close()


async def test_close_prevents_a_later_connect():
    client = make_client()
    await client.close()
    try:
        await client.connect(None)
        raise AssertionError('closed client starts another connection')
    except NetworkError:
        pass


async def test_retired_client_preserves_replacement():
    from ccxt.async_support.base.exchange import Exchange

    owner = Exchange()
    retired = make_client()
    replacement = make_client()
    owner.clients[retired.url] = replacement
    retired.error = NetworkError('retired')
    owner.on_error(retired, retired.error)
    owner.on_close(retired, 1000)
    assert owner.clients[retired.url] is replacement
    await retired.close()
    await replacement.close()
    assert owner.client(replacement.url) is not replacement
    await owner.close()


async def test_close_during_ws_throttle(watch_multiple):
    from ccxt.async_support.base.exchange import Exchange

    entered = asyncio.Event()
    release = asyncio.Event()
    resumed = asyncio.Event()
    sent = []
    owner = Exchange()
    client = make_client()

    async def throttle(cost):
        entered.set()
        await release.wait()
        resumed.set()

    async def send(message):
        sent.append(message)

    client.throttle = throttle
    client.send = send
    client.connected.resolve(client.url)
    owner.clients[client.url] = client
    try:
        if watch_multiple:
            watcher = owner.watch_multiple(client.url, ['ticker'], {'op': 'subscribe'}, ['ticker'])
        else:
            watcher = owner.watch(client.url, 'ticker', {'op': 'subscribe'}, 'ticker')
        await asyncio.wait_for(entered.wait(), 1)
        await client.close()
        release.set()
        await asyncio.wait_for(resumed.wait(), 1)
        assert not sent, 'retired client sends after throttle'
        await asyncio.gather(watcher, return_exceptions=True)
    finally:
        release.set()
        await owner.close()


if __name__ == '__main__':
    asyncio.run(test_ws_client_reset())
    print('test_client_reset passed')
