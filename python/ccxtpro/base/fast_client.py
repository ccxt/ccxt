"""A faster version of aiohttp's websocket client that uses select and other optimizations"""

import time
import collections
from ccxt import NetworkError
from ccxtpro.base.aiohttp_client import AiohttpClient


class FastClient(AiohttpClient):
    transport = None
    max_delay = 100  # 100 milliseconds of buffering

    def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, config={}):
        super(FastClient, self).__init__(url, on_message_callback, on_error_callback, on_close_callback, config)
        # instead of using the deque in aiohttp we implement our own for speed
        # https://github.com/aio-libs/aiohttp/blob/1d296d549050aa335ef542421b8b7dad788246d5/aiohttp/streams.py#L534
        self.stack = collections.deque()

    async def receive_loop(self):
        def handler():
            message, time_created = self.stack.popleft()
            lagging = time.time() - time_created > self.max_delay / 1000
            self.handle_message(message)
            while lagging and self.stack:
                message, time_created = self.stack.popleft()
                lagging = time.time() - time_created > self.max_delay / 1000
                self.handle_message(message)
            if self.stack:
                self.asyncio_loop.call_soon(handler)

        def feed_data(message, size):
            if not self.stack:
                self.asyncio_loop.call_soon(handler)
            self.stack.append((message, time.time()))

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

    def reset(self, error):
        super(FastClient, self).reset(error)
        self.stack.clear()
        self.transport.abort()
