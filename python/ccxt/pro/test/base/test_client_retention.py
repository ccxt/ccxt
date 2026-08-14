import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from ccxt.async_support.base.ws.client import Client

# Regression tests for resolved value retention in the ws client
# https://github.com/ccxt/ccxt/issues/28089 https://github.com/ccxt/ccxt/issues/23251
# go lane sibling fix https://github.com/ccxt/ccxt/pull/29719
#
# A value resolved while no consumer future exists is retained, latest wins,
# drained exactly once by the next future() call, and stays mutually
# exclusive with retained rejections in both directions.

HASH = 'ticker:BTC/USDT'


def make_client():
    return Client('ws://localhost', None, None, None, None)


async def assert_waits(future, message):
    try:
        value = await asyncio.wait_for(asyncio.shield(future), 0.05)
        assert False, f"{message}: got {value}"
    except asyncio.TimeoutError:
        pass


async def test_retained_value_delivered_latest_wins():
    client = make_client()
    first = client.future(HASH)
    client.resolve('update-1', HASH)
    assert (await first) == 'update-1'
    # updates arrive while the consumer is between calls, no future in map
    client.resolve('update-2', HASH)
    client.resolve('update-3', HASH)
    second = client.future(HASH)
    assert (await asyncio.wait_for(second, 0.1)) == 'update-3'


async def test_retained_value_drained_once():
    client = make_client()
    client.resolve('retained', HASH)
    first = client.future(HASH)
    assert (await asyncio.wait_for(first, 0.1)) == 'retained'
    second = client.future(HASH)
    await assert_waits(second, 'stale value served twice')
    client.resolve('fresh', HASH)
    assert (await second) == 'fresh'


async def test_reject_clears_retained_value():
    client = make_client()
    client.resolve('stale', HASH)
    client.reject(RuntimeError('boom'), HASH)
    consumer = client.future(HASH)
    try:
        value = await asyncio.wait_for(consumer, 0.1)
        assert False, f"expected retained error, got {value}"
    except RuntimeError:
        pass


async def test_resolve_supersedes_retained_rejection():
    client = make_client()
    client.reject(RuntimeError('old'), HASH)
    client.resolve('recovered', HASH)
    first = client.future(HASH)
    assert (await asyncio.wait_for(first, 0.1)) == 'recovered'
    second = client.future(HASH)
    await assert_waits(second, 'stale error or value served after recovery')
    client.resolve('fresh', HASH)
    assert (await second) == 'fresh'


async def test_broadcast_reject_clears_retained_values():
    client = make_client()
    client.resolve('pre-error', HASH)
    client.reject(RuntimeError('connection lost'))
    consumer = client.future(HASH)
    await assert_waits(consumer, 'pre-error data survived broadcast reject')


async def test_ws_client_retention():
    await test_retained_value_delivered_latest_wins()
    await test_retained_value_drained_once()
    await test_reject_clears_retained_value()
    await test_resolve_supersedes_retained_rejection()
    await test_broadcast_reject_clears_retained_values()


if __name__ == '__main__':
    asyncio.run(test_ws_client_retention())
    print('test_client_retention passed')
