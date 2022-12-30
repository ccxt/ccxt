# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '2.4.79'

# -----------------------------------------------------------------------------

from ccxt.pro.base.functions import inflate, inflate64, gunzip
from ccxt.pro.base.fast_client import FastClient
from ccxt.async_support.base.exchange import Exchange as BaseExchange
from ccxt import NotSupported
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
