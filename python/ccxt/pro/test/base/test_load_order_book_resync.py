import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

import ccxt.pro  # noqa: F402
from ccxt.base.errors import RateLimitExceeded  # noqa: F402

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled, this file is NOT generated).
#
# load_order_book() must reject every pending future on the shared ws client
# with the resync error instead of cancelling them: a cancelled future raises
# a bare CancelledError, which a watch loop cannot tell apart from its own
# task being stopped, silently killing every other symbol subscribed on that
# connection (https://github.com/ccxt/ccxt/issues/30876).
#
# the typescript sibling lives in ts/src/pro/test/base/test.loadOrderBookResync.ts
# ----------------------------------------------------------------------------


async def test_resync_failure_rejects_other_watchers():
    exchange = ccxt.pro.kucoinfutures()
    url = 'ws://example.invalid'
    client = exchange.client(url)  # real client with bound callbacks, never dialed
    symbol = 'BTC/USDT'
    exchange.orderbooks[symbol] = exchange.order_book()
    # every snapshot attempt fails, e.g. a 429 from the REST endpoint
    failure = RateLimitExceeded('kucoinfutures 429 Too Many Requests')

    async def fail_snapshot(s, limit=None, params={}):
        raise failure

    exchange.fetch_rest_order_book_safe = fail_snapshot
    outcomes = {}

    async def watch(name, message_hash):
        try:
            await client.future(message_hash)
            outcomes[name] = 'resolved'
        except asyncio.CancelledError:
            outcomes[name] = 'cancelled'
        except Exception as e:
            outcomes[name] = e

    waiting_a = asyncio.ensure_future(watch('A', 'orderbook:A'))
    waiting_b = asyncio.ensure_future(watch('B', 'orderbook:B'))
    await asyncio.sleep(0.1)
    await exchange.load_order_book(client, 'orderbook:A', symbol)
    await asyncio.wait_for(asyncio.gather(waiting_a, waiting_b), 5)
    assert outcomes['A'] is failure, 'the failed watcher must be rejected with the resync error'
    assert outcomes['B'] is failure, 'other watchers must get the error, not CancelledError (got %r)' % (outcomes['B'],)
    assert url not in exchange.clients, 'the broken client must be dropped from the exchange'
    assert len(exchange.orderbooks[symbol].cache) == 0, 'the orderbook cache must be cleared'
    await exchange.close()


async def test_ws_load_order_book_resync():
    await test_resync_failure_rejects_other_watchers()


if __name__ == '__main__':
    asyncio.run(test_ws_load_order_book_resync())
    print('test_load_order_book_resync passed')
