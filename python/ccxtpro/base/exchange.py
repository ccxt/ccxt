# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '0.3.45'

# -----------------------------------------------------------------------------

from ccxtpro.base.functions import inflate, inflate64, gunzip
from ccxtpro.base.fast_client import FastClient
from ccxt.async_support import Exchange as BaseExchange
from ccxt import NotSupported
from ccxtpro.base.order_book import OrderBook, IndexedOrderBook, CountedOrderBook
from ccxt.async_support.base.throttle import throttle
import asyncio

# -----------------------------------------------------------------------------

__all__ = [
    'BaseExchange',
    'Exchange',
]

# -----------------------------------------------------------------------------


class Exchange(BaseExchange):

    clients = {}

    # streaming-specific options
    streaming = {
        'keepAlive': 30000,
        'ping': None,
        'maxPingPongMisses': 2.0,
    }

    @staticmethod
    def inflate(data):
        return inflate(data)

    @staticmethod
    def inflate64(data):
        return inflate64(data)

    @staticmethod
    def gunzip(data):
        return gunzip(data)

    def order_book(self, snapshot={}, depth=float('inf')):
        return OrderBook(snapshot, depth)

    def indexed_order_book(self, snapshot={}, depth=float('inf')):
        return IndexedOrderBook(snapshot, depth)

    def counted_order_book(self, snapshot={}, depth=float('inf')):
        return CountedOrderBook(snapshot, depth)

    def client(self, url):
        self.clients = self.clients or {}
        if url not in self.clients:
            on_message = self.handle_message
            on_error = self.on_error
            on_close = self.on_close
            # decide client type here: aiohttp ws / websockets / signalr / socketio
            ws_options = self.safe_value(self.options, 'ws', {})
            options = self.extend(self.streaming, {
                'print': getattr(self, 'print'),
                'ping': getattr(self, 'ping', None),
                'verbose': self.verbose,
                'throttle': throttle(self.extend({
                    'loop': self.asyncio_loop,
                }, self.tokenBucket)),
                'asyncio_loop': self.asyncio_loop,
            }, ws_options)
            self.clients[url] = FastClient(url, on_message, on_error, on_close, options)
        return self.clients[url]

    async def after(self, future, method, *args):
        # method is bound to self instance
        return method(await future, *args)

    async def after_async(self, future, method, *args):
        return await method(await future, *args)

    async def after_dropped(self, future, method, *args):
        await future
        return await method(*args)

    async def spawn_async(self, method, *args):
        try:
            await method(*args)
        except Exception:
            # todo: handle spawned errors
            pass

    async def delay_async(self, timeout, method, *args):
        await self.sleep(timeout)
        try:
            await method(*args)
        except Exception:
            # todo: handle spawned errors
            pass

    def spawn(self, method, *args):
        asyncio.ensure_future(self.spawn_async(method, *args))

    def delay(self, timeout, method, *args):
        asyncio.ensure_future(self.delay_async(timeout, method, *args))

    def handle_message(self, client, message):
        always = True
        if always:
            raise NotSupported(self.id + '.handle_message() not implemented yet')
        return {}

    def sign_message(self, client, message_hash, message):
        always = True
        if always:
            raise NotSupported(self.id + '.sign_message() not implemented yet')
        return {}

    async def watch(self, url, message_hash, message=None, subscribe_hash=None, subscription=None):
        backoff_delay = 0
        # base exchange self.open starts the aiohttp Session in an async context
        client = self.client(url)
        self.open()
        await client.connect(self.session, backoff_delay)
        if subscribe_hash not in client.subscriptions:
            client.subscriptions[subscribe_hash] = subscription or True
            if self.enableRateLimit:
                options = self.safe_value(self.options, 'ws', {})
                rateLimit = self.safe_integer(options, 'rateLimit', self.rateLimit)
                await client.throttle(rateLimit)
            # todo: decouple signing from subscriptions
            if message:
                message = self.sign_message(client, message_hash, message)
                await client.send(message)
        return await client.future(message_hash)

    def on_error(self, client, error):
        if client.url in self.clients and self.clients[client.url].error:
            del self.clients[client.url]

    def on_close(self, client, error):
        if client.error:
            # connection closed due to an error, do nothing
            pass
        else:
            # server disconnected a working connection
            if client.url in self.clients:
                del self.clients[client.url]

    def limit_order_book(self, orderbook, symbol, limit=None, params={}):
        return orderbook.limit(limit)

    async def close(self):
        if self.clients:
            await asyncio.wait([client.close() for client in self.clients.values()], return_when=asyncio.ALL_COMPLETED)
        await super(Exchange, self).close()
