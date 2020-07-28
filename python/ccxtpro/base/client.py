# -*- coding: utf-8 -*-

from asyncio import sleep, ensure_future, wait_for, gather, TimeoutError
from ccxt.async_support import Exchange
from ccxt import NetworkError, RequestTimeout, NotSupported
from ccxtpro.base.future import Future


class Client(object):

    url = None
    ws = None
    futures = {}
    subscriptions = {}
    on_message_callback = None
    on_error_callback = None
    on_close_callback = None
    connectionStarted = None
    connectionEstablished = None
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

    def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, config={}):
        defaults = {
            'url': url,
            'futures': {},
            'subscriptions': {},
            'on_message_callback': on_message_callback,
            'on_error_callback': on_error_callback,
            'on_close_callback': on_close_callback,
        }
        settings = {}
        settings.update(defaults)
        settings.update(config)
        for key in settings:
            if hasattr(self, key) and isinstance(getattr(self, key), dict):
                setattr(self, key, Exchange.deep_extend(getattr(self, key), settings[key]))
            else:
                setattr(self, key, settings[key])
        # connection-related Future
        self.connected = Future()

    def future(self, message_hash):
        if isinstance(message_hash, list):
            first_hash = message_hash[0]
            if first_hash not in self.futures:
                future = Future()
                self.futures[first_hash] = future
                i = 1
                length = len(message_hash)
                while i < length:
                    hash = message_hash[i]
                    self.futures[hash] = future
                    i += 1
            return self.futures[first_hash]
        else:
            if message_hash not in self.futures:
                self.futures[message_hash] = Future()
            return self.futures[message_hash]

    def resolve(self, result, message_hash=None):
        if message_hash:
            if message_hash in self.futures:
                future = self.futures[message_hash]
                future.resolve(result)
                del self.futures[message_hash]
        else:
            message_hashes = list(self.futures.keys())
            for message_hash in message_hashes:
                self.resolve(result, message_hash)
        return result

    def reject(self, result, message_hash=None):
        if message_hash:
            if message_hash in self.futures:
                future = self.futures[message_hash]
                future.reject(result)
                del self.futures[message_hash]
        else:
            message_hashes = list(self.futures.keys())
            for message_hash in message_hashes:
                self.reject(result, message_hash)
        return result

    def receive_loop(self):
        def done_callback(completed_future):
            try:
                message = completed_future.result()
                self.handle_message(message)
            except Exception as e:
                error = NetworkError(str(e))
                if self.verbose:
                    self.print(Exchange.iso8601(Exchange.milliseconds()), 'receive_loop', 'Exception', error)
                self.reset(error)
            if not self.closed():
                # recurse forever
                future = ensure_future(self.receive())
                future.add_done_callback(done_callback)

        if self.verbose:
            self.print(Exchange.iso8601(Exchange.milliseconds()), 'receive loop')
        future = ensure_future(self.receive())
        future.add_done_callback(done_callback)

    async def open(self, session, backoff_delay=0):
        # exponential backoff for consequent connections if necessary
        if backoff_delay:
            await sleep(backoff_delay)
        if self.verbose:
            self.print(Exchange.iso8601(Exchange.milliseconds()), 'connecting to', self.url, 'with timeout', self.connectionTimeout, 'ms')
        self.connectionStarted = Exchange.milliseconds()
        try:
            coroutine = self.create_connection(session)
            self.connection = await wait_for(coroutine, timeout=int(self.connectionTimeout / 1000))
            self.connecting = False
            if self.verbose:
                self.print(Exchange.iso8601(Exchange.milliseconds()), 'connected')
            self.connected.resolve(self.url)
            self.receive_loop()
            self.ping_loop()
        except TimeoutError as e:
            # connection timeout
            error = RequestTimeout('Connection timeout')
            if self.verbose:
                self.print(Exchange.iso8601(Exchange.milliseconds()), 'RequestTimeout', error)
            self.on_error(error)
        except Exception as e:
            # connection failed or rejected (ConnectionRefusedError, ClientConnectorError)
            error = NetworkError(e)
            if self.verbose:
                self.print(Exchange.iso8601(Exchange.milliseconds()), 'NetworkError', error)
            self.on_error(error)

    async def connect(self, session, backoff_delay=0):
        if not self.connection and not self.connecting:
            self.connecting = True
            await self.open(session, backoff_delay)
        return await self.connected

    def on_error(self, error):
        if self.verbose:
            self.print(Exchange.iso8601(Exchange.milliseconds()), 'on_error', error)
        self.error = error
        self.reset(error)
        self.on_error_callback(self, error)
        if not self.closed():
            ensure_future(self.close(1006))

    def on_close(self, code):
        if self.verbose:
            self.print(Exchange.iso8601(Exchange.milliseconds()), 'on_close', code)
        if not self.error:
            self.reset(NetworkError(code))
        self.on_close_callback(self, code)
        if not self.closed():
            ensure_future(self.close(code))

    def reset(self, error):
        self.connected.reject(error)
        self.reject(error)

    async def ping_loop(self):
        if self.verbose:
            self.print(Exchange.iso8601(Exchange.milliseconds()), 'ping loop')
        pass

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
        if True:
            raise NotSupported('create_connection() not implemented')
        return False

    def print(self, *args):
        print(*args)
