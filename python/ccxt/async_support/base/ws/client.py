# -*- coding: utf-8 -*-

orjson = None
try:
    import orjson as orjson
except ImportError:
    pass

import json

from asyncio import sleep, ensure_future, wait_for, TimeoutError, BaseEventLoop, Future as asyncioFuture
from .functions import milliseconds, iso8601, deep_extend, is_json_encoded_object
from ccxt import NetworkError, RequestTimeout
from ccxt.async_support.base.ws.future import Future
from ccxt.async_support.base.ws.functions import gunzip, inflate
from typing import Dict

from aiohttp import WSMsgType


class Client(object):

    url = None
    ws = None
    futures: Dict[str, Future] = {}
    options = {}  # ws-specific options
    subscriptions = {}
    rejections = {}
    on_message_callback = None
    on_error_callback = None
    on_close_callback = None
    on_connected_callback = None
    connectionStarted = None
    connectionEstablished = None
    isConnected = False
    connectionTimeout = 10000  # ms, false to disable
    connection = None
    error = None  # low-level networking exception, if any
    connected = None  # connection-related Future
    keepAlive = 5000
    heartbeat = True
    maxPingPongMisses = 2.0  # how many missed pongs to raise a timeout
    lastPong = None
    ping = None  # ping-function if defined
    proxy = None
    verbose = False  # verbose output
    gunzip = False
    inflate = False
    throttle = None
    connecting = False
    asyncio_loop: BaseEventLoop = None
    ping_looper = None
    decompressBinary = True  # decompress binary messages by default

    def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, on_connected_callback, config={}):
        defaults = {
            'url': url,
            'futures': {},
            'subscriptions': {},
            'rejections': {},
            'on_message_callback': on_message_callback,
            'on_error_callback': on_error_callback,
            'on_close_callback': on_close_callback,
            'on_connected_callback': on_connected_callback,
        }
        settings = {}
        settings.update(defaults)
        settings.update(config)
        for key in settings:
            if hasattr(self, key) and isinstance(getattr(self, key), dict):
                setattr(self, key, deep_extend(getattr(self, key), settings[key]))
            else:
                setattr(self, key, settings[key])
        # connection-related Future
        self.options = config
        self.connected = Future()

    def future(self, message_hash):
        if message_hash not in self.futures or self.futures[message_hash].cancelled():
            self.futures[message_hash] = Future()
        future = self.futures[message_hash]
        if message_hash in self.rejections:
            future.reject(self.rejections[message_hash])
            del self.rejections[message_hash]
        return future

    def reusable_future(self, message_hash):
        return self.future(message_hash)  # only used in go

    def reusableFuture(self, message_hash):
        return self.future(message_hash)  # only used in go

    def resolve(self, result, message_hash):
        if self.verbose and message_hash is None:
            self.log(iso8601(milliseconds()), 'resolve received None messageHash')
        if message_hash in self.futures:
            future = self.futures[message_hash]
            future.resolve(result)
            del self.futures[message_hash]
        return result

    def reject(self, result, message_hash=None):
        if message_hash is not None:
            if message_hash in self.futures:
                future = self.futures[message_hash]
                future.reject(result)
                del self.futures[message_hash]
            else:
                self.rejections[message_hash] = result
        else:
            message_hashes = list(self.futures.keys())
            for message_hash in message_hashes:
                self.reject(result, message_hash)
        return result

    def receive_loop(self):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'receive loop')
        if not self.closed():
            # let's drain the aiohttp buffer to avoid latency
            if self.buffer and len(self.buffer) > 1:
                size_delta = 0
                while len(self.buffer) > 1:
                    message, size = self.buffer.popleft()
                    size_delta += size
                    self.handle_message(message)
                # we must update the size of the last message inside WebSocketDataQueue
                # self.receive() calls WebSocketDataQueue.read() that calls WebSocketDataQueue._read_from_buffer()
                # which updates the size of the buffer, the _size will overflow and pause the transport
                # make sure to set the enviroment variable AIOHTTP_NO_EXTENSIONS=Y to check
                # print(self.connection._conn.protocol._payload._size)
                self.buffer[0] = (self.buffer[0][0], self.buffer[0][1] + size_delta)

            task = self.asyncio_loop.create_task(self.receive())

            def after_interrupt(resolved: asyncioFuture):
                exception = resolved.exception()
                if exception is None:
                    self.handle_message(resolved.result())
                    self.asyncio_loop.call_soon(self.receive_loop)
                else:
                    error = NetworkError(str(exception))
                    if self.verbose:
                        self.log(iso8601(milliseconds()), 'receive_loop', 'Exception', error)
                    self.reject(error)

            task.add_done_callback(after_interrupt)
        else:
            # connection got terminated after the connection was made and before the receive loop ran
            self.on_close(1006)

    async def open(self, session, backoff_delay=0):
        # exponential backoff for consequent connections if necessary
        if backoff_delay:
            await sleep(backoff_delay)
        if self.verbose:
            self.log(iso8601(milliseconds()), 'connecting to', self.url, 'with timeout', self.connectionTimeout, 'ms')
        self.connectionStarted = milliseconds()
        try:
            coroutine = self.create_connection(session)
            self.connection = await wait_for(coroutine, timeout=int(self.connectionTimeout / 1000))
            self.connecting = False
            self.connectionEstablished = milliseconds()
            self.isConnected = True
            if self.verbose:
                self.log(iso8601(milliseconds()), 'connected')
            self.connected.resolve(self.url)
            self.on_connected_callback(self)
            # run both loops forever
            self.ping_looper = ensure_future(self.ping_loop(), loop=self.asyncio_loop)
            self.asyncio_loop.call_soon(self.receive_loop)
        except TimeoutError:
            # connection timeout
            error = RequestTimeout('Connection timeout')
            if self.verbose:
                self.log(iso8601(milliseconds()), 'RequestTimeout', error)
            self.on_error(error)
        except Exception as e:
            # connection failed or rejected (ConnectionRefusedError, ClientConnectorError)
            error = NetworkError(e)
            if self.verbose:
                self.log(iso8601(milliseconds()), 'NetworkError', error)
            self.on_error(error)

    @property
    def buffer(self):
        # looks like they exposed it in C
        # this means we can bypass it
        # https://github.com/aio-libs/aiohttp/blob/master/aiohttp/_websocket/reader_c.pxd#L53C24-L53C31
        # these checks are necessary to protect these errors: AttributeError: 'NoneType' object has no attribute '_buffer'
        # upon getting an error message
        if self.connection is None:
            return None
        if self.connection._conn is None:
            return None
        if self.connection._conn.protocol is None:
            return None
        if self.connection._conn.protocol._payload is None:
            return None
        return self.connection._conn.protocol._payload._buffer

    def connect(self, session, backoff_delay=0):
        if not self.connection and not self.connecting:
            self.connecting = True
            ensure_future(self.open(session, backoff_delay), loop=self.asyncio_loop)
        return self.connected

    def on_error(self, error):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'on_error', error)
        self.error = error
        self.reject(error)
        self.on_error_callback(self, error)
        if not self.closed():
            ensure_future(self.close(1006), loop=self.asyncio_loop)

    def on_close(self, code):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'on_close', code)
        if not self.error:
            self.reject(NetworkError('Connection closed by remote server, closing code ' + str(code)))
        self.on_close_callback(self, code)
        ensure_future(self.aiohttp_close(), loop=self.asyncio_loop)

    def log(self, *args):
        print(*args)

    def closed(self):
        return (self.connection is None) or self.connection.closed

    def receive(self):
        return self.connection.receive()

    # helper method for binary and text messages
    def handle_text_or_binary_message(self, data):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'message', data)
        if self.decompressBinary and isinstance(data, bytes):
            data = data.decode()
        # decoded = json.loads(data) if is_json_encoded_object(data) else data
        decode = None
        if is_json_encoded_object(data):
            if orjson is None:
                decode = json.loads(data)
            else:
                decode = orjson.loads(data)
        else:
            decode = data
        self.on_message_callback(self, decode)

    def handle_message(self, message):
        # self.log(iso8601(milliseconds()), message)
        if message.type == WSMsgType.TEXT:
            self.handle_text_or_binary_message(message.data)
        elif message.type == WSMsgType.BINARY:
            data = message.data
            if self.gunzip:
                data = gunzip(data)
            elif self.inflate:
                data = inflate(data)
            self.handle_text_or_binary_message(data)
        # autoping is responsible for automatically replying with pong
        # to a ping incoming from a server, we have to disable autoping
        # with aiohttp's websockets and respond with pong manually
        # otherwise aiohttp's websockets client won't trigger WSMsgType.PONG
        elif message.type == WSMsgType.PING:
            if self.verbose:
                self.log(iso8601(milliseconds()), 'ping', message)
            ensure_future(self.connection.pong(message.data), loop=self.asyncio_loop)
        elif message.type == WSMsgType.PONG:
            self.lastPong = milliseconds()
            if self.verbose:
                self.log(iso8601(milliseconds()), 'pong', message)
            pass
        elif message.type == WSMsgType.CLOSE:
            if self.verbose:
                self.log(iso8601(milliseconds()), 'close', self.closed(), message)
            self.on_close(message.data)
        elif message.type == WSMsgType.ERROR:
            if self.verbose:
                self.log(iso8601(milliseconds()), 'error', message)
            error = NetworkError(str(message))
            self.on_error(error)

    def create_connection(self, session):
        # autoping is responsible for automatically replying with pong
        # to a ping incoming from a server, we have to disable autoping
        # with aiohttp's websockets and respond with pong manually
        # otherwise aiohttp's websockets client won't trigger WSMsgType.PONG
        # call aenter here to simulate async with otherwise we get the error "await not called with future"
        # if connecting to a non-existent endpoint
        # set cookies if defined
        if 'cookies' in self.options:
            for key, value in self.options['cookies'].items():
                session.cookie_jar.update_cookies({key: value})
        if (self.proxy):
            return session.ws_connect(self.url, autoping=False, autoclose=False, headers=self.options.get('headers'), proxy=self.proxy, max_msg_size=10485760).__aenter__()
        return session.ws_connect(self.url, autoping=False, autoclose=False, headers=self.options.get('headers'), max_msg_size=10485760).__aenter__()

    async def send(self, message):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'sending', message)
        send_msg = None
        if isinstance(message, str):
            send_msg = message
        else:
            if orjson is None:
                send_msg = json.dumps(message, separators=(',', ':'))
            else:
                send_msg = orjson.dumps(message).decode('utf-8')
        if self.closed():
            raise ConnectionError('Cannot Send Message: Connection closed before send')
        return await self.connection.send_str(send_msg)

    async def close(self, code=1000):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'closing', code)
        for future in self.futures.values():
            future.cancel()
        await self.aiohttp_close()

    async def aiohttp_close(self):
        if not self.closed():
            await self.connection.close()
        # these will end automatically once self.closed() = True
        # so we don't need to cancel them
        if self.ping_looper:
            self.ping_looper.cancel()

    async def ping_loop(self):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'ping loop')
        while self.keepAlive and not self.closed():
            now = milliseconds()
            self.lastPong = now if self.lastPong is None else self.lastPong
            if (self.lastPong + self.keepAlive * self.maxPingPongMisses) < now:
                self.on_error(RequestTimeout('Connection to ' + self.url + ' timed out due to a ping-pong keepalive missing on time'))
            # the following ping-clause is not necessary with aiohttp's built-in ws
            # since it has a heartbeat option (see create_connection above)
            # however some exchanges require a text-type ping message
            # therefore we need this clause anyway
            else:
                if self.ping:
                    try:
                        await self.send(self.ping(self))
                    except Exception as e:
                        self.on_error(e)
                else:
                    await self.connection.ping()
            await sleep(self.keepAlive / 1000)
