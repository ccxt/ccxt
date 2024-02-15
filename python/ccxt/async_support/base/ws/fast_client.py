"""A faster version of aiohttp's websocket client that uses select and other optimizations"""

import asyncio
import socket
import collections
from ccxt.async_support.base.ws.aiohttp_client import AiohttpClient


class FastClient(AiohttpClient):
    transport = None

    def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, on_connected_callback, config={}):
        super(FastClient, self).__init__(url, on_message_callback, on_error_callback, on_close_callback, on_connected_callback, config)
        # instead of using the deque in aiohttp we implement our own for speed
        # https://github.com/aio-libs/aiohttp/blob/1d296d549050aa335ef542421b8b7dad788246d5/aiohttp/streams.py#L534
        self.stack = collections.deque()
        self.callback_scheduled = False

    def receive_loop(self):
        def handler():
            if not self.stack:
                self.callback_scheduled = False
                return
            message = self.stack.popleft()
            try:
                self.handle_message(message)
            except Exception as error:
                self.reject(error)
            self.asyncio_loop.call_soon(handler)

        def feed_data(message, size):
            if not self.callback_scheduled:
                self.callback_scheduled = True
                self.asyncio_loop.call_soon(handler)
            self.stack.append(message)

        def feed_eof():
            if self._close_code == 1000:  # OK close
                self.on_close(1000)
            else:
                self.on_error(1006)  # ABNORMAL_CLOSURE

        def wrapper(func):
            def parse_frame(buf):
                while self.stack:
                    self.handle_message(self.stack.popleft())
                return func(buf)
            return parse_frame

        async def close(code=1000, message=b''):
            # this is needed because our other wrappers break the closing process
            # we also don't wait for a response to the close message to speed it up
            # this code is adapted from aiohttp client_ws.py
            _self = self.connection
            if not _self._closed:
                _self._cancel_heartbeat()
                _self._closed = True
                try:
                    await _self._writer.close(code, message)
                    _self._response.close()
                    self._close_code = 1000
                except asyncio.CancelledError:
                    _self._response.close()
                    _self._close_code = 1006
                    raise
                except Exception as exc:
                    _self._close_code = 1006
                    _self._exception = exc
            return True

        connection = self.connection._conn
        if connection.closed:
            # connection got terminated after the connection was made and before the receive loop ran
            self.on_close(1006)
            return
        self.transport = connection.transport
        # increase the RCVBUF so that the tcp window size can be larger
        sock = self.transport.get_extra_info('socket')
        current_size = sock.getsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF)
        # 2 mebibytes is a performance value
        new_size = max(current_size, 2097152)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, new_size)

        ws_reader = connection.protocol._payload_parser
        ws_reader.parse_frame = wrapper(ws_reader.parse_frame)
        ws_reader.queue.feed_data = feed_data
        ws_reader.queue.feed_eof = feed_eof
        self.connection.close = close
        # return a future so super class won't complain
        return asyncio.sleep(0)

    def reset(self, error):
        super(FastClient, self).reset(error)
        self.stack.clear()
        if self.transport:
            self.transport.abort()
