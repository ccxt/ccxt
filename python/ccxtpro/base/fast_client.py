"""A faster version of aiohttp's websocket client that uses select and other optimizations"""

__author__ = 'Carlo Revelli'

import time
import asyncio
import collections
from ccxt import NetworkError
from ccxtpro.base.aiohttp_client import AiohttpClient

EVERY_MESSAGE = 0
NO_LAG = 1


class FastClient(AiohttpClient):
    change_context = False
    switcher = None
    mode = EVERY_MESSAGE
    transport = None
    max_delay = 100  # 100 milliseconds of lag

    def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, config={}):
        super(FastClient, self).__init__(url, on_message_callback, on_error_callback, on_close_callback, config)
        # instead of using the deque in aiohttp we implement our own for speed
        # https://github.com/aio-libs/aiohttp/blob/1d296d549050aa335ef542421b8b7dad788246d5/aiohttp/streams.py#L534
        self.stack = collections.deque()

    async def receive_loop(self):
        async def switcher():
            while self.stack:
                message, time_created = self.stack.popleft()
                lagging = time.time() - time_created > self.max_delay / 1000
                self.handle_message(message)
                if self.change_context and not lagging:
                    await asyncio.sleep(0)
                    self.change_context = False

        def feed_data(message, size):
            self.stack.append((message, time.time()))
            if self.switcher is None or self.switcher.done():
                self.switcher = asyncio.ensure_future(switcher())

        def feed_eof():
            self.on_error(NetworkError(1006))

        connection = self.connection._conn
        if connection.closed:
            # connection got terminated after the connection was made and before the receive loop ran
            self.on_close(1006)
            return
        self.transport = connection.transport
        queue = connection.protocol._payload_parser.queue
        queue.feed_data = feed_data
        queue.feed_eof = feed_eof

    def resolve(self, result, message_hash=None):
        super(FastClient, self).resolve(result, message_hash)
        self.change_context = True

    def reset(self, error):
        super(FastClient, self).reset(error)
        self.stack.clear()
        if self.transport:
            self.transport.close()
