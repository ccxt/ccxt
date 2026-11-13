import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from ccxt.async_support.base.exchange import Exchange as AsyncExchange  # noqa: F402
from ccxt.async_support.base.ws.client import Client  # noqa: F402

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled, this file is NOT generated).
#
# A server CLOSE frame runs Client.on_close twice on the python client
# (reported in issue #31073): once with the frame's code from
# handle_message, then once with 1006 from the receive loop, because the
# aiohttp_close scheduled by the first call has not marked the connection
# closed yet when the loop runs again. The second call re-fired the
# exchange close callback, and Exchange.on_close deleted the client by
# URL without checking which client was closing - so a replacement
# client created between the two calls (e.g. by a waiter that
# resubscribes as soon as its future is rejected) was unregistered
# while still connected, and nothing could reach it any more.
#
# This gap is python-only (the double close comes from the aiohttp
# receive-loop scheduling; the js client fires close exactly once), so
# it gets a hand-written python-only pin, mirroring test_client_reset.py.
# Every case below fails on the pre-fix code and passes with the fix.
# ----------------------------------------------------------------------------


def noop(*args):
    return None


class FakeConnection:
    def __init__(self):
        self.closed = False

    async def close(self):
        self.closed = True


class FakeExchangeSelf:
    """Stand-in carrying only what AsyncExchange.on_close touches."""

    def __init__(self, clients):
        self.clients = clients


async def test_double_on_close_fires_callback_once():
    # the CLOSE frame's code (1001) is the notification; the receive
    # loop's follow-up 1006 must not re-fire the callback
    calls = []

    def on_close_callback(client, code):
        calls.append(code)

    client = Client('ws://example.invalid', noop, noop, on_close_callback, noop, {})
    client.connection = FakeConnection()
    client.on_close(1001)
    await asyncio.sleep(0)  # let the scheduled aiohttp_close run
    client.on_close(1006)
    await asyncio.sleep(0)
    assert calls == [1001], f"on_close callback must fire exactly once with the frame code, got {calls}"


async def test_stale_on_close_keeps_replacement_client():
    # a waiter resubscribes between the two on_close calls and the
    # replacement client is registered under the same URL before the
    # stale second call runs: it must survive that call
    url = 'ws://example.invalid'
    old = Client(url, noop, noop, noop, noop, {})
    replacement = Client(url, noop, noop, noop, noop, {})
    fake_self = FakeExchangeSelf({url: replacement})
    AsyncExchange.on_close(fake_self, old, None)
    assert fake_self.clients.get(url) is replacement, "stale on_close must not unregister the replacement client"


async def test_on_close_still_unregisters_current_client():
    # the normal path is unchanged: when the closing client is still
    # the registered one, it is unregistered as before
    url = 'ws://example.invalid'
    client = Client(url, noop, noop, noop, noop, {})
    fake_self = FakeExchangeSelf({url: client})
    AsyncExchange.on_close(fake_self, client, None)
    assert url not in fake_self.clients, "on_close must still unregister the client that actually closed"


async def test_ws_client_double_close():
    await test_double_on_close_fires_callback_once()
    await test_stale_on_close_keeps_replacement_client()
    await test_on_close_still_unregisters_current_client()


if __name__ == '__main__':
    asyncio.run(test_ws_client_double_close())
    print('test_client_double_close passed')
