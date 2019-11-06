# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.0.0'

# -----------------------------------------------------------------------------

from ccxtpro.base.web_socket_client import WebSocketClient
from ccxt.async_support.base.exchange import Exchange as BaseExchange

# -----------------------------------------------------------------------------

__all__ = [
    'BaseExchange',
    'Exchange',
]

# -----------------------------------------------------------------------------


class Exchange(BaseExchange):

    def handle_ws_message(self, client, response):
        message_hash = self.get_ws_message_hash(client, response)
        if message_hash not in client.futures:
            self.handle_ws_dropped(client, response, message_hash)
            return
        future = client.futures[message_hash]
        future.resolve(response)

    def handle_ws_dropped(self, client, response, message_hash):
        pass

    @classmethod
    def define_ws_api(cls, has):
        methods = [name[name.index('Ws'):] for name, has in has.items() if has and 'Ws' in name]

        def key_closure(k):
            async def ws_x_message(_self, url, message_hash, subscribe=None):
                result = await WebSocketClient.registerFuture(url, message_hash, _self.handle_ws_message, _self.apiKey, subscribe, _self.asyncio_loop)
                return getattr(_self, 'handle_' + k)(result)
            return ws_x_message
        for key in methods:
            setattr(cls, key + 'Message', key_closure(cls.underscore(key)))
