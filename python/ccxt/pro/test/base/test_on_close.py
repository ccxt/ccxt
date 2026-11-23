import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from aiohttp import ClientSession, web
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


async def test_server_close_frame_runs_on_close_once():
    closed_codes = []

    def spy_close(client, code):
        closed_codes.append(code)

    async def handler(request):
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        await ws.close(code=1001)
        return ws

    app = web.Application()
    app.router.add_get('/', handler)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '127.0.0.1', 0)
    await site.start()
    url = 'ws://127.0.0.1:' + str(runner.addresses[0][1])
    session = ClientSession()
    client = Client(url, noop, noop, spy_close, noop, {'asyncio_loop': asyncio.get_running_loop(), 'keepAlive': 0})
    try:
        await client.connect(session)
        for _ in range(100):
            if closed_codes:
                break
            await asyncio.sleep(0.05)
        # give a rescheduled receive_loop the chance to report the close again
        await asyncio.sleep(0.2)
    finally:
        await client.close()
        await session.close()
        await runner.cleanup()
    assert closed_codes == [1001], f"a server CLOSE frame must run on_close once, got {closed_codes}"


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
    await test_server_close_frame_runs_on_close_once()
    await test_exchange_on_close_preserves_replacement_client()


if __name__ == '__main__':
    asyncio.run(test_ws_on_close())
    print('test_on_close passed')
