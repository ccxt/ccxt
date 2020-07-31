"""A faster version of aiohttp's websocket client that uses select and other optimizations"""

__author__ = 'Carlo Revelli'

import ccxt
from aiohttp.http_websocket import WebSocketReader
from ccxtpro.base.aiohttp_client import AiohttpClient
from asyncio import ensure_future, sleep
import socket
import select
import collections

EVERY_MESSAGE = 0
NO_LAG = 1


class FastClient(AiohttpClient):
    sockets = {}
    buffer_size = None
    running = False
    poll_frequency = 0.01

    def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, asyncio_loop, config={}):
        super(FastClient, self).__init__(url, on_message_callback, on_error_callback, on_close_callback, asyncio_loop, config)
        if not hasattr(self, 'buffer_size') or self.buffer_size is None:
            default_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.buffer_size = default_socket.getsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF)
            del default_socket
        self.buffer = bytearray(self.buffer_size)
        queue = collections.UserList()
        queue.feed_data = lambda *args: queue.append(args)
        self.parser = WebSocketReader(queue, self.buffer_size)
        self.socket = None
        self.ssl_pipe = None
        self.mode = EVERY_MESSAGE
        self.max_pending = 2 ** 4  # will throw an error if more messages are in the queue
        self.change_context = False
        self.transport = None

    async def connect(self, session, backoff_delay=0):
        await super(FastClient, self).connect(session, backoff_delay)
        self.transport = self.connection._conn.transport
        self.transport.pause_reading()
        self.socket = self.transport.get_extra_info('socket')
        # https://github.com/aio-libs/aiohttp/issues/664
        # https://docs.python.org/3.6/library/asyncio-protocol.html#transports
        self.socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)  # it is set by default in py > 3.6
        if hasattr(self.transport, '_ssl_protocol'):
            self.ssl_pipe = self.transport._ssl_protocol._sslpipe  # a weird memory buffer
        self.sockets[self.socket] = self
        if not self.running:
            ensure_future(self.selector_loop())
        type(self).running = True

    @classmethod
    async def selector_loop(cls):
        while cls.running:
            await cls.selector()

    @classmethod
    async def selector(cls):
        await sleep(cls.poll_frequency)
        if not cls.sockets:
            cls.running = False
            return
        ready_sockets, _, errored_sockets = select.select(cls.sockets, [], cls.sockets, 0)
        for sock in errored_sockets:
            # TODO: handle
            pass

        for sock in ready_sockets:
            client = cls.sockets[sock]
            bytes_read = await client.asyncio_loop.sock_recv_into(sock, client.buffer)
            data = client.buffer[:bytes_read]
            if client.ssl_pipe:
                # decrypt ssl
                _, plaintext = client.ssl_pipe.feed_ssldata(data)
                for message in plaintext:
                    # decode websocket protocol bytes
                    # data may not end on a complete frame
                    # use aiohttp's parser to take care of this
                    client.parser.feed_data(message)
            else:
                client.parser.feed_data(data)
            if len(client.parser.queue) > client.max_pending:
                error_msg = 'You are taking too long to synchronously process each update on EVERY_MESSAGE mode, ' \
                            'as a result you are receiving old updates which is effectively lagging your connection. ' \
                            'Increase client.max_pending to increase the maximum allowed size of your buffer'
                client.on_error(ccxt.NetworkError(error_msg))
                continue
            for message, message_length in client.parser.queue:
                client.handle_message(message)
                if client.mode == EVERY_MESSAGE and client.change_context:
                    client.change_context = False
                    await sleep(0)
            # clear the queue so we don't read the same messages twice
            client.parser.queue.clear()

    def resolve(self, result, message_hash=None):
        super(FastClient, self).resolve(result, message_hash)
        self.change_context = True

    async def close(self, code=1000):
        if self.socket in type(self).sockets:
            del type(self).sockets[self.socket]
        # first close the aiohttp connection
        await super(FastClient, self).close(code)
        # try to close the socket if it has not been already closed by the line above
        self.socket.close()

    async def receive_loop(self):
        pass
