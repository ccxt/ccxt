# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '2.4.26'

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
    'WsConnector',
]

# -----------------------------------------------------------------------------


class WsConnector:

    clients = {}
    options = {}
    get_verbose_mode = None
    get_token_bucket = None
    get_keep_alive = None
    get_enable_rate_limit = None
    get_max_ping_pong_misses = None
    get_inflate = None
    get_gunzip = None
    asyncio_loop = None
    handle_message = None
    ping = None
    log = None
    open = None
    get_session = None
    get_loop = None
    get_cost = None

    def __init__(self, options):
        self.options = options
        self.get_verbose_mode = options.get('get_verbose_mode')
        self.get_enable_rate_limit = options.get('get_enable_rate_limit')
        self.get_max_ping_pong_misses = options.get('get_max_ping_pong_misses')
        self.get_token_bucket = options.get('get_token_bucket')
        self.get_inflate = options.get('get_inflate')
        self.get_gunzip = options.get('get_gunzip')
        self.get_keep_alive = options.get('get_keep_alive')
        self.handle_message = options.get('handle_message')
        self.ping = options.get('ping')
        self.log = options.get('log')
        self.open = options.get('open')
        self.get_session = options.get('get_session')
        self.get_loop = options.get('get_loop')
        self.get_cost = options.get('get_cost')

    # # streaming-specific options
    # streaming = {
    #     # 'keepAlive': 30000,
    #     # 'ping': None,
    #     # 'maxPingPongMisses': 2.0,
    # }

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

    def orderBook(self, snapshot={}, depth=None):  # tmp duplication
        return OrderBook(snapshot, depth)

    def indexed_order_book(self, snapshot={}, depth=None):
        return IndexedOrderBook(snapshot, depth)

    def indexedOrderBook(self, snapshot={}, depth=None):  # tmp duplication
        return IndexedOrderBook(snapshot, depth)

    def counted_order_book(self, snapshot={}, depth=None):
        return CountedOrderBook(snapshot, depth)

    def countedOrderBook(self, snapshot={}, depth=None):  # tmp duplication
        return CountedOrderBook(snapshot, depth)

    def client(self, url):
        self.clients = self.clients or {}
        if url not in self.clients:
            on_message = self.handle_message
            on_error = self.on_error
            on_close = self.on_close
            on_connected = self.on_connected
            # decide client type here: aiohttp ws / websockets / signalr / socketio
            # ws_options = BaseExchange.safe_value(self.options, 'ws', {})
            options = {
                'log': self.log,
                'ping': getattr(self, 'ping', None),
                'get_verbose_mode': self.get_verbose_mode,
                'get_keep_alive': self.get_keep_alive,
                'get_enable_rate_limit': self.get_enable_rate_limit,
                'get_max_ping_pong_misses': self.get_max_ping_pong_misses,
                'get_inflate': self.get_inflate,
                'get_gunzip': self.get_gunzip,
                'throttle': Throttler(self.get_token_bucket(), self.get_loop()),
                'asyncio_loop': self.get_loop(),
            }
            self.clients[url] = FastClient(url, on_message, on_error, on_close, on_connected, options)
        return self.clients[url]

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
            else asyncio.ensure_future(client.connect(self.get_session(), backoff_delay))

        def after(fut):
            if subscribe_hash not in client.subscriptions:
                client.subscriptions[subscribe_hash] = subscription or True
                # todo: decouple signing from subscriptions
                cost = self.get_cost()
                if message:
                    async def send_message():
                        if self.get_enable_rate_limit():
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
