# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.0.0'

# -----------------------------------------------------------------------------

import asyncio
from ccxtpro.base.aiohttp_client import AiohttpClient
from ccxt.async_support import Exchange as BaseExchange
from ccxt import NotSupported
from ccxtpro.base.order_book import OrderBook, LimitedOrderBook, IndexedOrderBook, LimitedIndexedOrderBook, CountedOrderBook


# -----------------------------------------------------------------------------

__all__ = [
    'BaseExchange',
    'Exchange',
]

# -----------------------------------------------------------------------------


class Exchange(BaseExchange):

    clients = {}

    def orderbook(self, snapshot={}):
        return OrderBook(snapshot)

    def limitedOrderBook(self, snapshot={}, depth=None):
        return LimitedOrderBook(snapshot, depth)

    def indexedOrderBook(self, snapshot={}):
        return IndexedOrderBook(snapshot)

    def limitedIndexedOrderBook(self, snapshot={}, depth=None):
        return LimitedIndexedOrderBook(snapshot, depth)

    # todo: implement in python
    # def limitedCountedOrderBook(self, snapshot={}, depth=None):
    #     return LimitedCountedOrderBook(snapshot, depth)

    def countedOrderBook(self, snapshot={}):
        return CountedOrderBook(snapshot)

    def client(self, url):
        self.clients = self.clients or {}
        if url not in self.clients:
            on_message = self.handle_message
            on_error = self.on_error
            on_close = self.on_close
            # decide client type here: aiohttp ws / websockets / signalr / socketio
            self.clients[url] = AiohttpClient(url, on_message, on_error, on_close)
        return self.clients[url]

    async def after(self, future, method, *args):
        result = await future
        return method(result, *args)

    def handle_message(self, client, message):
        always = True
        if always:
            raise NotSupported(self.id + '.handle_message() not implemented yet')
        return {}

    def sign_ws_message(self, client, message_hash, message):
        always = True
        if always:
            raise NotSupported(self.id + '.sign_ws_message() not implemented yet')
        return {}

    async def connect_ws_client(self, client, message_hash, message=None, subscribe_hash=None):
        # todo: calculate the backoff using the clients cache
        backoff_delay = 0
        try:
            await client.connect(self.session, backoff_delay)
            if message and (subscribe_hash not in client.subscriptions):
                client.subscriptions[subscribe_hash] = True
                # todo: decouple signing from subscriptions
                message = self.sign_ws_message(client, message_hash, message)
                await client.send(message)
        except Exception as e:
            client.reject(e, message_hash)
            print(self.iso8601(self.milliseconds()), 'connect_ws_client', 'Exception', e)

    def watch(self, url, message_hash, message=None, subscribe_hash=None):
        client = self.client(url)
        future = client.future(message_hash)
        # we intentionally do not use await here to avoid unhandled exceptions
        # the policy is to make sure that 100% of promises are resolved or rejected
        asyncio.ensure_future(self.connect_ws_client(client, message_hash, message, subscribe_hash))
        return future

    def on_error(self, client, error):
        if self.clients[client.url].error:
            del self.clients[client.url]

    def on_close(self, client, error):
        print('someone called us')
        # sys.exit()
        if client.error:
            # connection closed due to an error, do nothing
            pass
        else:
            # server disconnected a working connection
            if client.url in self.clients:
                del self.clients[client.url]

    async def close(self):
        keys = list(self.clients.keys())
        for key in keys:
            await self.clients[key].close()
            del self.clients[key]
        return await super(Exchange, self).close()
