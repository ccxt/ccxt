"""A faster version of aiohttp's websocket client that uses select and other optimizations"""

__author__ = 'Carlo Revelli'

import ccxt
from ccxtpro.base.aiohttp_client import AiohttpClient
import asyncio
import collections

EVERY_MESSAGE = 0
NO_LAG = 1


class FastClient(AiohttpClient):
    change_context = False
    switcher = None
    mode = EVERY_MESSAGE

    def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, config={}):
        super(FastClient, self).__init__(url, on_message_callback, on_error_callback, on_close_callback, config)
        # instead of using the deque in aiohttp we implement our own for speed
        # https://github.com/aio-libs/aiohttp/blob/1d296d549050aa335ef542421b8b7dad788246d5/aiohttp/streams.py#L534
        self.stack = collections.deque()

    async def receive_loop(self):
        async def switcher():
            while self.stack:
                self.handle_message(self.stack.popleft())
                if self.mode == EVERY_MESSAGE and self.change_context:
                    await asyncio.sleep(0)
                    self.change_context = False

        def feed_data(data, size):
            self.stack.append(data)
            if self.switcher is None or self.switcher.done():
                self.switcher = asyncio.ensure_future(switcher())

        def network_error(exception):
            self.on_error(ccxt.NetworkError(exception))

        connection = self.connection._conn
        if connection.closed:
            # connection got terminated after the connection was made and before the receive loop ran
            self.on_close(1006)
            return
        protocol = connection.protocol
        queue = protocol._payload_parser.queue
        queue.feed_data = feed_data
        queue.set_exception = network_error
        protocol.connection_lost = network_error

    def resolve(self, result, message_hash=None):
        super(FastClient, self).resolve(result, message_hash)
        self.change_context = True
