# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.0.0'

# -----------------------------------------------------------------------------

import asyncio
from ccxtpro.base.streaming_client_aiohttp import StreamingClientAiohttp
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

    # def limitedCountedOrderBook(self, snapshot={}, depth=None):
    #     return LimitedCountedOrderBook(snapshot, depth)

    def countedOrderBook(self, snapshot={}):
        return CountedOrderBook(snapshot)

    def client(self, url):
        self.clients = self.clients or {}
        if url not in self.clients:
            on_message = self.handle_message
            on_error = self.on_ws_error
            on_close = self.on_ws_close
            # decide client type here: aiohttp ws / websockets / signalr
            self.clients[url] = StreamingClientAiohttp(url, on_message, on_error, on_close)
        return self.clients[url]

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

    def on_ws_error(self, client, error):
        if self.clients[client.url].error:
            del self.clients[client.url]

    def on_ws_close(self, client, error):
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

    # -------------------------------------------------------------------------

    # def handle_message(self, client, response):
    #     message_hash = self.get_ws_message_hash(client, response)
    #     if message_hash not in client.futures:
    #         self.handle_dropped(client, response, message_hash)
    #         return
    #     future = client.futures[message_hash]
    #     future.resolve(response)

    # def handle_dropped(self, client, response, message_hash):
    #     pass

    # @classmethod
    # def define_ws_api(cls, has):
    #     methods = [name[name.index('Ws'):] for name, has in has.items() if has and 'Ws' in name]

    #     def key_closure(k):
    #         async def ws_x_message(_self, url, message_hash, subscribe=None):
    #             result = await WebSocketClient.registerFuture(url, message_hash, _self.handle_message, _self.apiKey, subscribe, _self.asyncio_loop)
    #             return getattr(_self, 'handle_' + k)(result)
    #         return ws_x_message
    #     for key in methods:
    #         setattr(cls, key + 'Message', key_closure(cls.underscore(key)))

    # def __repr__(self):
    #     return 'ccxtpro.' + self.id + '()'
    #
