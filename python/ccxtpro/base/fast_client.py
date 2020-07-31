"""A faster version of aiohttp's websocket client that uses select and other optimizations"""

__author__ = 'Carlo Revelli'

import ccxt
from aiohttp.http_websocket import WebSocketReader
from ccxtpro.base.aiohttp_client import AiohttpClient
from asyncio import ensure_future, sleep
import socket
import select
import collections
import asyncio

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
        self.max_pending = 2 ** 8  # will throw an error if more messages are in the queue
        self.lock = asyncio.Lock()

    async def connect(self, session, backoff_delay=0):
        await super(FastClient, self).connect(session, backoff_delay)
        connection = self.connection._conn
        transport = connection.transport
        transport.pause_reading()
        self.socket = transport.get_extra_info('socket')
        # https://github.com/aio-libs/aiohttp/issues/664
        self.socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        if hasattr(transport, '_ssl_protocol'):
            self.ssl_pipe = transport._ssl_protocol._sslpipe  # a weird memory buffer
        self.sockets[self.socket] = self
        if not self.lock.locked():
            await self.lock.acquire()
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
                _, plaintext = client.ssl_pipe.feed_ssldata(data)
                for message in plaintext:
                    client.parser.feed_data(message)
            else:
                client.parser.feed_data(data)
            print('messages remaining', len(client.parser.queue))
            if len(client.parser.queue) > client.max_pending:
                client.reset(ccxt.NetworkError('Too laggy'))
                del cls.sockets[client.socket]
                continue
            for message, message_length in client.parser.queue:
                client.handle_message(message)
                if client.mode == EVERY_MESSAGE:
                    await client.lock
                elif client.mode == NO_LAG:
                    # switch context if anyone is there )
                    await sleep(0)
                else:
                    raise Exception('Invalid Mode')
            client.parser.queue.clear()

    def future(self, message_hash):
        result = super(FastClient, self).future(message_hash)
        if self.lock.locked():
            self.lock.release()
        return result

    def reset(self, error):
        super(FastClient, self).reset(error)
        self.parser.queue.clear()
