import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

import ccxt.pro as ccxtpro
from ccxt.async_support.base.ws.client import Client

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled, this file is NOT generated).
#
# Regression test for Issue #31073:
# Verify that a server CLOSE frame does not run Client.on_close twice,
# and that Exchange.on_close does not unregister a replacement client
# when a closing stale client invokes its on_close callback.
# ----------------------------------------------------------------------------


def noop(*args):
    return None


async def test_client_on_close_idempotency():
    closed_codes = []

    def spy_close(client, code):
        closed_codes.append(code)

    client = Client('ws://example.invalid', noop, noop, spy_close, noop, {})

    # First on_close call with CLOSE frame code (e.g. 1001)
    client.on_close(1001)
    assert closed_codes == [1001], f"expected [1001], got {closed_codes}"

    # Second on_close call (e.g. from receive_loop 1006) should be a no-op
    client.on_close(1006)
    assert closed_codes == [1001], f"Client.on_close must be idempotent, got {closed_codes}"


async def test_exchange_on_close_preserves_replacement_client():
    exchange = ccxtpro.Exchange({'enableRateLimit': False})
    url = 'ws://mock-exchange-endpoint:9999'

    first_client = exchange.client(url)
    assert exchange.clients[url] is first_client, "first client must be registered"

    # Simulate replacement client registered after first client encountered an error/reconnect
    replacement_client = Client(url, noop, noop, noop, noop, {})
    exchange.clients[url] = replacement_client

    # First client triggers on_close
    exchange.on_close(first_client, error=None)

    # Replacement client must NOT be unregistered because first_client is not exchange.clients[url]
    assert exchange.clients.get(url) is replacement_client, "replacement client must not be dropped"
    assert exchange.client(url) is replacement_client, "exchange.client() must return replacement client"

    await exchange.close()


async def test_ws_on_close():
    await test_client_on_close_idempotency()
    await test_exchange_on_close_preserves_replacement_client()


if __name__ == '__main__':
    asyncio.run(test_ws_on_close())
    print('test_on_close passed')
