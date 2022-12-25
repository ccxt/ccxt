# -*- coding: utf-8 -*-

from asyncio import sleep, ensure_future, wait_for, TimeoutError
from .functions import milliseconds, iso8601, deep_extend
from ccxt import NetworkError, RequestTimeout, NotSupported
from ccxt.pro.base.future import Future


class Client(object):

    url = None
    ws = None
    futures = {}
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
    asyncio_loop = None
    ping_looper = None
    receive_looper = None

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
        if message_hash:
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

    async def receive_loop(self):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'receive loop')
        while not self.closed():
            try:
                message = await self.receive()
                # self.log(iso8601(milliseconds()), 'received', message)
                self.handle_message(message)
            except Exception as e:
                error = NetworkError(str(e))
                if self.verbose:
                    self.log(iso8601(milliseconds()), 'receive_loop', 'Exception', error)
                self.reset(error)

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
            self.receive_looper = ensure_future(self.receive_loop(), loop=self.asyncio_loop)
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

    def connect(self, session, backoff_delay=0):
        if not self.connection and not self.connecting:
            self.connecting = True
            ensure_future(self.open(session, backoff_delay), loop=self.asyncio_loop)
        return self.connected

    def on_error(self, error):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'on_error', error)
        self.error = error
        self.reset(error)
        self.on_error_callback(self, error)
        if not self.closed():
            ensure_future(self.close(1006), loop=self.asyncio_loop)

    def on_close(self, code):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'on_close', code)
        if not self.error:
            self.reset(NetworkError('Connection closed by remote server, closing code ' + str(code)))
        self.on_close_callback(self, code)
        if not self.closed():
            ensure_future(self.close(code), loop=self.asyncio_loop)

    def reset(self, error):
        self.reject(error)

    async def ping_loop(self):
        if self.verbose:
            self.log(iso8601(milliseconds()), 'ping loop')

    def receive(self):
        raise NotSupported('receive() not implemented')

    def handle_message(self, message):
        raise NotSupported('handle_message() not implemented')

    def closed(self):
        raise NotSupported('closed() not implemented')

    def send(self, message):
        raise NotSupported('send() not implemented')

    async def close(self, code=1000):
        raise NotSupported('close() not implemented')

    def create_connection(self, session):
        raise NotSupported('create_connection() not implemented')

    def log(self, *args):
        print(*args)
