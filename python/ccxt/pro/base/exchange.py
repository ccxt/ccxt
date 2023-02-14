# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '2.7.94'

# -----------------------------------------------------------------------------

from ccxt.pro.base.functions import inflate, inflate64, gunzip
from ccxt.pro.base.fast_client import FastClient
from ccxt.pro.base.future import Future
from ccxt.async_support.base.exchange import Exchange as BaseExchange
from ccxt import NotSupported, ExchangeError, BaseError
from ccxt.pro.base.order_book import OrderBook, IndexedOrderBook, CountedOrderBook
from ccxt.async_support.base.throttler import Throttler
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

    newUpdates = True

    @staticmethod
    def inflate(data):
        return inflate(data)

    @staticmethod
    def inflate64(data):
        return inflate64(data)

    @staticmethod
    def gunzip(data):
        return gunzip(data)

    def order_book(self, snapshot={}, depth=None):
        return OrderBook(snapshot, depth)

    def indexed_order_book(self, snapshot={}, depth=None):
        return IndexedOrderBook(snapshot, depth)

    def counted_order_book(self, snapshot={}, depth=None):
        return CountedOrderBook(snapshot, depth)

    def client(self, url):
        self.clients = self.clients or {}
        if url not in self.clients:
            on_message = self.handle_message
            on_error = self.on_error
            on_close = self.on_close
            on_connected = self.on_connected
            # decide client type here: aiohttp ws / websockets / signalr / socketio
            ws_options = self.safe_value(self.options, 'ws', {})
            options = self.extend(self.streaming, {
                'log': getattr(self, 'log'),
                'ping': getattr(self, 'ping', None),
                'verbose': self.verbose,
                'throttle': Throttler(self.tokenBucket, self.asyncio_loop),
                'asyncio_loop': self.asyncio_loop,
            }, ws_options)
            self.clients[url] = FastClient(url, on_message, on_error, on_close, on_connected, options)
        return self.clients[url]

    def spawn(self, method, *args):
        def callback(asyncio_future):
            exception = asyncio_future.exception()
            if exception is None:
                future.resolve(asyncio_future.result())
            else:
                future.reject(exception)
        future = Future()
        task = self.asyncio_loop.create_task(method(*args))
        task.add_done_callback(callback)
        return future

    def delay(self, timeout, method, *args):
        return self.asyncio_loop.call_later(timeout / 1000, self.spawn, method, *args)

    def handle_message(self, client, message):
        always = True
        if always:
            raise NotSupported(self.id + '.handle_message() not implemented yet')
        return {}

    def watch(self, url, message_hash, message=None, subscribe_hash=None, subscription=None):
        backoff_delay = 0
        client = self.client(url)
        future = client.future(message_hash)

        # base exchange self.open starts the aiohttp Session in an async context
        self.open()
        connected = client.connected if client.connected.done() \
            else asyncio.ensure_future(client.connect(self.session, backoff_delay))

        def after(fut):
            if subscribe_hash not in client.subscriptions:
                client.subscriptions[subscribe_hash] = subscription or True
                # todo: decouple signing from subscriptions
                options = self.safe_value(self.options, 'ws')
                cost = self.safe_value(options, 'cost', 1)
                if message:
                    async def send_message():
                        if self.enableRateLimit:
                            await client.throttle(cost)
                        try:
                            await client.send(message)
                        except ConnectionError as e:
                            future.reject(e)
                    asyncio.ensure_future(send_message())

        connected.add_done_callback(after)

        return future

    def on_connected(self, client, message=None):
        # for user hooks
        # print('Connected to', client.url)
        pass

    def on_error(self, client, error):
        if client.url in self.clients and self.clients[client.url].error:
            del self.clients[client.url]

    def on_close(self, client, error):
        if client.error:
            # connection closed due to an error
            pass
        else:
            # server disconnected a working connection
            if client.url in self.clients:
                del self.clients[client.url]

    async def close(self):
        if self.clients:
            await asyncio.wait([asyncio.create_task(client.close()) for client in self.clients.values()], return_when=asyncio.ALL_COMPLETED)
            for url in self.clients.copy():
                del self.clients[url]
        await super(Exchange, self).close()

    def find_timeframe(self, timeframe, timeframes=None):
        timeframes = timeframes if timeframes else self.timeframes
        for key, value in timeframes.items():
            if value == timeframe:
                return key
        return None

    async def load_order_book(self, client, messageHash, symbol, limit=None, params={}):
        if symbol not in self.orderbooks:
            client.reject(ExchangeError(self.id + ' loadOrderBook() orderbook is not initiated'), messageHash)
            return
        try:
            maxRetries = self.handle_option('watchOrderBook', 'maxRetries', 3)
            tries = 0
            stored = self.orderbooks[symbol]
            while tries < maxRetries:
                cache = stored.cache
                order_book = await self.fetch_order_book(symbol, limit, params)
                index = self.get_cache_index(order_book, cache)
                if index >= 0:
                    stored.reset(order_book)
                    self.handle_deltas(stored, cache[index:])
                    cache.clear()
                    client.resolve(stored, messageHash)
                    return
                tries += 1
            client.reject(ExchangeError(self.id + ' nonce is behind cache after ' + str(maxRetries) + ' tries.'), messageHash)
            del self.clients[client.url]
        except BaseError as e:
            client.reject(e, messageHash)
            await self.load_order_book(client, messageHash, symbol, limit, params)

    def handle_deltas(self, orderbook, deltas):
        for delta in deltas:
            self.handle_delta(orderbook, delta)

    def handle_delta(self, orderbook, delta):
        raise NotSupported(self.id + ' handleDelta() is not supported')

    async def watch_ticker(self, symbol, params={}):
        raise NotSupported(self.id + '.watch_ticker() not implemented yet')

    async def watch_order_book(self, symbol, limit=None, params={}):
        raise NotSupported(self.id + '.watch_order_book() not implemented yet')

    async def watch_trades(self, symbol, since=None, limit=None, params={}):
        raise NotSupported(self.id + '.watch_trades() not implemented yet')

    async def watch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        raise NotSupported(self.id + '.watch_ohlcv() not implemented yet')

    async def watch_balance(self, params={}):
        raise NotSupported(self.id + '.watch_balance() not implemented yet')

    async def watch_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + '.watch_orders() not implemented yet')

    async def watch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + '.watch_my_trades() not implemented yet')
