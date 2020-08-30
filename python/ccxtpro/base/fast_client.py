"""A faster version of aiohttp's websocket client that uses select and other optimizations"""

import asyncio
import collections
from ccxt import NetworkError
from ccxtpro.base.aiohttp_client import AiohttpClient


class FastClient(AiohttpClient):
    transport = None

    def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, config={}):
        super(FastClient, self).__init__(url, on_message_callback, on_error_callback, on_close_callback, config)
        # instead of using the deque in aiohttp we implement our own for speed
        # https://github.com/aio-libs/aiohttp/blob/1d296d549050aa335ef542421b8b7dad788246d5/aiohttp/streams.py#L534
        self.stack = collections.deque()

    def receive_loop(self):
        def handler():
            if not self.stack:
                return
            message = self.stack.popleft()
            self.handle_message(message)
            self.asyncio_loop.call_soon(handler)

        def feed_data(message, size):
            if not self.stack:
                self.asyncio_loop.call_soon(handler)
            self.stack.append(message)

        def feed_eof():
            self.on_error(NetworkError(1006))

        def wrapper(func):
            def parse_frame(buf):
                while len(self.stack) > 1:
                    self.handle_message(self.stack.popleft())
                return func(buf)
            return parse_frame

        connection = self.connection._conn
        if connection.closed:
            # connection got terminated after the connection was made and before the receive loop ran
            self.on_close(1006)
            return
        self.transport = connection.transport
        ws_reader = connection.protocol._payload_parser
        ws_reader.parse_frame = wrapper(ws_reader.parse_frame)
        ws_reader.queue.feed_data = feed_data
        ws_reader.queue.feed_eof = feed_eof
        # return a future so super class won't complain
        return asyncio.sleep(0)

    def reset(self, error):
        super(FastClient, self).reset(error)
        self.stack.clear()
        if self.transport:
            self.transport.abort()

    def resolve(self, result, message_hash=None):
        super(FastClient, self).resolve(result, message_hash)
        print('resolved', message_hash)
