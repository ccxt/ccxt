# -*- coding: utf-8 -*-

from asyncio import sleep, ensure_future, wait_for, TimeoutError, BaseEventLoop, Future as asyncioFuture
from .functions import milliseconds, iso8601, deep_extend
from ccxt import NetworkError, RequestTimeout, NotSupported
from ccxt.async_support.base.ws.future import Future
from typing import Dict


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
    verbose = False  # verbose output
    gunzip = False
    inflate = False
    throttle = None
    connecting = False
    asyncio_loop: BaseEventLoop = None
    ping_looper = None

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
        self.connected = Future()

    def future(self, message_hash):
        if message_hash not in self.futures or self.futures[message_hash].cancelled():
            self.futures[message_hash] = Future()
        future = self.futures[message_hash]
        if message_hash in self.rejections:
            future.reject(self.rejections[message_hash])
            del self.rejections[message_hash]
        return future

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
            if len(self.buffer) > 1:
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
                    self.reset(error)

            task.add_done_callback(after_interrupt)

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

    def aiohttp_close(self):
        raise NotSupported('aiohttp_close() not implemented')

    async def ping_loop(self):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'ping loop')

    def receive(self):
        raise NotSupported('receive() not implemented')

    def handle_message(self, message):
        raise NotSupported('handle_message() not implemented')

    def closed(self):
        raise NotSupported('closed() not implemented')

    async def send(self, message):
        raise NotSupported('send() not implemented')

    async def close(self, code=1000):
        raise NotSupported('close() not implemented')

    def create_connection(self, session):
        raise NotSupported('create_connection() not implemented')

    def log(self, *args):
        print(*args)
